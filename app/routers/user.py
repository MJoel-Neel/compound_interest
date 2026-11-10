# app/routers/user.py
from fastapi import APIRouter, Request, File, UploadFile, Form, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Literal, Optional
import datetime
import shutil
import app.core.constants as constants

router = APIRouter()

class UserSettingsUpdate(BaseModel):
    setting: Literal['currency', 'time_range', 'theme', 'portfolio_alerts', 'market_updates', 'product_updates']
    value: str | bool 

@router.post("/api/settings")
async def save_setting(data: UserSettingsUpdate):
    if data.setting == 'currency' and data.value not in ['EUR', 'USD', 'GBP']:
        raise HTTPException(status_code=400, detail="Invalid currency code.")
    return {"status": "success"}

@router.get("/api/logout")
async def logout():
    constants.GLOBAL_MOCK_USER = None
    return RedirectResponse(url="/", status_code=303)

@router.delete("/api/delete-account")
async def delete_account():
    constants.GLOBAL_MOCK_USER = None
    return {"status": "success"}

@router.post("/api/forgot-password")
async def forgot_password(email: str = Form(...)):
    # In a real app, you would check if the email exists in the database
    # and generate a secure token to send via email.
    
    print(f"Password reset requested for: {email}")
    
    # We always return success for security reasons 
    # (so hackers can't guess which emails are registered)
    return {"status": "success", "message": "If an account exists, a reset link has been sent."}



@router.post("/api/update-profile")
async def update_profile(
    name: str = Form(...), email: str = Form(...),
    current_password: str = Form(None), new_password: str = Form(None),
    avatar: UploadFile = File(None)
):
    if constants.GLOBAL_MOCK_USER is None:
        return {"status": "error", "message": "Not logged in"}
        
    if new_password:
        if current_password != constants.GLOBAL_MOCK_USER.get("password"):
            return {"status": "error", "message": "Incorrect current password."}
        constants.GLOBAL_MOCK_USER["password"] = new_password
        
    constants.GLOBAL_MOCK_USER["name"] = name
    constants.GLOBAL_MOCK_USER["email"] = email
    name_parts = name.split()
    constants.GLOBAL_MOCK_USER["initials"] = "".join([n[0] for n in name_parts[:2]]).upper() if name_parts else "U"
    
    if avatar and avatar.filename:
        file_extension = avatar.filename.split(".")[-1]
        filename = f"avatar_{constants.GLOBAL_MOCK_USER['initials']}_{int(datetime.datetime.now().timestamp())}.{file_extension}"
        filepath = f"static/uploads/{filename}"
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
        constants.GLOBAL_MOCK_USER["avatar"] = f"/{filepath}"

    return {"status": "success", "message": "Profile updated successfully"}