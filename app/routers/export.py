# app/routers/export.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import io, csv, zipfile
from typing import Optional
import app.core.constants as constants

router = APIRouter()


@router.get("/api/export-data")
async def export_data(scenario_id: Optional[int] = None):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Compounding", "Inflation", "Tax", "Status", "Final Value"])
    
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
        scenario = next((s for s in constants.MOCK_DB if s["id"] == scenario_id), None)
        if scenario:
            writer.writerow([
                scenario["id"], scenario["name"], scenario["initial"], 
                scenario["monthly"], scenario["annual_rate"], scenario["years"], 
                scenario.get("compounding_frequency", "Monthly"),
                scenario.get("inflation_rate", 0.0),
                scenario.get("tax_rate", 0.0),
                scenario["status"], scenario["final_value"]
            ])
            # Safe filename generation
            safe_name = str(scenario['name']).replace(' ', '_').replace('/', '_')
            filename = f"scenario_{scenario_id}_{safe_name}.csv"
    else:
        for s in constants.MOCK_DB:
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


@router.get("/api/export-full-data")
async def export_full_data():
    # Create an in-memory ZIP file
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        
        # --- 1. USER INFO CSV ---
        user_csv = io.StringIO()
        w = csv.writer(user_csv)
        w.writerow(["Field", "Value"])
        if constants.GLOBAL_MOCK_USER:
            w.writerow(["Name", constants.GLOBAL_MOCK_USER.get("name", "")])
            w.writerow(["Email", constants.GLOBAL_MOCK_USER.get("email", "")])
            w.writerow(["Initials", constants.GLOBAL_MOCK_USER.get("initials", "")])
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
        w.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Compounding", "Inflation", "Tax", "Status", "Final Value"])
        for s in constants.MOCK_DB:
            w.writerow([
                s["id"], s["name"], s["initial"], 
                s["monthly"], s["annual_rate"], s["years"], 
                s.get("compounding_frequency", "Monthly"),
                s.get("inflation_rate", 0.0),
                s.get("tax_rate", 0.0),
                s["status"], s["final_value"]
            ])
        zip_file.writestr("all_scenarios.csv", scenarios_csv.getvalue())

    zip_buffer.seek(0)
    
    # Return the ZIP file as a download
    return StreamingResponse(
        iter([zip_buffer.getvalue()]), 
        media_type="application/zip", 
        headers={"Content-Disposition": "attachment; filename=WhatIfIInvest_FullExport.zip"}
    )

