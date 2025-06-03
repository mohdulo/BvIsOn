# Server/app/api/endpoints/covid.py - VERSION SÉCURISÉE
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.covid import GlobalStats, CountrySummary
from app.db.repositories.covid_repo import (
    get_global_stats,
    get_countries_summary,
)
from app.core.deps import get_current_user  # ✅ Ajouter l'authentification
from app.db.models.user import User
import logging

router = APIRouter(prefix="/covid", tags=["covid"])
logger = logging.getLogger(__name__)

@router.get("/global", response_model=GlobalStats)
def read_global_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ AUTHENTIFICATION REQUISE
):
    """Obtenir les statistiques globales COVID (ADMIN SEULEMENT)"""
    logger.info(f"Global stats requested by {current_user.username}")
    return get_global_stats(db)

@router.get("/countries/summary", response_model=list[CountrySummary])
def read_countries_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ AUTHENTIFICATION REQUISE
):
    """Obtenir le résumé des pays (ADMIN SEULEMENT)"""
    logger.info(f"Countries summary requested by {current_user.username}")
    return get_countries_summary(db)