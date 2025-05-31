from pydantic import BaseModel

class InputRow(BaseModel):
    Confirmed_log: float
    Confirmed_log_ma_14: float
    cases_per_million: float
    tests_per_million: float
    population: float
    density: float
    Lat: float
    Long: float

class PredictionOut(BaseModel):
    pred_log: float
    pred_deaths: float
