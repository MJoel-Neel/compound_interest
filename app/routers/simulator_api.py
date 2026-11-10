# app/routers/simulator.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.calculations import calculate_compound_interest
import app.core.constants as constants

router = APIRouter()

class SimulationInput(BaseModel):
    initial: float
    monthly: float
    annual_rate: float
    years: int

@router.post("/api/simulate")
async def simulate_investment(data: SimulationInput):
    return calculate_compound_interest(data.initial, data.monthly, data.annual_rate, data.years)

@router.get("/api/scenarios/{scenario_id}/details")
async def get_scenario_details(scenario_id: int):
    scenario = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
    if not scenario:
        return {"status": "error", "message": "Not found"}
    
    math_results = calculate_compound_interest(
        float(scenario["initial"]), float(scenario["monthly"]), float(scenario["annual_rate"]), int(scenario["years"])
    )
    return {
        "scenario_name": scenario["name"], "theme": scenario["theme"],
        "breakdown": {
            "initial": float(scenario["initial"]),
            "monthly_total": math_results["total_invested"] - float(scenario["initial"]),
            "interest_earned": math_results["gains"],
            "final_balance": math_results["final_balance"],
            "total_invested": math_results["total_invested"]
        },
        "chart": math_results["chart"]
    }