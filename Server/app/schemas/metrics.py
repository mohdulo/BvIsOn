from pydantic import BaseModel
from datetime import date

class Metric(BaseModel):
    date: date
    rmse_log: float
    r2: float
