from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base
from app.services.calculations import calculate_compound_interest, format_compact_currency


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True , index=True)
    name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    avatar = Column(String(255), nullable=True)

    # Relationships
    scenarios = relationship("Scenario", back_populates="owner", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan") 

    # Dynamic Initials Property 
    @property
    def initials(self):
        if not self.name:
            return "$$"
        parts = self.name.split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        return parts[0][:2].upper()


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True) 
    
    currency = Column(String(10), default="EUR")
    time_range = Column(String(10), default="20")
    theme = Column(String(20), default="light")
    
    portfolio_alerts = Column(Boolean, default=True)
    market_updates = Column(Boolean, default=True)
    product_updates = Column(Boolean, default=True)

    # Relationship back to user
    user = relationship("User", back_populates="settings")

    @property
    def currency_symbol(self):
        symbols = {"EUR": "€", "USD": "$", "GBP": "£"}
        return symbols.get(self.currency, "€") # Default to Euro


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # The Magic Link
    
    name = Column(String(255), index=True)
    icon = Column(String(50), default="fa-arrow-trend-up")
    theme = Column(String(50), default="success")
    
    initial = Column(Float)
    monthly = Column(Float)
    annual_rate = Column(Float)
    years = Column(Integer)
    
    compounding_frequency = Column(String(50), default="Monthly")
    inflation_rate = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationship to user
    owner = relationship("User", back_populates="scenarios")

    @property
    def math_results(self):
        # Calculate math on the fly based on the DB values
        return calculate_compound_interest(
            initial=self.initial, monthly=self.monthly, annual_rate=self.annual_rate, years=self.years,
            compounding_frequency=self.compounding_frequency, inflation_rate=self.inflation_rate, tax_rate=self.tax_rate
        )

    @property
    def currency_symbol(self):
        # Safely get the symbol from the owner's settings, fallback to €
        if self.owner and self.owner.settings:
            return self.owner.settings.currency_symbol
        return "€"

    @property
    def gain(self):
        kpis = self.math_results["kpis"]
        net_gains = kpis['net_balance'] - kpis['total_invested']
        # Pass the symbol to the formatter
        return f"+{format_compact_currency(net_gains, self.currency_symbol)}"

    @property
    def percent(self):
        kpis = self.math_results["kpis"]
        net_gains = kpis['net_balance'] - kpis['total_invested']
        percent_val = (net_gains / self.initial * 100) if self.initial > 0 else 0
        if percent_val > 99999:
            return "(+>99999%)"
        return f"(+{percent_val:.1f}%)"

    @property
    def final_value(self):
        return format_compact_currency(self.math_results["kpis"]["net_balance"], self.currency_symbol)

    
    @property
    def chart_path(self):
        balances = self.math_results["chart"]["balance_data"]
        if not balances or len(balances) < 2:
            return "M0,50 L100,50" # Flat line

        max_val = max(balances)
        min_val = min(balances)
        range_val = max_val - min_val if max_val != min_val else 1

        points = []
        for i, val in enumerate(balances):
            x = (i / (len(balances) - 1)) * 100 # X from 0 to 100
            y = 45 - ((val - min_val) / range_val) * 40 # Y from 5 to 45
            points.append(f"{x:.1f},{y:.1f}")

        return "M" + " L".join(points)

    @property
    def is_new(self):
        if not self.created_at:
            return False
            
        now = datetime.datetime.now(datetime.timezone.utc)
        created = self.created_at
        
        if created.tzinfo is None:
            created = created.replace(tzinfo=datetime.timezone.utc)
            
        return (now - created).days < 2 