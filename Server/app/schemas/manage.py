from pydantic import BaseModel, ConfigDict

class CountryManage(BaseModel):
    id: str
    country: str
    total_cases: float
    total_deaths: float
    total_recovered: float

    model_config = ConfigDict(from_attributes=True)
