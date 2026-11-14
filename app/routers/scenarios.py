from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.routers.deps import get_current_user
from app import models

router = APIRouter()

class ScenarioCreate(BaseModel):
    name: str
    icon: str
    theme: str
    initial: float
    monthly: float
    annual_rate: float
    years: int
    compounding_frequency: Optional[str] = "Monthly"
    inflation_rate: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.0

@router.post("/api/scenarios")
async def create_scenario(
    scenario: ScenarioCreate, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    new_scenario = models.Scenario(
        user_id=user.id,
        name=scenario.name,
        icon=scenario.icon,
        theme=scenario.theme,
        initial=scenario.initial,
        monthly=scenario.monthly,
        annual_rate=scenario.annual_rate,
        years=scenario.years,
        compounding_frequency=scenario.compounding_frequency,
        inflation_rate=scenario.inflation_rate,
        tax_rate=scenario.tax_rate,
        status="Active"
    )
    db.add(new_scenario)
    db.commit()
    return {"status": "success", "message": "Saved to database"}

@router.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(
    scenario_id: int, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
        
    scenario = db.query(models.Scenario).filter(
        models.Scenario.id == scenario_id, 
        models.Scenario.user_id == user.id
    ).first()
    
    if scenario:
        db.delete(scenario)
        db.commit()
    return {"status": "success"}

@router.post("/api/scenarios/{scenario_id}/duplicate")
async def duplicate_scenario(
    scenario_id: int, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    original = db.query(models.Scenario).filter(
        models.Scenario.id == scenario_id, 
        models.Scenario.user_id == user.id
    ).first()
    
    if not original:
        return {"status": "error", "message": "Not found"}

    # Create a new copy
    new_copy = models.Scenario(
        user_id=user.id,
        name=f"Copy of {original.name}",
        icon=original.icon, theme=original.theme,
        initial=original.initial, monthly=original.monthly,
        annual_rate=original.annual_rate, years=original.years,
        compounding_frequency=original.compounding_frequency,
        inflation_rate=original.inflation_rate, tax_rate=original.tax_rate,
        status="Active"
    )
    db.add(new_copy)
    db.commit()
    return {"status": "success"}

class RenamePayload(BaseModel):
    name: str

@router.patch("/api/scenarios/{scenario_id}/rename")
async def rename_scenario(
    scenario_id: int, 
    payload: RenamePayload, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
        
    scenario = db.query(models.Scenario).filter(
        models.Scenario.id == scenario_id, 
        models.Scenario.user_id == user.id
    ).first()
    
    if scenario:
        scenario.name = payload.name
        db.commit()
        return {"status": "success"}
    return {"status": "error"}

@router.patch("/api/scenarios/{scenario_id}/archive")
async def archive_scenario(
    scenario_id: int, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
        
    scenario = db.query(models.Scenario).filter(
        models.Scenario.id == scenario_id, 
        models.Scenario.user_id == user.id
    ).first()
    
    if scenario:
        scenario.status = "Archived"
        db.commit()
        return {"status": "success"}
    return {"status": "error"}

@router.patch("/api/scenarios/{scenario_id}/restore")
async def restore_scenario(
    scenario_id: int, 
    db: Session = Depends(get_db), 
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
        
    scenario = db.query(models.Scenario).filter(
        models.Scenario.id == scenario_id, 
        models.Scenario.user_id == user.id
    ).first()
    
    if scenario:
        scenario.status = "Active"
        db.commit()
        return {"status": "success"}
    return {"status": "error"}