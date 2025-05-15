from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base

class CovidStats(Base):
    __tablename__ = "covid_stats"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(100))
    confirmed = Column(Float)
    deaths = Column(Float)
    recovered = Column(Float)
    active = Column(Float)
    new_cases = Column(Float)
    new_deaths = Column(Float)
    new_recovered = Column(Float)
    continent = Column(String(100))
    date = Column(DateTime)
