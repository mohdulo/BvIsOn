from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

from app import models, schemas, crud
from app.database import engine, SessionLocal
from datetime import datetime

# Crée les tables dans la BDD
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Middleware CORS (optionnel mais utile si tu fais du front)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency pour récupérer la session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create
@app.post("/covid_stats/", response_model=schemas.CovidStats)
def create_stat(stat: schemas.CovidStatsCreate, db: Session = Depends(get_db)):
    return crud.create_stat(db, stat)

# Read
@app.get("/covid_stats/", response_model=List[schemas.CovidStats])
def read_stats(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    country: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_stats(db, start_date, end_date, country, skip, limit)

# Update
@app.put("/covid_stats/{id}", response_model=schemas.CovidStats)
def update_stat(id: int, stat: schemas.CovidStatsCreate, db: Session = Depends(get_db)):
    updated = crud.update_stat(db, id, stat)
    if not updated:
        return {"error": "Stat non trouvée"}
    return updated

# Delete
@app.delete("/covid_stats/{id}")
def delete_stat(id: int, db: Session = Depends(get_db)):
    result = crud.delete_stat(db, id)
    if not result:
        return {"error": "Stat non trouvée"}
    return result
