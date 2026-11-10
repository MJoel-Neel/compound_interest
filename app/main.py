from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

# Import all your routers
from app.routers import pages, scenarios, simulator, user, export

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="super-secret-school-project-key")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include the routers to connect them to the app
app.include_router(pages.router)
app.include_router(scenarios.router)
app.include_router(simulator.router)
app.include_router(user.router)
app.include_router(export.router)