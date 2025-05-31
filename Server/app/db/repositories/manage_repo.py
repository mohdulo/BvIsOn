from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, update, delete

from app.db.models.covid import CovidStat
from app.schemas.manage import CountryManage


# --- LISTE pour Data-Management ---------------------------------
def list_country_totals(db: Session) -> List[CountryManage]:
    rows = (
        db.query(
            CovidStat.country.label("country"),
            func.sum(CovidStat.total_confirmed).label("total_cases"),
            func.sum(CovidStat.total_deaths).label("total_deaths"),
            func.sum(CovidStat.total_recovered).label("total_recovered"),
        )
        .group_by(CovidStat.country)
        .all()
    )
    return [
        CountryManage(
            id=row.country.lower().replace(" ", "-"),
            country=row.country,
            total_cases=row.total_cases,
            total_deaths=row.total_deaths,
            total_recovered=row.total_recovered,
        )
        for row in rows
    ]


# --- UPDATE ------------------------------------------------------
def update_country_totals(db: Session, cid: str, data: CountryManage) -> CountryManage:
    # on met à jour toutes les lignes du pays (simple démo)
    db.execute(
        update(CovidStat)
        .where(CovidStat.country == data.country)
        .values(
            total_confirmed=data.total_cases,
            total_deaths=data.total_deaths,
            total_recovered=data.total_recovered,
        )
    )
    db.commit()
    return data


# --- DELETE ------------------------------------------------------
def delete_country(db: Session, cid: str) -> None:
    db.execute(delete(CovidStat).where(CovidStat.country.ilike(cid.replace("-", " "))))
    db.commit()
