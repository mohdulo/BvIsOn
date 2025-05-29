from datetime import datetime
from pydantic import BaseModel

class InputRow(BaseModel):
    Confirmed: float
    Deaths: float
    Recovered: float
    Active: float
    New_cases: float
    New_recovered: float
    date: datetime
    Country: str
    WHO_Region: str



class PredictionOut(BaseModel):
    pred_new_deaths: float


