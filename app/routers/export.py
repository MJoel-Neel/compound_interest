from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv
import zipfile
from typing import Optional

from app.core.database import get_db
from app.routers.deps import get_current_user
from app import models

router = APIRouter()

@router.get("/api/export-data")
async def export_data(
    scenario_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Compounding", "Inflation", "Tax", "Status", "Final Value"])
    
    filename = "all_scenarios.csv"

    if scenario_id:
        # Export Single
        scenario = db.query(models.Scenario).filter(
            models.Scenario.id == scenario_id,
            models.Scenario.user_id == user.id
        ).first()
        
        if scenario:
            writer.writerow([
                scenario.id, scenario.name, scenario.initial, scenario.monthly, 
                scenario.annual_rate, scenario.years, scenario.compounding_frequency, 
                scenario.inflation_rate, scenario.tax_rate, scenario.status, scenario.final_value
            ])
            filename = f"scenario_{scenario.id}_{scenario.name.replace(' ', '_')}.csv"
    else:
        # Export All for this user
        scenarios = db.query(models.Scenario).filter(models.Scenario.user_id == user.id).all()
        for s in scenarios:
            writer.writerow([
                s.id, s.name, s.initial, s.monthly, 
                s.annual_rate, s.years, s.compounding_frequency, 
                s.inflation_rate, s.tax_rate, s.status, s.final_value
            ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/api/export-full-data")
async def export_full_data(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        
        # 1. USER INFO CSV
        user_csv = io.StringIO()
        w = csv.writer(user_csv)
        w.writerow(["Field", "Value"])
        w.writerow(["Name", user.name])
        w.writerow(["Email", user.email])
        zip_file.writestr("user_info.csv", user_csv.getvalue())

        # 2. SETTINGS CSV
        settings_csv = io.StringIO()
        w = csv.writer(settings_csv)
        w.writerow(["Setting", "Value"])
        if user.settings:
            w.writerow(["Currency", user.settings.currency])
            w.writerow(["Time Range", user.settings.time_range])
            w.writerow(["Theme", user.settings.theme])
            w.writerow(["Portfolio Alerts", user.settings.portfolio_alerts])
            w.writerow(["Market Updates", user.settings.market_updates])
            w.writerow(["Product Updates", user.settings.product_updates])
        zip_file.writestr("settings.csv", settings_csv.getvalue())

        # 3. SCENARIOS CSV
        scenarios_csv = io.StringIO()
        w = csv.writer(scenarios_csv)
        w.writerow(["ID", "Name", "Initial", "Monthly", "Rate", "Years", "Compounding", "Inflation", "Tax", "Status", "Final Value"])
        
        scenarios = db.query(models.Scenario).filter(models.Scenario.user_id == user.id).all()
        for s in scenarios:
            w.writerow([
                s.id, s.name, s.initial, s.monthly, 
                s.annual_rate, s.years, s.compounding_frequency, 
                s.inflation_rate, s.tax_rate, s.status, s.final_value
            ])
        zip_file.writestr("all_scenarios.csv", scenarios_csv.getvalue())

        # 4. PORTFOLIO SUMMARY (Mocked for now, can be calculated later)
        portfolio_csv = io.StringIO()
        w = csv.writer(portfolio_csv)
        w.writerow(["Metric", "Value"])
        w.writerow(["Total Scenarios", len(scenarios)])
        zip_file.writestr("portfolio_summary.csv", portfolio_csv.getvalue())

    zip_buffer.seek(0)
    return StreamingResponse(
        iter([zip_buffer.getvalue()]), 
        media_type="application/zip", 
        headers={"Content-Disposition": "attachment; filename=WhatIfIInvest_FullExport.zip"}
    )