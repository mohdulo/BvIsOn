from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, update, delete

from app.db.models.covid import CovidStat
from app.schemas.manage import CountryManage


# ---------- READ  (1 seule ligne – la plus récente – par pays) ----------
def list_country_totals(db: Session) -> List[CountryManage]:
    """
    Retourne le « snapshot » le plus récent pour chaque pays.
    `total_confirmed`, `total_deaths`, … sont déjà cumulatifs, on ne les somme plus.
    """

    # Sous-requête : timestamp max pour chaque pays
    latest_per_country = (
        db.query(
            CovidStat.country.label("country"),
            func.max(CovidStat.date_timestamp).label("max_ts"),
        )
        .group_by(CovidStat.country)
        .subquery()
    )

    # On joint pour récupérer la ligne complète correspondant à ce max_ts
    rows = (
        db.query(
            CovidStat.country.label("country"),
            CovidStat.total_confirmed.label("total_cases"),
            CovidStat.total_deaths.label("total_deaths"),
            CovidStat.total_recovered.label("total_recovered"),
        )
        .join(
            latest_per_country,
            (CovidStat.country == latest_per_country.c.country)
            & (CovidStat.date_timestamp == latest_per_country.c.max_ts),
        )
        .all()
    )

    # Mapping → schéma Pydantic
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


# ---------- UPDATE  (inchangé) ----------
def update_country_totals(db: Session, cid: str, data: CountryManage) -> CountryManage:
    slug_to_match = cid.replace("-", " ").lower()

    db.execute(
        update(CovidStat)
        .where(func.lower(CovidStat.country) == slug_to_match)
        .values(
            total_confirmed=data.total_cases,
            total_deaths=data.total_deaths,
            total_recovered=data.total_recovered,
        )
        .execution_options(synchronize_session=False)
    )
    db.commit()
    return data


# ---------- DELETE  (inchangé) ----------
def delete_country(db: Session, cid: str) -> None:
    slug_to_match = cid.replace("-", " ").lower()

    db.execute(
        delete(CovidStat)
        .where(func.lower(CovidStat.country) == slug_to_match)
        .execution_options(synchronize_session=False)
    )
    db.commit()
