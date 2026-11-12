# app/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar = Column(String, nullable=True)

    # Relationship to scenarios (one user has many scenarios)
    scenarios = relationship("Scenario", back_populates="owner")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # The Magic Link
    
    name = Column(String, index=True)
    icon = Column(String, default="fa-arrow-trend-up")
    theme = Column(String, default="success")
    
    initial = Column(Float)
    monthly = Column(Float)
    annual_rate = Column(Float)
    years = Column(Integer)
    
    compounding_frequency = Column(String, default="Monthly")
    inflation_rate = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to user
    owner = relationship("User", back_populates="scenarios")