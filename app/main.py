from fastapi import FastAPI, Request, File, UploadFile, Form
from fastapi.responses import HTMLResponse, StreamingResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import io
import csv
import copy
import datetime
from typing import Optional
import zipfile
import os
import shutil




app = FastAPI()

# 1. Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Setup Jinja2 Templates
templates = Jinja2Templates(directory="templates")

# ==========================================
# GLOBAL MOCK DATABASE
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
# GLOBAL MOCK STATE (For UI Testing)
# ==========================================
# Change this to None to test the "Sign In" button
# Change this to a dictionary to test the "Log out" button

GLOBAL_MOCK_USER = {
    "name": "Marie-Joel ALLOHAN", 
    "email": "mjoel.allohan@gmail.com", 
    "initials": "MJ",
    "password": "password123",
    "avatar": None  
}


# ==========================================
# HTML ROUTES
# ==========================================

@app.get("/", response_class=HTMLResponse)
async def simulator_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, 
        name="simulator.html", 
        context={
            "scenarios": MOCK_DB, 
            "daily_quote": daily_quote, 
            "daily_plant": daily_plant,
            "user": GLOBAL_MOCK_USER  
        }
    )

@app.get("/scenarios", response_class=HTMLResponse)
async def scenarios_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, 
        name="scenarios.html", 
        context={
            "scenarios": MOCK_DB, 
            "daily_quote": daily_quote, 
            "daily_plant": daily_plant,
            "user": GLOBAL_MOCK_USER
        }
    )

# ... do the exact same for /insights and /settings ...

@app.get("/insights", response_class=HTMLResponse)
async def insights_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    return templates.TemplateResponse(
        request=request, 
        name="insights.html",
        context={"daily_quote": daily_quote, "daily_plant": daily_plant,
            "user": GLOBAL_MOCK_USER } 
    )



@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="login.html")

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse(request=request, name="signup.html")

# ==========================================
# API ENDPOINTS
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
    new_id = max([s["id"] for s in MOCK_DB], default=0) + 1
    new_scenario = {
        "id": new_id,
        "name": scenario.name,
        "icon": scenario.icon,
        "theme": scenario.theme,
        "initial": scenario.initial,
        "monthly": scenario.monthly,
        "annual_rate": scenario.annual_rate,
        "years": scenario.years,
        "created": "Nov 08, 2026",
        "status": "Active",
        "gain": "+€0",
        "percent": "(+0.0%)",
        "final_value": f"€{(scenario.initial + scenario.monthly * 12 * scenario.years):,.0f}",
        "chart_path": "M0,40 L20,35 L40,30 L60,25 L80,20 L100,15"
    }
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

class SimulationInput(BaseModel):
    initial: float
    monthly: float
    annual_rate: float
    years: int

def calculate_compound_interest(initial: float, monthly: float, annual_rate: float, years: int):
    monthly_rate = (annual_rate / 100) / 12
    balance_data = [initial]
    invested_data = [initial]
    labels = ["0"]
    current_balance = initial
    current_invested = initial
    
    for year in range(1, years + 1):
        for _ in range(12):
            current_balance += (current_balance * monthly_rate) + monthly
            current_invested += monthly
        balance_data.append(round(current_balance))
        invested_data.append(round(current_invested))
        labels.append(str(year))

    total_interest = current_balance - current_invested
    return {
        "final_balance": current_balance,
        "total_invested": current_invested,
        "gains": total_interest,
        "chart": {
            "labels": labels,
            "balance_data": balance_data,
            "invested_data": invested_data
        }
    }

@app.post("/api/simulate")
async def simulate_investment(data: SimulationInput):
    return calculate_compound_interest(data.initial, data.monthly, data.annual_rate, data.years)

@app.get("/api/scenarios/{scenario_id}/details")
async def get_scenario_details(scenario_id: int):
    scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
    if not scenario:
        return {"status": "error", "message": "Not found"}

    math_results = calculate_compound_interest(
        float(scenario["initial"]), 
        float(scenario["monthly"]), 
        float(scenario["annual_rate"]), 
        int(scenario["years"])
    )
    
    total_monthly = math_results["total_invested"] - float(scenario["initial"])
    return {
        "scenario_name": scenario["name"],
        "theme": scenario["theme"],
        "breakdown": {
            "initial": float(scenario["initial"]),
            "monthly_total": total_monthly,
            "interest_earned": math_results["gains"],
            "final_balance": math_results["final_balance"],
            "total_invested": math_results["total_invested"]
        },
        "chart": math_results["chart"]
    }

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    daily_quote, daily_plant = get_daily_sidebar_data()
    
    # 1. PRO WAY: Protect the route
    if GLOBAL_MOCK_USER is None:
        # Redirect to login if not authenticated
        return RedirectResponse(url="/login", status_code=303)
        
    return templates.TemplateResponse(
        request=request, 
        name="settings.html",
        context={
            "daily_quote": daily_quote, 
            "daily_plant": daily_plant,
            "user": GLOBAL_MOCK_USER 
        } 
    )

