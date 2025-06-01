# Server/app/api/endpoints/analytics.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

METRICS = {
    "cases":      ("total_confirmed", "New cases"),      # Utiliser les colonnes "New" pour les totaux réels
    "deaths":     ("total_deaths",    "New deaths"),     # Ces colonnes contiennent les nouveaux cas par jour
    "recovered":  ("total_recovered", "New recovered"),  
}

def _valid(metric: str):
    if metric not in METRICS:
        raise HTTPException(404, "unknown metric")
    return METRICS[metric]

# -------- TOP (Corriger pour prendre seulement la dernière valeur par pays) ------
@router.get("/{metric}/top")
def top(metric: str, limit: int = 10, db: Session = Depends(get_db)):
    total_col, _ = _valid(metric)
    
    # Méthode 1: Prendre la dernière valeur cumulative par pays
    sql = text(f"""
        WITH LastValues AS (
            SELECT country, {total_col} as value, date_timestamp,
                   ROW_NUMBER() OVER (PARTITION BY country ORDER BY date_timestamp DESC) as rn
            FROM covid_stats
            WHERE {total_col} > 0
        )
        SELECT country AS name, value
        FROM LastValues
        WHERE rn = 1
        ORDER BY value DESC
        LIMIT :lim
    """)
    
    # OU Méthode 2: Additionner les nouvelles valeurs quotidiennes
    # _, new_col = _valid(metric)
    # sql = text(f"""
    #     SELECT country AS name, SUM(`{new_col}`) AS value
    #     FROM covid_stats
    #     WHERE `{new_col}` > 0
    #     GROUP BY country
    #     ORDER BY value DESC
    #     LIMIT :lim
    # """)
    
    rows = db.execute(sql, {"lim": limit}).mappings().all()
    return rows

# -------- NEW (OK - utilise déjà les bonnes colonnes) ------
@router.get("/{metric}/new")
def new(metric: str, limit: int = 10, db: Session = Depends(get_db)):
    _, new_col = _valid(metric)
    
    # Prendre les dernières valeurs "new" par pays
    sql = text(f"""
        WITH RecentData AS (
            SELECT country, `{new_col}` as value, date_timestamp,
                   ROW_NUMBER() OVER (PARTITION BY country ORDER BY date_timestamp DESC) as rn
            FROM covid_stats
            WHERE `{new_col}` > 0
        )
        SELECT country AS name, value
        FROM RecentData
        WHERE rn = 1
        ORDER BY value DESC
        LIMIT :lim
    """)
    
    rows = db.execute(sql, {"lim": limit}).mappings().all()
    return rows

# -------- TREND (Corriger pour ne pas additionner les valeurs cumulatives) ------
@router.get("/{metric}/trend")
def trend(
    metric : str,
    days   : int = Query(30, ge=1, le=365),
    db     : Session = Depends(get_db)
):
    total_col, new_col = _valid(metric)
    
    # Option 1: Utiliser les nouvelles valeurs quotidiennes (recommandé)
    sql = text(f"""
        SELECT DATE(FROM_UNIXTIME(date_timestamp/1000)) AS name,
               SUM(`{new_col}`) AS value
        FROM covid_stats
        WHERE date_timestamp > 0
          AND DATE(FROM_UNIXTIME(date_timestamp/1000)) > CURDATE() - INTERVAL :d DAY
          AND `{new_col}` >= 0
        GROUP BY name
        ORDER BY name
    """)
    
    # Option 2: Prendre la valeur maximale par jour (pour les totaux cumulatifs)
    # sql = text(f"""
    #     SELECT DATE(FROM_UNIXTIME(date_timestamp/1000)) AS name,
    #            MAX({total_col}) AS value
    #     FROM covid_stats
    #     WHERE date_timestamp > 0
    #       AND DATE(FROM_UNIXTIME(date_timestamp/1000)) > CURDATE() - INTERVAL :d DAY
    #     GROUP BY name
    #     ORDER BY name
    # """)
    
    rows = db.execute(sql, {"d": days}).mappings().all()
    return rows

# -------- ENDPOINT ADDITIONNEL: Obtenir les vrais totaux ------
@router.get("/{metric}/total")
def total(metric: str, db: Session = Depends(get_db)):
    """Obtenir le vrai total global en additionnant les nouvelles valeurs quotidiennes"""
    _, new_col = _valid(metric)
    
    sql = text(f"""
        SELECT SUM(`{new_col}`) AS total_value
        FROM covid_stats
        WHERE `{new_col}` > 0
    """)
    
    result = db.execute(sql).scalar()
    return {"total": result or 0}

# -------- ENDPOINT DE VALIDATION: Vérifier les données ------
@router.get("/validate/data")
def validate_data(country: str = "usa", db: Session = Depends(get_db)):
    """Vérifier la cohérence des données pour un pays"""
    sql = text("""
        SELECT 
            country,
            MAX(total_deaths) as max_cumulative_deaths,
            SUM(`New deaths`) as sum_new_deaths,
            COUNT(DISTINCT date_timestamp) as days_count
        FROM covid_stats
        WHERE LOWER(country) = LOWER(:country)
        GROUP BY country
    """)
    
    result = db.execute(sql, {"country": country}).mappings().first()
    
    if result:
        return {
            "country": result['country'],
            "max_cumulative_deaths": result['max_cumulative_deaths'],
            "sum_new_deaths": result['sum_new_deaths'],
            "days_count": result['days_count'],
            "data_looks_valid": result['max_cumulative_deaths'] < 2000000  # Seuil raisonnable
        }
    return {"error": "Country not found"}
