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

@app.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request):
    return templates.TemplateResponse(request=request, name="scenarios.html")

@app.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request):
    # Create insights.html similar to scenarios.html
    return templates.TemplateResponse(request=request, name="insights.html")

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    # Create settings.html similar to scenarios.html
    return templates.TemplateResponse(request=request, name="settings.html")