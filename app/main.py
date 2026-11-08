from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Optional

app = FastAPI()

# 1. Serve static files (css, js, images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Setup Jinja2 Templates
templates = Jinja2Templates(directory="templates")

# 3. Define Routes
@app.get("/", response_class=HTMLResponse)
async def simulator_page(request: Request):
    """Renders the main simulator page."""
    
    # We can read the query parameters here later to do the math!
    # For now, we just render the HTML.
    
    return templates.TemplateResponse(
        request=request, 
        name="simulator.html", 
        context={}
    )

@app.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request):
    # Create insights.html similar to scenarios.html
    return templates.TemplateResponse(request=request, name="insights.html")

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    # Create settings.html similar to scenarios.html
    return templates.TemplateResponse(request=request, name="settings.html")

@app.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request):
    # This is our mock database for now. 
    # Later, you will fetch this from SQLAlchemy!
    mock_scenarios = [
        {
            "name": "Long Term Growth",
            "created": "Oct 12, 2026",
            "status": "Active",
            "gain": "+€28,450",
            "percent": "+56.9%",
            "final_value": "€78,450",
            "theme": "success",  # Tailwind color
            "icon": "fa-arrow-trend-up",
            "chart_path": "M0,40 Q10,45 20,30 T40,25 T60,15 T80,10 T100,5"
        },
        {
            "name": "Conservative Plan",
            "created": "Sep 28, 2026",
            "status": "Active",
            "gain": "+€8,230",
            "percent": "+16.4%",
            "final_value": "€58,230",
            "theme": "primary",
            "icon": "fa-shield-halved",
            "chart_path": "M0,40 L20,35 L40,30 L60,20 L80,15 L100,10"
        },
        {
            "name": "Retirement Plan",
            "created": "Aug 15, 2026",
            "status": "Archived",
            "gain": "+€92,120",
            "percent": "+184.2%",
            "final_value": "€142,120",
            "theme": "purple-500",
            "icon": "fa-briefcase",
            "chart_path": "M0,45 Q20,40 30,35 T50,25 T70,15 T90,10 L100,5"
        },
        {
            "name": "Dream Portfolio",
            "created": "Jul 20, 2026",
            "status": "Active",
            "gain": "+€15,760",
            "percent": "+37.6%",
            "final_value": "€72,760",
            "theme": "success",
            "icon": "fa-star",
            "chart_path": "M0,35 L15,38 L30,30 L45,32 L60,20 L75,15 L90,18 L100,10"
        }
    ]
    
    return templates.TemplateResponse(
        request=request, 
        name="scenarios.html", 
        context={"scenarios": mock_scenarios} # Pass the data here!
    )