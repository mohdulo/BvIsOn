# Server/app/api/endpoints/manage.py - VERSION SÉCURISÉE
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.manage import CountryManage
from app.db.repositories.manage_repo import (
    list_country_totals,
    update_country_totals,
    delete_country,
)
from app.core.deps import get_current_user  # ✅ Authentification
from app.db.models.user import User
import logging

router = APIRouter(prefix="/covid/countries", tags=["manage"])
logger = logging.getLogger(__name__)

@router.get("/manage", response_model=list[CountryManage])
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ AUTHENTIFICATION REQUISE
):
    """Lister tous les pays (ADMIN SEULEMENT)"""
    logger.info(f"Country management list requested by {current_user.username}")
    return list_country_totals(db)

@router.put("/{cid}", response_model=CountryManage)
def put_country(
    cid: str, 
    payload: CountryManage, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ AUTHENTIFICATION REQUISE
):
    """Mettre à jour un pays (ADMIN SEULEMENT)"""
    if cid != payload.id:
        raise HTTPException(status_code=400, detail="ID mismatch")
    
    logger.info(f"Country {cid} updated by {current_user.username}")
    return update_country_totals(db, cid, payload)

@router.delete("/{cid}", status_code=status.HTTP_204_NO_CONTENT)
def remove_country(
    cid: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # ✅ AUTHENTIFICATION REQUISE
):
    """Supprimer un pays (ADMIN SEULEMENT)"""
    logger.warning(f"Country {cid} deleted by {current_user.username}")
    delete_country(db, cid)