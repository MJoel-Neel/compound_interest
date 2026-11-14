from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.services.calculations import calculate_compound_interest
from app.core.database import get_db
from app.routers.deps import get_current_user
from app import models

router = APIRouter()

class SimulationInput(BaseModel):
    initial: float
    monthly: float
    annual_rate: float
    years: int
    compounding_frequency: Optional[str] = "Monthly"
    inflation_rate: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.0

@router.post("/api/simulate")
async def simulate_investment(data: SimulationInput):
    # This endpoint doesn't touch the database, it just runs math
    return calculate_compound_interest(
        initial=data.initial,
        monthly=data.monthly,
        annual_rate=data.annual_rate,
        years=data.years,
        compounding_frequency=data.compounding_frequency,
        inflation_rate=data.inflation_rate,
        tax_rate=data.tax_rate
    )

@router.get("/api/scenarios/{scenario_id}/details")
async def get_scenario_details(
    scenario_id: int, 
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    # 1. Find the scenario in MySQL, ensuring it belongs to the logged-in user
    scenario = db.query(models.Scenario).filter(
        models.Scenario.id == scenario_id,
        models.Scenario.user_id == user.id
    ).first()
    
    if not scenario:
        return {"status": "error", "message": "Not found"}

    # 2. Run the math engine
    math_results = calculate_compound_interest(
        initial=float(scenario.initial), 
        monthly=float(scenario.monthly), 
        annual_rate=float(scenario.annual_rate), 
        years=int(scenario.years),
        compounding_frequency=scenario.compounding_frequency,
        inflation_rate=scenario.inflation_rate,
        tax_rate=scenario.tax_rate
    )
    
    kpis = math_results["kpis"]
    total_monthly = kpis["total_invested"] - float(scenario.initial)
    
    # 3. Return the data (using the same structure your frontend expects)
    return {
        "scenario_name": scenario.name,
        "theme": scenario.theme,
        "advanced": {
            "compounding": scenario.compounding_frequency,
            "inflation": scenario.inflation_rate,
            "tax": scenario.tax_rate
        },
        "breakdown": {
            "initial": float(scenario.initial),
            "monthly_total": total_monthly,
            "interest_earned": kpis["gross_gains"],
            "final_balance": kpis["gross_balance"],
            "total_invested": kpis["total_invested"],
            "net_balance": kpis["net_balance"]
        },
        "chart": math_results["chart"]
    }