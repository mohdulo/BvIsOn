from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.repositories.covid_repository import covid_repository
from app.schemas.covid import CovidStats, GlobalStats, CountrySummary

router = APIRouter()

# --------------------------------------------------------------------------
# 1) Endpoints « globaux » ou sans paramètre
# --------------------------------------------------------------------------

@router.get("/global", response_model=GlobalStats)
def get_global_stats(db: Session = Depends(get_db)):
    """Statistiques COVID-19 globales"""
    try:
        return covid_repository.get_global_stats(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/countries", response_model=List[str])
def get_countries_list(db: Session = Depends(get_db)):
    """Liste des pays disponibles"""
    try:
        return covid_repository.get_countries_list(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/countries/summary", response_model=List[CountrySummary])
def get_countries_summary(db: Session = Depends(get_db)):
    """Totaux et nouveaux cas/décès pour chaque pays (dernier enregistrement)"""
    try:
        return covid_repository.get_countries_summary(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------------------------------
# 2) Endpoints paramétrés par {country}  (placés APRÈS les statiques)
# --------------------------------------------------------------------------

@router.get("/countries/{country}", response_model=List[CovidStats])
def get_country_stats(country: str, db: Session = Depends(get_db)):
    """Historique complet d’un pays (trié par date décroissante)"""
    stats = covid_repository.get_by_country(db, country)
    if not stats:
        raise HTTPException(status_code=404, detail=f"Aucune donnée trouvée pour le pays : {country}")
    return stats


@router.get("/countries/{country}/latest", response_model=CovidStats)
def get_latest_country_stats(country: str, db: Session = Depends(get_db)):
    """Dernier enregistrement disponible pour un pays"""
    stat = covid_repository.get_latest_by_country(db, country)
    if not stat:
        raise HTTPException(status_code=404, detail=f"Aucune donnée trouvée pour le pays : {country}")
    return stat
