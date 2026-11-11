# app/services/calculations.py

def calculate_compound_interest(
    initial: float, 
    monthly: float, 
    annual_rate: float, 
    years: int,
    compounding_frequency: str = "Monthly",
    inflation_rate: float = 0.0,
    tax_rate: float = 0.0
):
    """
    Calculates compound interest with advanced parameters.
    Returns a comprehensive dictionary containing KPIs, chart data, and a year-by-year table.
    """
    
    # 1. Determine how many times interest is applied per year
    if compounding_frequency == "Annually":
        compounds_per_year = 1
    elif compounding_frequency == "Quarterly":
        compounds_per_year = 4
    else: # Default to Monthly
        compounds_per_year = 12
        
    months_per_compound = 12 // compounds_per_year
    period_rate = (annual_rate / 100) / compounds_per_year

    # 2. Setup tracking variables
    current_balance = initial
    total_invested = initial
    
    chart_labels = ["0"]
    chart_invested = [initial]
    chart_balance = [initial]
    
    table_data = []

    # 3. Month-by-Month Simulation
    for year in range(1, years + 1):
        year_start_balance = current_balance
        year_contributions = 0
        year_interest = 0

        for month in range(1, 13):
            # Add monthly contribution
            current_balance += monthly
            total_invested += monthly
            year_contributions += monthly

            # Apply interest only when the compounding period ends
            # (e.g., if quarterly, only apply interest in month 3, 6, 9, 12)
            if month % months_per_compound == 0:
                interest_earned = current_balance * period_rate
                current_balance += interest_earned
                year_interest += interest_earned

        # --- End of Year Calculations ---
        
        # Calculate Real (Inflation-Adjusted) Balance for this specific year
        # Formula: Real = Nominal / (1 + inflation)^year
        inflation_multiplier = (1 + (inflation_rate / 100)) ** year
        real_balance = current_balance / inflation_multiplier

        # Append to Chart Data
        chart_labels.append(str(year))
        chart_invested.append(round(total_invested))
        chart_balance.append(round(current_balance))

        # Append to Table Data
        table_data.append({
            "year": year,
            "start_balance": round(year_start_balance),
            "contributions": round(year_contributions),
            "interest": round(year_interest),
            "end_balance": round(current_balance),
            "real_balance": round(real_balance)
        })

    # 4. Final KPI Calculations
    gross_balance = current_balance
    total_gains = gross_balance - total_invested
    
    # Calculate Tax (only on positive gains)
    tax_owed = (total_gains * (tax_rate / 100)) if total_gains > 0 else 0
    net_balance = gross_balance - tax_owed
    
    # Calculate CAGR (Compound Annual Growth Rate)
    # Formula: (Ending Value / Beginning Value) ^ (1 / Years) - 1
    if total_invested > 0 and years > 0:
        cagr = (((gross_balance / total_invested) ** (1 / years)) - 1) * 100
    else:
        cagr = 0.0

    # Calculate Real Value of the final Net Balance
    final_inflation_multiplier = (1 + (inflation_rate / 100)) ** years
    real_net_balance = net_balance / final_inflation_multiplier

    # 5. Return everything
    return {
        "kpis": {
            "gross_balance": round(gross_balance),
            "total_invested": round(total_invested),
            "gross_gains": round(total_gains),
            "tax_owed": round(tax_owed),
            "net_balance": round(net_balance),
            "real_net_balance": round(real_net_balance),
            "cagr": round(cagr, 2)
        },
        "chart": {
            "labels": chart_labels,
            "balance_data": chart_balance,
            "invested_data": chart_invested
        },
        "table": table_data
    }



def format_compact_currency(num: float) -> str:
    if num is None: return "€0"
    
    is_negative = num < 0
    abs_num = abs(num)
    prefix = "-€" if is_negative else "€"
    
    if abs_num >= 1e15: return f"{prefix}{abs_num / 1e15:.2f}Q"
    if abs_num >= 1e12: return f"{prefix}{abs_num / 1e12:.2f}T"
    if abs_num >= 1e9: return f"{prefix}{abs_num / 1e9:.2f}B"
    if abs_num >= 1e6: return f"{prefix}{abs_num / 1e6:.2f}M"
    if abs_num >= 1e3: return f"{prefix}{abs_num / 1e3:.2f}k"
    return f"{prefix}{abs_num:,.0f}"