import datetime


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


