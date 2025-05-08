from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class CovidStats(Base):
    __tablename__ = "covid_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(100), index=True)
    confirmed = Column(Float, default=0)
    deaths = Column(Float, default=0)
    recovered = Column(Float, default=0)
    active = Column(Float, default=0)
    new_cases = Column(Float, default=0)
    new_deaths = Column(Float, default=0)
    new_recovered = Column(Float, default=0)
    continent = Column(String(50))
    total_confirmed = Column(Float, default=0)
    total_deaths = Column(Float, default=0)
    total_recovered = Column(Float, default=0)
    active_cases = Column(Float, default=0)
    serious_or_critical = Column(Float, default=0)
    total_tests = Column(Float, default=0)
    population = Column(Float, default=0)
    date_timestamp = Column(Integer)