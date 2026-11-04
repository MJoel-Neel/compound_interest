# What If I Invest? 💰

A full-stack investment simulator built with Python, FastAPI, SQLite, and vanilla JavaScript.

## Features
- Calculate compound interest with monthly contributions
- Visualize growth with interactive charts
- Save, load, and delete investment scenarios

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, SQLite
- **Frontend:** HTML, CSS, JavaScript, Chart.js

## Setup Instructions
1. Clone the repository
2. Create a virtual environment: `python -m venv .venv`
3. Activate it: `source .venv/bin/activate`
4. Install dependencies: `pip install -r backend/requirements.txt`
5. Create a `.env` file (see `.env.example`)
6. Run the server: `uvicorn backend.app.main:app --reload`