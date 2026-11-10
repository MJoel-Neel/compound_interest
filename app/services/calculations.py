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
