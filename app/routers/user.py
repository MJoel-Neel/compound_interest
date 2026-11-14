from fastapi import APIRouter, Request, Form, Depends, HTTPException, File, UploadFile
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal
import shutil
import datetime

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
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user or not verify_password(password, user.hashed_password):
        return {"status": "error", "message": "Invalid email or password"}

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
async def delete_account(request: Request, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user:
        db.delete(current_user)
        db.commit()
        request.session.clear()
    return {"status": "success"}

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

    # RESTORED AVATAR LOGIC using shutil and datetime
    if avatar and avatar.filename:
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if avatar.content_type not in allowed_types:
            return {"status": "error", "message": "Only JPG, PNG, and WEBP are allowed."}
            
        file_extension = avatar.filename.split(".")[-1]
        filename = f"avatar_{current_user.id}_{int(datetime.datetime.now().timestamp())}.{file_extension}"
        filepath = f"static/uploads/{filename}"
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
            
        current_user.avatar = f"/{filepath}"

    db.commit()
    return {"status": "success", "message": "Profile updated successfully"}