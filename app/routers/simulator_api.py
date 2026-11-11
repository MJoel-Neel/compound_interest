from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.calculations import calculate_compound_interest
import app.core.constants as constants

router = APIRouter()

class SimulationInput(BaseModel):
    initial: float
    monthly: float
    annual_rate: float
    years: int
    # --- NEW ADVANCED PARAMETERS (Optional so Home page still works) ---
    compounding_frequency: Optional[str] = "Monthly"
    inflation_rate: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.0

@router.post("/api/simulate")
async def simulate_investment(data: SimulationInput):
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
async def get_scenario_details(scenario_id: int):
    scenario = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
    if not scenario:
        return {"status": "error", "message": "Not found"}

    math_results = calculate_compound_interest(
        initial=float(scenario["initial"]), 
        monthly=float(scenario["monthly"]), 
        annual_rate=float(scenario["annual_rate"]), 
        years=int(scenario["years"])
    )
    
    kpis = math_results["kpis"]
    
    # Calculate just the monthly contributions part for the breakdown
    total_monthly = kpis["total_invested"] - float(scenario["initial"])
    
    return {
        "scenario_name": scenario["name"],
        "theme": scenario["theme"],
        "breakdown": {
            "initial": float(scenario["initial"]),
            "monthly_total": total_monthly,
            "interest_earned": kpis["gross_gains"], # Updated
            "final_balance": kpis["gross_balance"], # Updated
            "total_invested": kpis["total_invested"] # Updated
        },
        "chart": math_results["chart"]
    }