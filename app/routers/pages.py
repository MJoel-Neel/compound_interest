# app/routers/pages.py
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from app.core.templates import templates
from app.core.constants import MOCK_DB, GLOBAL_MOCK_USER, get_daily_sidebar_data
import app.core.constants as constants

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="simulator.html", # We'll rename this later
        context={"scenarios": MOCK_DB, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="scenarios.html", 
        context={"scenarios": MOCK_DB, "daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, name="insights.html", 
        context={"daily_quote": daily_quote, "daily_plant": daily_plant, "user": constants.GLOBAL_MOCK_USER}
    )

@router.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    if constants.GLOBAL_MOCK_USER is None:
        return RedirectResponse(url="/login", status_code=303)
    daily_quote, daily_plant = get_daily_sidebar_data()
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