from fastapi import Request, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import models

def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Checks the session cookie and returns the logged-in user."""
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user