@app.get("/api/export-data")
async def export_data(scenario_id: Optional[int] = None):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Status", "Final Value"])
    
    filename = "all_scenarios.csv"

    # 1. DEFENSIVE PROGRAMMING: Safe Currency Dictionary
    CURRENCY_SYMBOLS = {
        "EUR": "€",
        "USD": "$",
        "GBP": "£"
    }
    
    # 2. GET USER PREFERENCE (Simulated here)
    # In a real app, this would come from the database (e.g., user.currency)
    # If a hacker sends "RUEE", `.get()` will safely fall back to "€"
    user_currency = "RUEE" # Try changing this to "USD" to see the magic
    symbol = CURRENCY_SYMBOLS.get(user_currency, "€")

    # Helper function to clean the hardcoded strings and apply the new symbol
    def format_currency(value_str):
        # Removes the existing "€" or any non-numeric characters (except commas/decimals)
        clean_num = str(value_str).replace("€", "").replace("$", "").replace("£", "").strip()
        return f"{symbol}{clean_num}"

    if scenario_id:
        scenario = next((s for s in MOCK_DB if s["id"] == scenario_id), None)
        if scenario:
            writer.writerow([
                scenario["id"], 
                scenario["name"], 
                format_currency(scenario["initial"]), 
                format_currency(scenario["monthly"]), 
                f"{scenario['annual_rate']}%", 
                scenario["years"], 
                scenario["status"], 
                format_currency(scenario["final_value"])
            ])
            # Safe filename generation
            safe_name = str(scenario['name']).replace(' ', '_').replace('/', '_')
            filename = f"scenario_{scenario_id}_{safe_name}.csv"
    else:
        for s in MOCK_DB:
            writer.writerow([
                s["id"], 
                s["name"], 
                format_currency(s["initial"]), 
                format_currency(s["monthly"]), 
                f"{s['annual_rate']}%", 
                s["years"], 
                s["status"], 
                format_currency(s["final_value"])
            ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/api/export-full-data")
async def export_full_data():
    # Create an in-memory ZIP file
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        
        # --- 1. USER INFO CSV ---
        user_csv = io.StringIO()
        w = csv.writer(user_csv)
        w.writerow(["Field", "Value"])
        if GLOBAL_MOCK_USER:
            w.writerow(["Name", GLOBAL_MOCK_USER.get("name", "")])
            w.writerow(["Email", GLOBAL_MOCK_USER.get("email", "")])
            w.writerow(["Initials", GLOBAL_MOCK_USER.get("initials", "")])
        else:
            w.writerow(["Status", "No active user"])
        zip_file.writestr("user_info.csv", user_csv.getvalue())

        # --- 2. SETTINGS CSV ---
        # Note: Since settings are stored in localStorage (frontend), we mock them here. 
        # In a real app, you would fetch these from the database.
        settings_csv = io.StringIO()
        w = csv.writer(settings_csv)
        w.writerow(["Setting", "Value"])
        w.writerow(["Currency", "EUR"])
        w.writerow(["Time Range", "20 years"])
        w.writerow(["Theme", "System"])
        w.writerow(["Portfolio Alerts", "True"])
        w.writerow(["Market Updates", "True"])
        w.writerow(["Product Updates", "True"])
        zip_file.writestr("settings.csv", settings_csv.getvalue())

        # --- 3. PORTFOLIO SUMMARY CSV ---
        portfolio_csv = io.StringIO()
        w = csv.writer(portfolio_csv)
        w.writerow(["Metric", "Value"])
        w.writerow(["Total Invested", "€49,000"])
        w.writerow(["Total Gain", "€12,410"])
        w.writerow(["Average Return", "11.2%"])
        w.writerow(["Best Year", "20.5%"])
        zip_file.writestr("portfolio_summary.csv", portfolio_csv.getvalue())

        # --- 4. SCENARIOS CSV ---
        scenarios_csv = io.StringIO()
        w = csv.writer(scenarios_csv)
        w.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Status"])
        for s in MOCK_DB:
            w.writerow([
                s["id"], s["name"], s["initial"], 
                s["monthly"], s["annual_rate"], s["years"], s["status"]
            ])
        zip_file.writestr("all_scenarios.csv", scenarios_csv.getvalue())

    zip_buffer.seek(0)
    
    # Return the ZIP file as a download
    return StreamingResponse(
        iter([zip_buffer.getvalue()]), 
        media_type="application/zip", 
        headers={"Content-Disposition": "attachment; filename=WhatIfIInvest_FullExport.zip"}
    )


# 5 Financial Quotes
FINANCIAL_QUOTES = [
    "Save your scenarios to compare and plan your investments.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Compound interest is the eighth wonder of the world.",
    "Do not save what is left after spending; instead spend what is left after saving.",
    "An investment in knowledge pays the best interest."
]

def get_daily_sidebar_data():
    # Get today's date as a number
    today = datetime.date.today().toordinal()
    
    # Pick a quote based on the day (this will change automatically every day)
    quote_index = today % len(FINANCIAL_QUOTES)
    quote = FINANCIAL_QUOTES[quote_index]
    
    # Pick a plant image (1 to 4) based on the day
    plant_index = (today % 4) + 1
    
    return quote, plant_index




@app.post("/api/forgot-password")
async def forgot_password(email: str = Form(...)):
    # In a real app, you would check if the email exists in the database
    # and generate a secure token to send via email.
    
    print(f"Password reset requested for: {email}")
    
    # We always return success for security reasons 
    # (so hackers can't guess which emails are registered)
    return {"status": "success", "message": "If an account exists, a reset link has been sent."}


@app.get("/api/logout")
async def logout():
    # In a real app, you would do: request.session.clear()
    # For now, we just redirect back to the home page
    return RedirectResponse(url="/", status_code=303)


from typing import Literal
from pydantic import BaseModel
from fastapi import HTTPException

# Create a strict validation model
class UserSettingsUpdate(BaseModel):
    # Only allow these exact values for the setting name
    setting: Literal['currency', 'time_range', 'theme', 'portfolio_alerts', 'market_updates', 'product_updates']
    # The value can be a string or a boolean
    value: str | bool 

@app.post("/api/settings")
async def save_setting(data: UserSettingsUpdate):
    # Extra security check: If it's currency, make sure it's a valid currency
    if data.setting == 'currency' and data.value not in ['EUR', 'USD', 'GBP']:
        raise HTTPException(status_code=400, detail="Invalid currency code.")
        
    print(f"Settings saved: {data.setting} = {data.value}")
    return {"status": "success"}


@app.delete("/api/delete-account")
async def delete_account():
    global GLOBAL_MOCK_USER
    
    # In a real app, you would delete the user from the database here:
    # db.query(User).filter(User.id == current_user.id).delete()
    
    # For our mock app, we just log them out and "delete" the global user
    GLOBAL_MOCK_USER = None
    
    return {"status": "success", "message": "Account deleted successfully"}





@app.post("/api/update-profile")
async def update_profile(
    name: str = Form(...),
    email: str = Form(...),
    current_password: str = Form(None),
    new_password: str = Form(None),
    avatar: UploadFile = File(None)
):
    global GLOBAL_MOCK_USER
    if GLOBAL_MOCK_USER is None:
        return {"status": "error", "message": "Not logged in"}
        
    # 1. Handle Password
    if new_password:
        if current_password != GLOBAL_MOCK_USER.get("password"):
            return {"status": "error", "message": "Incorrect current password."}
        GLOBAL_MOCK_USER["password"] = new_password
        
    # 2. Update basic info
    GLOBAL_MOCK_USER["name"] = name
    GLOBAL_MOCK_USER["email"] = email
    name_parts = name.split()
    GLOBAL_MOCK_USER["initials"] = "".join([n[0] for n in name_parts[:2]]).upper() if name_parts else "U"
    
    # 3. Handle Avatar Upload
    if avatar and avatar.filename:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if avatar.content_type not in allowed_types:
            return {"status": "error", "message": "Only JPG, PNG, and WEBP are allowed."}

        # Create a unique filename to prevent caching issues
        file_extension = avatar.filename.split(".")[-1]
        filename = f"avatar_{GLOBAL_MOCK_USER['initials']}_{int(datetime.datetime.now().timestamp())}.{file_extension}"
        filepath = f"static/uploads/{filename}"
        
        # Save the file to the server
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
            
        # Save the URL path to the user dictionary
        GLOBAL_MOCK_USER["avatar"] = f"/{filepath}"

    return {"status": "success", "message": "Profile updated successfully"}