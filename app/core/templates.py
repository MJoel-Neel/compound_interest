from fastapi.templating import Jinja2Templates
from app.services.calculations import format_compact_currency


templates = Jinja2Templates(directory="templates")
# Register the function as a Jinja filter
templates.env.filters["compact_currency"] = format_compact_currency