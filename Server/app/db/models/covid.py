from sqlalchemy import Column, Integer, Float, String, BigInteger
from app.db.database import Base


class CovidStat(Base):
    __tablename__ = "covid_stats"

    # clé primaire interne (facultative mais pratique)
    id = Column(Integer, primary_key=True, autoincrement=True)

    # colonnes (adaptées à la capture d’écran)
    country = Column(String(100))

    confirmed = Column("Confirmed", Float)
    deaths = Column("Deaths", Float)
    recovered = Column("Recovered", Float)
    active = Column("Active", Float)

    new_cases = Column("New cases", Float)
    new_deaths = Column("New deaths", Float)
    new_recovered = Column("New recovered", Float)

    continent = Column(String(50))
    total_confirmed = Column(Float)
    total_deaths = Column(Float)
    total_recovered = Column(Float)
    active_cases = Column(Float)
    serious_or_critical = Column(Float)
    total_tests = Column(Float)
    population = Column(Float)

    date_timestamp = Column(BigInteger)  # ex : 1716609282
