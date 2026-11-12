# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. The URL for the SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# 2. Create the engine (connect_args is needed for SQLite)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a session maker (each request gets its own session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create the Base class (all our models will inherit from this)
Base = declarative_base()

# 5. Dependency to get the DB session in our routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()