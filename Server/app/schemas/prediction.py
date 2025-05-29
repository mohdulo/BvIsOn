from datetime import datetime
from pydantic import BaseModel

class InputRow(BaseModel):
    Confirmed: int
    Deaths: int
    Recovered: int
    Active: int
    New_cases: int
    New_recovered: int
    date: datetime
    Country: str
    WHO_Region: str



class PredictionOut(BaseModel):
    pred_new_deaths: float


