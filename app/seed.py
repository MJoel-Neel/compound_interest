from app.core.database import SessionLocal, engine, Base
from app import models
from app.services.auth_service import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        demo_user = db.query(models.User).filter(models.User.email == "demo@whatifinvest.com").first()
        
        if demo_user:
            print("✅ Database already seeded. Skipping...")
            return

        print("🌱 Seeding database...")

        demo_user = models.User(
            name="Demo User",
            email="demo@whatifinvest.com",
            hashed_password=get_password_hash("password123"),
            avatar=None
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        demo_settings = models.UserSettings(
            user_id=demo_user.id,
            currency="EUR",
            theme="dark"
        )
        db.add(demo_settings)

        mock_scenarios = [
            models.Scenario(
                user_id=demo_user.id, name="Long Term Growth", icon="fa-arrow-trend-up", theme="success",
                initial=1000, monthly=200, annual_rate=7, years=20, status="Active",
                compounding_frequency="Monthly", inflation_rate=2.5, tax_rate=30
            ),
            models.Scenario(
                user_id=demo_user.id, name="Conservative Plan", icon="fa-shield-halved", theme="primary",
                initial=500, monthly=150, annual_rate=4, years=15, status="Active",
                compounding_frequency="Quarterly", inflation_rate=2.0, tax_rate=15
            ),
            models.Scenario(
                user_id=demo_user.id, name="Retirement Plan", icon="fa-briefcase", theme="purple-500",
                initial=2000, monthly=250, annual_rate=6, years=30, status="Archived",
                compounding_frequency="Annually", inflation_rate=2.5, tax_rate=30
            ),
            models.Scenario(
                user_id=demo_user.id, name="Dream Portfolio", icon="fa-star", theme="success",
                initial=5000, monthly=500, annual_rate=8, years=20, status="Active",
                compounding_frequency="Monthly", inflation_rate=0.0, tax_rate=0
            )
        ]

        db.add_all(mock_scenarios)
        db.commit()
        print("✅ Database seeded successfully with Demo User and Scenarios!")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()