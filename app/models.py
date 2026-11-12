# app/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    avatar = Column(String(255), nullable=True)

    # Relationships
    scenarios = relationship("Scenario", back_populates="owner")
    settings = relationship("UserSettings", back_populates="user", uselist=False) 


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True) 
    
    currency = Column(String(10), default="EUR")
    time_range = Column(String(10), default="20")
    theme = Column(String(20), default="light")
    
    portfolio_alerts = Column(Boolean, default=True)
    market_updates = Column(Boolean, default=True)
    product_updates = Column(Boolean, default=True)

    # Relationship back to user
    user = relationship("User", back_populates="settings")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # The Magic Link
    
    name = Column(String(255), index=True)
    icon = Column(String(50), default="fa-arrow-trend-up")
    theme = Column(String(50), default="success")
    
    initial = Column(Float)
    monthly = Column(Float)
    annual_rate = Column(Float)
    years = Column(Integer)
    
    compounding_frequency = Column(String(50), default="Monthly")
    inflation_rate = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationship to user
    owner = relationship("User", back_populates="scenarios")