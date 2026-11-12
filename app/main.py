# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

# --- NEW LINES FOR DATABASE ---
from app.core.database import engine, Base
from app import models # Import models so SQLAlchemy knows they exist
# ------------------------------

# Import all your routers
from app.routers import pages, scenarios, simulator, user, export

load_dotenv() # Load .env

app = FastAPI()

# --- CREATE TABLES IN MYSQL ---
models.Base.metadata.create_all(bind=engine)
# ------------------------------

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include the routers
app.include_router(pages.router)
app.include_router(scenarios.router)
app.include_router(simulator.router)
app.include_router(user.router)
app.include_router(export.router)