from datetime import datetime
from typing import List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models.covid import CovidStat
from app.schemas.covid import GlobalStats, CountrySummary


def get_global_stats(db: Session) -> GlobalStats:
    row = (
        db.query(
            func.sum(CovidStat.total_confirmed).label("confirmed"),
            func.sum(CovidStat.total_deaths).label("deaths"),
            func.sum(CovidStat.total_recovered).label("recovered"),
            func.sum(CovidStat.new_cases).label("new_confirmed"),
            func.sum(CovidStat.new_deaths).label("new_deaths"),
            func.sum(CovidStat.new_recovered).label("new_recovered"),
            func.max(CovidStat.date_timestamp).label("max_ts"),
        )
        .one()
    )

    data = dict(row._mapping)
    # divise par 1000 si ton timestamp est en millisecondes
    data["last_updated"] = datetime.fromtimestamp(int(data.pop("max_ts")))
    return GlobalStats(**data)


def get_countries_summary(db: Session) -> List[CountrySummary]:
    rows = (
        db.query(
            CovidStat.country.label("country"),
            func.sum(CovidStat.total_confirmed).label("confirmed_total"),
            func.sum(CovidStat.new_cases).label("confirmed_new"),
            func.sum(CovidStat.total_deaths).label("deaths_total"),
            func.sum(CovidStat.new_deaths).label("deaths_new"),
        )
        .group_by(CovidStat.country)
        .all()
    )

    return [
        CountrySummary(
            id=row.country.lower().replace(" ", "-"),
            country=row.country,
            confirmed_total=row.confirmed_total,
            confirmed_new=row.confirmed_new,
            deaths_total=row.deaths_total,
            deaths_new=row.deaths_new,
        )
        for row in rows
    ]
