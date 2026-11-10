from fastapi import APIRouter
from pydantic import BaseModel
import copy
import app.core.constants as constants

router = APIRouter()

class ScenarioCreate(BaseModel):
    name: str
    icon: str
    theme: str
    initial: float
    monthly: float
    annual_rate: float
    years: int

@router.post("/api/scenarios")
async def create_scenario(scenario: ScenarioCreate):
    new_id = max([s["id"] for s in constants.MOCK_DB], default=0) + 1
    new_scenario = {
        "id": new_id, "name": scenario.name, "icon": scenario.icon, "theme": scenario.theme,
        "initial": scenario.initial, "monthly": scenario.monthly, "annual_rate": scenario.annual_rate,
        "years": scenario.years, "created": "Nov 08, 2026", "status": "Active",
        "gain": "+€0", "percent": "(+0.0%)",
        "final_value": f"€{(scenario.initial + scenario.monthly * 12 * scenario.years):,.0f}",
        "chart_path": "M0,40 L20,35 L40,30 L60,25 L80,20 L100,15"
    }
    constants.MOCK_DB.insert(0, new_scenario)
    return {"status": "success", "message": "Saved to database"}

@router.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: int):
    constants.MOCK_DB = [s for s in constants.MOCK_DB if s["id"] != scenario_id]
    return {"status": "success"}



@router.post("/api/scenarios/{scenario_id}/duplicate")
async def duplicate_scenario(scenario_id: int):
    global MOCK_DB
    original = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if original:
        new_copy = copy.deepcopy(original)
        new_copy["id"] = max([s["id"] for s in MOCK_DB], default=0) + 1
        new_copy["name"] = f"Copy of {original['name']}"
        new_copy["created"] = "Nov 08, 2026"
        MOCK_DB.insert(0, new_copy)
        return {"status": "success"}
    return {"status": "error", "message": "Not found"}


class RenamePayload(BaseModel):
    name: str

@router.patch("/api/scenarios/{scenario_id}/rename")
async def rename_scenario(scenario_id: int, payload: RenamePayload):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["name"] = payload.name
        return {"status": "success"}
    return {"status": "error"}

@router.patch("/api/scenarios/{scenario_id}/archive")
async def archive_scenario(scenario_id: int):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["status"] = "Archived"
        return {"status": "success"}
    return {"status": "error"}

@router.patch("/api/scenarios/{scenario_id}/restore")
async def restore_scenario(scenario_id: int):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["status"] = "Active"
        return {"status": "success"}
    return {"status": "error"}

