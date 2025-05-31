from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.covid import GlobalStats, CountrySummary
from app.db.repositories.covid_repo import (
    get_global_stats,
    get_countries_summary,
)

router = APIRouter(tags=["covid"])  # Plus de prefix ici


@router.get("/global", response_model=GlobalStats)
def read_global_stats(db: Session = Depends(get_db)):
    return get_global_stats(db)


@router.get("/countries/summary", response_model=list[CountrySummary])
def read_countries_summary(db: Session = Depends(get_db)):
    return get_countries_summary(db)
