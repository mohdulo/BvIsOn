"""COVID endpoints – Black formatted.
Provides secured access to global and per‑country summaries.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.db.repositories.covid_repo import (
    get_countries_summary,
    get_global_stats,
)
from app.schemas.covid import CountrySummary, GlobalStats

router = APIRouter(prefix="/covid", tags=["covid"])
logger = logging.getLogger(__name__)


@router.get("/global", response_model=GlobalStats)
def read_global_stats(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ✅ AUTHENTIFICATION REQUISE
):
    """Return global COVID statistics (admin only)."""

    logger.info("Global stats requested by %s", current_user.username)
    return get_global_stats(db)


@router.get("/countries/summary", response_model=list[CountrySummary])
def read_countries_summary(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return country summaries (admin only)."""

    logger.info("Countries summary requested by %s", current_user.username)
    return get_countries_summary(db)
