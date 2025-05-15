from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from slugify import slugify

class CovidStatsBase(BaseModel):
    country: str
    confirmed: float
    deaths: float
    recovered: float
    active: float
    new_cases: float
    new_deaths: float
    new_recovered: float
    continent: Optional[str] = None
    total_confirmed: Optional[float] = 0
    total_deaths: Optional[float] = 0
    total_recovered: Optional[float] = 0
    active_cases: Optional[float] = 0
    serious_or_critical: Optional[float] = 0
    total_tests: Optional[float] = 0
    population: Optional[float] = 0
    date_timestamp: Optional[int] = None

class CovidStatsCreate(CovidStatsBase):
    pass

class CovidStatsUpdate(BaseModel):
    confirmed: Optional[float] = None
    deaths: Optional[float] = None
    recovered: Optional[float] = None
    active: Optional[float] = None
    new_cases: Optional[float] = None
    new_deaths: Optional[float] = None
    new_recovered: Optional[float] = None
    continent: Optional[str] = None
    total_confirmed: Optional[float] = None
    total_deaths: Optional[float] = None
    total_recovered: Optional[float] = None
    active_cases: Optional[float] = None
    serious_or_critical: Optional[float] = None
    total_tests: Optional[float] = None
    population: Optional[float] = None
    date_timestamp: Optional[int] = None

class CovidStats(CovidStatsBase):
    id: int

    model_config = {
        "from_attributes": True
    }

class GlobalStats(BaseModel):
    confirmed: float
    deaths: float
    recovered: float
    new_confirmed: float
    new_deaths: float
    new_recovered: float
    last_updated: Optional[str]
    last_updated_time: Optional[str]

class CountrySummary(BaseModel):
    id: str      
    country: str
    confirmed_total: float
    confirmed_new: float
    deaths_total: float
    deaths_new: float
