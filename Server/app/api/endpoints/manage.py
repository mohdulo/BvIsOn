from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.db.models.user import User
from app.db.repositories.manage_repo import (
    delete_country,
    list_country_totals,
    update_country_totals,
)
from app.schemas.manage import CountryManage

router = APIRouter(prefix="/covid/countries", tags=["manage"])
logger = logging.getLogger(__name__)


@router.get("/manage", response_model=list[CountryManage])
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lister tous les pays (ADMIN SEULEMENT)."""
    logger.info("Country management list requested by %s", current_user.username)
    return list_country_totals(db)


@router.put("/{cid}", response_model=CountryManage)
def put_country(
    cid: str,
    payload: CountryManage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mettre à jour un pays (ADMIN SEULEMENT)."""
    if cid != payload.id:
        raise HTTPException(status_code=400, detail="ID mismatch")

    logger.info("Country %s updated by %s", cid, current_user.username)
    return update_country_totals(db, cid, payload)


@router.delete("/{cid}", status_code=status.HTTP_204_NO_CONTENT)
def remove_country(
    cid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Supprimer un pays (ADMIN SEULEMENT)."""
    logger.warning("Country %s deleted by %s", cid, current_user.username)
    delete_country(db, cid)
