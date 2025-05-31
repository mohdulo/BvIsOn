from pydantic import BaseModel, ConfigDict


class CountryManage(BaseModel):
    id: str
    country: str
    total_cases: int
    total_deaths: int
    total_recovered: int

    model_config = ConfigDict(from_attributes=True)

    # 👉 Si vous préférez accepter du camelCase en plus,
    # décommentez ces alias et ajoutez `populate_by_name=True`
    #
    # total_cases: int = Field(..., alias="totalCases")
    # total_deaths: int = Field(..., alias="totalDeaths")
    # total_recovered: int = Field(..., alias="totalRecovered")
    #
    # model_config = ConfigDict(
    #     populate_by_name=True,
    #     from_attributes=True
    # )
