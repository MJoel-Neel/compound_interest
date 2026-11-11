from fastapi import APIRouter
from pydantic import BaseModel
import copy
import app.core.constants as constants
from app.services.calculations import calculate_compound_interest, format_compact_currency
from typing import Optional



router = APIRouter()

class ScenarioCreate(BaseModel):
    name: str
    icon: str
    theme: str
    initial: float
    monthly: float
    annual_rate: float
    years: int
    # Add advanced fields (default to 0 if coming from Home page)
    compounding_frequency: Optional[str] = "Monthly"
    inflation_rate: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.0


@router.post("/api/scenarios")
async def create_scenario(scenario: ScenarioCreate):
    new_id = max([s["id"] for s in constants.MOCK_DB], default=0) + 1
    
    math_results = calculate_compound_interest(
        initial=scenario.initial,
        monthly=scenario.monthly,
        annual_rate=scenario.annual_rate,
        years=scenario.years,
        compounding_frequency=scenario.compounding_frequency,
        inflation_rate=scenario.inflation_rate,
        tax_rate=scenario.tax_rate
    )
    kpis = math_results["kpis"]

    # 1. Format Gains (No extra € symbol)
    net_gains = kpis['net_balance'] - kpis['total_invested']
    gain_str = f"+{format_compact_currency(net_gains)}"
    
    # 2. Format Percentage (Prevents 1.2409e+30% overflow)
    percent_val = (net_gains / scenario.initial * 100) if scenario.initial > 0 else 0
    if percent_val > 99999:
        percent_str = "(+>99999%)"
    else:
        percent_str = f"(+{percent_val:.1f}%)"
        
    # 3. Format Final Value (No extra € symbol)
    final_val_str = format_compact_currency(kpis['net_balance'])

    new_scenario = {
        "id": new_id, "name": scenario.name, "icon": scenario.icon, "theme": scenario.theme,
        "initial": scenario.initial, "monthly": scenario.monthly, "annual_rate": scenario.annual_rate,
        "years": scenario.years, 
        "compounding_frequency": scenario.compounding_frequency,
        "inflation_rate": scenario.inflation_rate,
        "tax_rate": scenario.tax_rate,
        "created": "Nov 08, 2026", "status": "Active",
        "gain": gain_str, "percent": percent_str, "final_value": final_val_str,
        "chart_path": "M0,40 L20,35 L40,30 L60,25 L80,20 L100,15"
    }
    constants.MOCK_DB.insert(0, new_scenario)
    return {"status": "success", "message": "Saved to database"}


@router.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: int):
    # Use slice assignment to modify the list IN PLACE
    constants.MOCK_DB[:] = [s for s in constants.MOCK_DB if s["id"] != scenario_id]
    return {"status": "success"}

@router.post("/api/scenarios/{scenario_id}/duplicate")
async def duplicate_scenario(scenario_id: int):
    # Removed 'global MOCK_DB' as we access it via constants
    original = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
    if original:
        new_copy = copy.deepcopy(original)
        new_copy["id"] = max([s["id"] for s in constants.MOCK_DB], default=0) + 1
        new_copy["name"] = f"Copy of {original['name']}"
        new_copy["created"] = "Nov 08, 2026"
        constants.MOCK_DB.insert(0, new_copy)
        return {"status": "success"}
    return {"status": "error", "message": "Not found"}

class RenamePayload(BaseModel):
    name: str

@router.patch("/api/scenarios/{scenario_id}/rename")
async def rename_scenario(scenario_id: int, payload: RenamePayload):
    scenario = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["name"] = payload.name
        return {"status": "success"}
    return {"status": "error"}

@router.patch("/api/scenarios/{scenario_id}/archive")
async def archive_scenario(scenario_id: int):
    scenario = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["status"] = "Archived"
        return {"status": "success"}
    return {"status": "error"}

@router.patch("/api/scenarios/{scenario_id}/restore")
async def restore_scenario(scenario_id: int):
    scenario = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["status"] = "Active"
        return {"status": "success"}
    return {"status": "error"}