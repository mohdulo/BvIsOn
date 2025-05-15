from sqlalchemy.orm import Session
from app import models, schemas

def create_stat(db: Session, stat: schemas.CovidStatsCreate):
    db_stat = models.CovidStats(**stat.model_dump())
    db.add(db_stat)
    db.commit()
    db.refresh(db_stat)
    return db_stat

def get_stats(db: Session, start_date=None, end_date=None, country=None, skip=0, limit=100):
    query = db.query(models.CovidStats)
    if start_date:
        query = query.filter(models.CovidStats.date >= start_date)
    if end_date:
        query = query.filter(models.CovidStats.date <= end_date)
    if country:
        query = query.filter(models.CovidStats.country == country)
    return query.offset(skip).limit(limit).all()

def update_stat(db: Session, stat_id: int, stat_data: schemas.CovidStatsCreate):
    stat = db.query(models.CovidStats).filter(models.CovidStats.id == stat_id).first()
    if not stat:
        return None
    for key, value in stat_data.model_dump().items():
        setattr(stat, key, value)
    db.commit()
    db.refresh(stat)
    return stat

def delete_stat(db: Session, stat_id: int):
    stat = db.query(models.CovidStats).filter(models.CovidStats.id == stat_id).first()
    if not stat:
        return None
    db.delete(stat)
    db.commit()
    return {"message": "Suppression réussie"}
