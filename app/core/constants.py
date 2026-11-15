import datetime

# 1 Financial Quotes
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
    plant_index = (today % 5) + 1
    
    return quote, plant_index