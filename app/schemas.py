from pydantic import BaseModel
from datetime import datetime

class CovidStatsBase(BaseModel):
    country: str
    confirmed: float
    deaths: float
    recovered: float
    active: float
    new_cases: float
    new_deaths: float
    new_recovered: float
    continent: str
    date: datetime

class CovidStatsCreate(CovidStatsBase):
    pass

class CovidStats(CovidStatsBase):
    id: int

    model_config = {
        "from_attributes": True
    }
