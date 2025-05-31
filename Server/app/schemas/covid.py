from datetime import datetime
from pydantic import BaseModel, ConfigDict


class GlobalStats(BaseModel):
    confirmed: float
    deaths: float
    recovered: float
    new_confirmed: float
    new_deaths: float
    new_recovered: float
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


class CountrySummary(BaseModel):
    id: str
    country: str
    confirmed_total: float
    confirmed_new: float
    deaths_total: float
    deaths_new: float

    model_config = ConfigDict(from_attributes=True)
