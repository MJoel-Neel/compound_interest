from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from app.core.templates import templates
import app.core.constants as constants # <-- Import the module, NOT the variables

router = APIRouter()

# --- GENERAL ---
@router.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="home.html",
        # Use constants.MOCK_DB instead of MOCK_DB
        context={"scenarios": constants.MOCK_DB, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

# --- SIMULATION ---
@router.get("/simulator", response_class=HTMLResponse)
async def advanced_simulator_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="simulator.html",
        context={"scenarios": constants.MOCK_DB, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="scenarios.html", 
        context={"scenarios": constants.MOCK_DB, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

# --- MARKET INTELLIGENCE ---
@router.get("/market-overview", response_class=HTMLResponse)
async def market_overview_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="market_overview.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/market-performance", response_class=HTMLResponse)
async def market_performance_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="market_performance.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="insights.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/simulation-ideas", response_class=HTMLResponse)
async def simulation_ideas_page(request: Request):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="simulation_ideas.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

# --- ACCOUNT ---
@router.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    if constants.GLOBAL_MOCK_USER is None:
        return RedirectResponse(url="/login", status_code=303)
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="settings.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")

@router.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse(request=request, name="signup.html")