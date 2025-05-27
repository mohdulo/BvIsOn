from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.manage import CountryManage
from app.db.repositories.manage_repo import (
    list_country_totals,
    update_country_totals,
    delete_country,
)

router = APIRouter(prefix="/covid/countries", tags=["manage"])


@router.get("/manage", response_model=list[CountryManage])
def read_all(db: Session = Depends(get_db)):
    return list_country_totals(db)


@router.put("/{cid}", response_model=CountryManage)
def put_country(cid: str, payload: CountryManage, db: Session = Depends(get_db)):
    if cid != payload.id:
        raise HTTPException(status_code=400, detail="ID mismatch")
    return update_country_totals(db, cid, payload)


@router.delete("/{cid}", status_code=status.HTTP_204_NO_CONTENT)
def remove_country(cid: str, db: Session = Depends(get_db)):
    delete_country(db, cid)
