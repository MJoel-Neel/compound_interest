from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import io
import csv
import copy

app = FastAPI()

# 1. Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Setup Jinja2 Templates
templates = Jinja2Templates(directory="templates")

# ==========================================
# GLOBAL MOCK DATABASE (Replaces SQLAlchemy for now)
# ==========================================
MOCK_DB = [
    {
        "id": 1, "name": "Long Term Growth", "icon": "fa-arrow-trend-up", "theme": "success",
        "initial": 1000, "monthly": 200, "annual_rate": 7, "years": 20,
        "created": "Oct 12, 2026", "status": "Active", "gain": "+€28,450", "percent": "+56.9%", "final_value": "€78,450",
        "chart_path": "M0,40 Q10,45 20,30 T40,25 T60,15 T80,10 T100,5"
    },
    {
        "id": 2, "name": "Conservative Plan", "icon": "fa-shield-halved", "theme": "primary",
        "initial": 500, "monthly": 150, "annual_rate": 4, "years": 15,
        "created": "Sep 28, 2026", "status": "Active", "gain": "+€8,230", "percent": "+16.4%", "final_value": "€58,230",
        "chart_path": "M0,40 L20,35 L40,30 L60,20 L80,15 L100,10"
    },
    {
        "id": 3, "name": "Retirement Plan", "icon": "fa-briefcase", "theme": "purple-500",
        "initial": 2000, "monthly": 250, "annual_rate": 6, "years": 30,
        "created": "Aug 15, 2026", "status": "Archived", "gain": "+€92,120", "percent": "+184.2%", "final_value": "€142,120",
        "chart_path": "M0,45 Q20,40 30,35 T50,25 T70,15 T90,10 L100,5"
    },
    {
        "id": 4, "name": "Dream Portfolio", "icon": "fa-star", "theme": "success",
        "initial": 5000, "monthly": 500, "annual_rate": 8, "years": 20,
        "created": "Jul 20, 2026", "status": "Active", "gain": "+€15,760", "percent": "+37.6%", "final_value": "€72,760",
        "chart_path": "M0,35 L15,38 L30,30 L45,32 L60,20 L75,15 L90,18 L100,10"
    },
    {
        "id": 5, "name": "Crypto Play", "icon": "fa-rocket", "theme": "warning",
        "initial": 200, "monthly": 50, "annual_rate": 15, "years": 5,
        "created": "Jun 10, 2026", "status": "Active", "gain": "+€2,100", "percent": "+85.0%", "final_value": "€5,100",
        "chart_path": "M0,45 L10,40 L20,45 L30,30 L40,35 L50,20 L60,25 L70,10 L80,15 L90,5 L100,0"
    },
    {
        "id": 6, "name": "House Fund", "icon": "fa-piggy-bank", "theme": "error",
        "initial": 10000, "monthly": 1000, "annual_rate": 3, "years": 10,
        "created": "May 05, 2026", "status": "Archived", "gain": "+€12,000", "percent": "+20.0%", "final_value": "€130,000",
        "chart_path": "M0,40 L20,35 L40,30 L60,25 L80,20 L100,15"
    }
]

# ==========================================
# HTML ROUTES (SSR)
# ==========================================

@app.get("/", response_class=HTMLResponse)
async def simulator_page(request: Request):
    # Pass the first 5 scenarios to the simulator page widget
    return templates.TemplateResponse(
        request=request, 
        name="simulator.html", 
        context={"scenarios": MOCK_DB}
    )

@app.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request):
    # Pass the full list to the main scenarios page
    return templates.TemplateResponse(
        request=request, 
        name="scenarios.html", 
        context={"scenarios": MOCK_DB} 
    )

@app.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request):
    return templates.TemplateResponse(request=request, name="insights.html")

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    return templates.TemplateResponse(request=request, name="settings.html")

# ==========================================
# API ENDPOINTS (AJAX/JS)
# ==========================================

class ScenarioCreate(BaseModel):
    name: str
    icon: str
    theme: str
    initial: float
    monthly: float
    annual_rate: float
    years: int

@app.post("/api/scenarios")
async def create_scenario(scenario: ScenarioCreate):
    # Generate a new ID
    new_id = max([s["id"] for s in MOCK_DB], default=0) + 1
    
    # Create the new dictionary (Adding fake calculated data for the UI)
    new_scenario = {
        "id": new_id,
        "name": scenario.name,
        "icon": scenario.icon,
        "theme": scenario.theme,
        "initial": scenario.initial,
        "monthly": scenario.monthly,
        "annual_rate": scenario.annual_rate,
        "years": scenario.years,
        "created": "Nov 08, 2026", # In a real app, use datetime.now()
        "status": "Active",
        "gain": "+€0", # You would run your math logic here
        "percent": "(+0.0%)",
        "final_value": f"€{(scenario.initial + scenario.monthly * 12 * scenario.years):,.0f}",
        "chart_path": "M0,40 L20,35 L40,30 L60,25 L80,20 L100,15" # Default chart
    }
    
    # Add to our mock DB
    MOCK_DB.insert(0, new_scenario)
    return {"status": "success", "message": "Saved to database"}

@app.delete("/api/scenarios/{scenario_id}")
async def delete_scenario(scenario_id: int):
    global MOCK_DB
    MOCK_DB = [s for s in MOCK_DB if s["id"] != scenario_id]
    return {"status": "success", "message": "Deleted successfully"}

@app.post("/api/scenarios/{scenario_id}/duplicate")
async def duplicate_scenario(scenario_id: int):
    global MOCK_DB
    # Find the original scenario
    original = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    
    if original:
        # Create a copy, change the ID and Name
        new_copy = copy.deepcopy(original)
        new_copy["id"] = max([s["id"] for s in MOCK_DB], default=0) + 1
        new_copy["name"] = f"Copy of {original['name']}"
        new_copy["created"] = "Nov 08, 2026"
        MOCK_DB.insert(0, new_copy)
        return {"status": "success"}
    
    return {"status": "error", "message": "Not found"}

class RenamePayload(BaseModel):
    name: str

@app.patch("/api/scenarios/{scenario_id}/rename")
async def rename_scenario(scenario_id: int, payload: RenamePayload):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["name"] = payload.name
        return {"status": "success"}
    return {"status": "error"}

@app.patch("/api/scenarios/{scenario_id}/archive")
async def archive_scenario(scenario_id: int):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["status"] = "Archived"
        return {"status": "success"}
    return {"status": "error"}

@app.patch("/api/scenarios/{scenario_id}/restore")
async def restore_scenario(scenario_id: int):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if scenario:
        scenario["status"] = "Active"
        return {"status": "success"}
    return {"status": "error"}

# ==========================================
# SETTINGS & EXPORT ENDPOINTS
# ==========================================

@app.post("/api/settings")
async def save_setting(request: Request):
    data = await request.json()
    # Here, you would save this to your SQLAlchemy User model
    print(f"User updated setting: {data}")
    return {"status": "success"}

@app.get("/api/export-data")
async def export_data():
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Status"])
    
    # Write data from our mock DB
    for s in MOCK_DB:
        writer.writerow([s["id"], s["name"], s["initial"], s["monthly"], s["annual_rate"], s["years"], s["status"]])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=my_financial_data.csv"}
    )