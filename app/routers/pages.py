from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.templates import templates
from app.core.database import get_db
from app.routers.deps import get_current_user
from app import models
import app.core.constants as constants 

router = APIRouter()

# --- GENERAL ---
@router.get("/", response_class=HTMLResponse)
async def home_page(request: Request, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    
    # Fetch the user's scenarios from MySQL (only if logged in)
    scenarios = []
    if user:
        scenarios = db.query(models.Scenario).filter(models.Scenario.user_id == user.id).all()
        
    return templates.TemplateResponse(
        request=request, name="home.html",
        context={"scenarios": scenarios, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

# --- SIMULATION ---
@router.get("/simulator", response_class=HTMLResponse)
async def advanced_simulator_page(request: Request, user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="simulator.html",
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

@router.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    
    # Fetch the user's scenarios from MySQL
    scenarios = []
    if user:
        scenarios = db.query(models.Scenario).filter(models.Scenario.user_id == user.id).all()
        
    return templates.TemplateResponse(
        request=request, name="scenarios.html", 
        context={"scenarios": scenarios, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

# --- MARKET INTELLIGENCE ---
@router.get("/market-overview", response_class=HTMLResponse)
async def market_overview_page(request: Request, user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="market_overview.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

@router.get("/market-performance", response_class=HTMLResponse)
async def market_performance_page(request: Request, user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="market_performance.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

@router.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request, user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="insights.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

@router.get("/simulation-ideas", response_class=HTMLResponse)
async def simulation_ideas_page(request: Request, user: models.User = Depends(get_current_user)):
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="simulation_ideas.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )

# --- ACCOUNT ---
@router.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request, user: models.User = Depends(get_current_user)):
    # If no user is logged in, redirect to login
    if not user:
        return RedirectResponse(url="/login", status_code=303)
        
    daily_quote, daily_plant = constants.get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="settings.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": user}
    )


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, user: models.User = Depends(get_current_user)):
    # If the user is already logged in, send them home
    if user:
        return RedirectResponse(url="/", status_code=303)
    return templates.TemplateResponse(request=request, name="login.html")

@router.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request, user: models.User = Depends(get_current_user)):
    if user:
        return RedirectResponse(url="/", status_code=303)
    return templates.TemplateResponse(request=request, name="signup.html")