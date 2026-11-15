from fastapi import APIRouter, Request, Form, Depends, HTTPException, File, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

import os
import shutil
import uuid
from PIL import Image, UnidentifiedImageError

from app.core.database import get_db
from app import models
from app.services.auth_service import get_password_hash, verify_password
from app.routers.deps import get_current_user

router = APIRouter()

# --- AUTHENTICATION ---

@router.post("/api/signup")
async def signup(
    request: Request, 
    name: str = Form(...), 
    email: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        return {"status": "error", "message": "Email already registered"}

    new_user = models.User(
        name=name,
        email=email,
        hashed_password=get_password_hash(password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_settings = models.UserSettings(user_id=new_user.id)
    db.add(new_settings)
    db.commit()

    request.session["user_id"] = new_user.id
    return {"status": "success"}

@router.post("/api/login")
async def login(
    request: Request, 
    email: str = Form(...), 
    password: str = Form(...), 
    remember_me: str = Form(None),
    db: Session = Depends(get_db)
):
    # 1. Find user
    user = db.query(models.User).filter(models.User.email == email).first()

    # 2. Verify Password
    if not user or not verify_password(password, user.hashed_password):
        return {"status": "error", "message": "Invalid email or password"}

    # 3. Set session cookie
    request.session["user_id"] = user.id

    return {"status": "success"}

@router.get("/api/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)

# --- SETTINGS & PROFILE ---

class UserSettingsUpdate(BaseModel):
    setting: Literal['currency', 'time_range', 'theme', 'portfolio_alerts', 'market_updates', 'product_updates']
    value: str | bool 

@router.post("/api/settings")
async def save_setting(
    data: UserSettingsUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not logged in")
        
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = models.UserSettings(user_id=current_user.id)
        db.add(settings)

    setattr(settings, data.setting, data.value)
    db.commit()
    return {"status": "success"}

@router.delete("/api/delete-account")
async def delete_account(
    request: Request, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)):

    if not current_user:
        raise HTTPException(status_code=401, detail="Not logged in")

     # 1. Delete the user from MySQL. 
    # Thanks to the ORM cascade, this automatically deletes:
    # - Their UserSettings
    # - All their Scenarios
    db.delete(current_user)
    db.commit()

    # 2. Clear the session cookie so they are logged out

    request.session.clear()
    
    return {"status": "success", "message": "Account deleted successfully"}



@router.post("/api/update-profile")
async def update_profile(
    name: str = Form(...), 
    email: str = Form(...),
    current_password: str = Form(None), 
    new_password: str = Form(None),
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not current_user:
        return {"status": "error", "message": "Not logged in"}

    current_user.name = name
    current_user.email = email
    
    if new_password:
        if not verify_password(current_password, current_user.hashed_password):
            return {"status": "error", "message": "Incorrect current password."}
        current_user.hashed_password = get_password_hash(new_password)

    if avatar and avatar.filename:
        # 1. FIX FILE SIZE LIMIT (Max 2MB)
        MAX_FILE_SIZE = 2 * 1024 * 1024
        avatar.file.seek(0, os.SEEK_END)
        file_size = avatar.file.tell()
        avatar.file.seek(0) # Reset pointer back to start
        
        if file_size > MAX_FILE_SIZE:
            return {"status": "error", "message": "File size exceeds 2MB limit."}

        # 2. FIX MAGIC BYTES / CONTENT-TYPE SPOOFING
        # We open the file in memory to verify it's actually a valid image
        try:
            image = Image.open(avatar.file)
            image.verify() # Verifies headers without decoding the whole image
        except (UnidentifiedImageError, Exception):
            return {"status": "error", "message": "Invalid image file."}
        
        avatar.file.seek(0) # Reset pointer again for saving

        # 3. FIX UNSAFE EXTENSIONS
        # We map the verified Pillow format to a safe extension
        format_to_ext = {
            "JPEG": ".jpg",
            "PNG": ".png",
            "WEBP": ".webp"
        }
        safe_extension = format_to_ext.get(image.format)
        
        if not safe_extension:
            return {"status": "error", "message": "Only JPG, PNG, and WEBP are allowed."}

        # 4. FIX ORPHANED FILES (Delete old avatar)
        if current_user.avatar:
            old_avatar_path = current_user.avatar.lstrip("/")
            if os.path.exists(old_avatar_path):
                try:
                    os.remove(old_avatar_path)
                except Exception as e:
                    print(f"Failed to delete old avatar: {e}")

        # 5. SAVE THE FILE SECURELY
        # Use a random UUID for the filename to prevent path traversal and overwrite attacks
        random_filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}{safe_extension}"
        filepath = f"static/uploads/{random_filename}"
        
        # Ensure the directory exists
        os.makedirs("static/uploads", exist_ok=True)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
            
        # Update the user in the database
        current_user.avatar = f"/{filepath}"

    db.commit()
    return {"status": "success", "message": "Profile updated successfully"}