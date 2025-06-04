import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.db.models.user import User

security = HTTPBearer()
router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# Métriques autorisées (sécurisé contre injection SQL)
ALLOWED_METRICS: dict[str, tuple[str, str]] = {
    "cases": ("total_confirmed", "New cases"),
    "deaths": ("total_deaths", "New deaths"),
    "recovered": ("total_recovered", "New recovered"),
}


def validate_admin_user(current_user: User) -> None:
    """Valide qu'un utilisateur est *un* administrateur actif."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")


def validate_metric(metric: str) -> tuple[str, str]:
    """Vérifie que *metric* est autorisé et renvoie la paire de colonnes."""
    if metric not in ALLOWED_METRICS:
        allowed = ", ".join(ALLOWED_METRICS.keys())
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Allowed: [{allowed}]",
        )
    return ALLOWED_METRICS[metric]


# -----------------------------------------------------------------------------
# TOP COUNTRIES
# -----------------------------------------------------------------------------


@router.get("/{metric}/top", dependencies=[Depends(security)])
def get_top_countries(
    metric: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renvoie le top *limit* pays pour une *metric* (admin)."""
    validate_admin_user(current_user)
    total_col, _ = validate_metric(metric)

    # Mapping explicite pour éviter l'injection SQL
    if metric == "cases":
        column = "total_confirmed"
    elif metric == "deaths":
        column = "total_deaths"
    elif metric == "recovered":
        column = "total_recovered"
    else:  # fallback défensif
        raise HTTPException(status_code=400, detail="Invalid metric")

    sql = text(
        f"""
        WITH LastValues AS (
            SELECT
                country,
                {column} AS value,
                date_timestamp,
                ROW_NUMBER() OVER (PARTITION BY country ORDER BY date_timestamp DESC) AS rn
            FROM covid_stats
            WHERE {column} > 0
        )
        SELECT country AS name, CAST(value AS SIGNED) AS value
        FROM LastValues
        WHERE rn = 1
        ORDER BY value DESC
        LIMIT :limit_val
        """
    )

    rows = db.execute(sql, {"limit_val": limit}).mappings().all()
    result = [{"name": row["name"], "value": int(row["value"] or 0)} for row in rows]

    logger.info("Top %s requested by admin %s", metric, current_user.username)
    return result


# -----------------------------------------------------------------------------
# NEW CASES
# -----------------------------------------------------------------------------


@router.get("/{metric}/new", dependencies=[Depends(security)])
def get_new_cases(
    metric: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renvoie les nouveaux cas par pays pour une *metric* (admin)."""
    validate_admin_user(current_user)
    _, new_col = validate_metric(metric)

    if metric == "cases":
        column = "New cases"
    elif metric == "deaths":
        column = "New deaths"
    elif metric == "recovered":
        column = "New recovered"
    else:
        raise HTTPException(status_code=400, detail="Invalid metric")

    sql = text(
        f"""
        WITH RecentData AS (
            SELECT
                country,
                `{column}` AS value,
                date_timestamp,
                ROW_NUMBER() OVER (PARTITION BY country ORDER BY date_timestamp DESC) AS rn
            FROM covid_stats
            WHERE `{column}` > 0
        )
        SELECT country AS name, CAST(value AS SIGNED) AS value
        FROM RecentData
        WHERE rn = 1
        ORDER BY value DESC
        LIMIT :limit_val
        """
    )

    rows = db.execute(sql, {"limit_val": limit}).mappings().all()
    result = [{"name": row["name"], "value": int(row["value"] or 0)} for row in rows]

    logger.info("New %s requested by admin %s", metric, current_user.username)
    return result


# -----------------------------------------------------------------------------
# TREND
# -----------------------------------------------------------------------------


@router.get("/{metric}/trend", dependencies=[Depends(security)])
def get_trend(
    metric: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renvoie la tendance (globale) pour *metric* sur *days* jours (admin)."""
    validate_admin_user(current_user)
    _, new_col = validate_metric(metric)

    if metric == "cases":
        column = "New cases"
    elif metric == "deaths":
        column = "New deaths"
    elif metric == "recovered":
        column = "New recovered"
    else:
        raise HTTPException(status_code=400, detail="Invalid metric")

    sql = text(
        f"""
        SELECT
            DATE(FROM_UNIXTIME(date_timestamp / 1000)) AS name,
            CAST(SUM(`{column}`) AS SIGNED) AS value
        FROM covid_stats
        WHERE date_timestamp > 0
          AND DATE(FROM_UNIXTIME(date_timestamp / 1000)) > CURDATE() - INTERVAL :days_val DAY
          AND `{column}` >= 0
        GROUP BY name
        ORDER BY name
        """
    )

    rows = db.execute(sql, {"days_val": days}).mappings().all()
    result = [{"name": str(row["name"]), "value": int(row["value"] or 0)} for row in rows]

    logger.info("Trend %s requested by admin %s", metric, current_user.username)
    return result


# -----------------------------------------------------------------------------
# MORTALITY VS RECOVERY
# -----------------------------------------------------------------------------


@router.get("/mortality-recovery", dependencies=[Depends(security)])
def get_mortality_recovery(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renvoie les taux de mortalité et de guérison (admin)."""
    validate_admin_user(current_user)

    sql = text(
        """
        WITH LastValues AS (
            SELECT
                country,
                total_confirmed,
                total_deaths,
                total_recovered,
                date_timestamp,
                ROW_NUMBER() OVER (PARTITION BY country ORDER BY date_timestamp DESC) AS rn
            FROM covid_stats
            WHERE total_confirmed > 0
        )
        SELECT
            country AS name,
            total_confirmed,
            total_deaths,
            total_recovered,
            CASE
                WHEN total_confirmed > 0 THEN ROUND((total_deaths / total_confirmed) * 100, 2)
                ELSE 0
            END AS mortality_rate,
            CASE
                WHEN total_confirmed > 0 THEN ROUND((total_recovered / total_confirmed) * 100, 2)
                ELSE 0
            END AS recovery_rate
        FROM LastValues
        WHERE rn = 1
          AND total_confirmed >= 1000
        ORDER BY total_confirmed DESC
        LIMIT :limit_val
        """
    )

    rows = db.execute(sql, {"limit_val": limit}).mappings().all()

    result: list[dict[str, int | float | str]] = []
    for row in rows:
        mortality_rate = min(100.0, max(0.0, float(row["mortality_rate"] or 0)))
        recovery_rate = min(100.0, max(0.0, float(row["recovery_rate"] or 0)))

        result.append(
            {
                "name": row["name"],
                "Mortality %": mortality_rate,
                "Recovery %": recovery_rate,
                "confirmed": int(row["total_confirmed"] or 0),
                "deaths": int(row["total_deaths"] or 0),
                "recovered": int(row["total_recovered"] or 0),
            }
        )

    logger.info("Mortality/Recovery data requested by admin %s", current_user.username)
    return result


# -----------------------------------------------------------------------------
# TOTAL GLOBAL
# -----------------------------------------------------------------------------


@router.get("/{metric}/total", dependencies=[Depends(security)])
def get_total(
    metric: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renvoie le total global pour *metric* (admin)."""
    validate_admin_user(current_user)
    _, new_col = validate_metric(metric)

    if metric == "cases":
        column = "New cases"
    elif metric == "deaths":
        column = "New deaths"
    elif metric == "recovered":
        column = "New recovered"
    else:
        raise HTTPException(status_code=400, detail="Invalid metric")

    sql = text(
        f"""
        SELECT CAST(SUM(`{column}`) AS SIGNED) AS total_value
        FROM covid_stats
        WHERE `{column}` > 0
        """
    )

    result = db.execute(sql).scalar()
    total = int(result or 0)

    logger.info("Total %s requested by admin %s", metric, current_user.username)
    return {"total": total}


# -----------------------------------------------------------------------------
# VALIDATION DES DONNÉES
# -----------------------------------------------------------------------------


@router.get("/validate/data", dependencies=[Depends(security)])
def validate_data(
    country: str = Query("usa", description="Country to validate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Valide la cohérence des données pour *country* (admin)."""
    validate_admin_user(current_user)

    sql = text(
        """
        SELECT
            country,
            MAX(total_deaths) AS max_cumulative_deaths,
            SUM(`New deaths`) AS sum_new_deaths,
            COUNT(DISTINCT date_timestamp) AS days_count,
            MAX(total_confirmed) AS max_confirmed
        FROM covid_stats
        WHERE LOWER(country) = LOWER(:country)
        GROUP BY country
        """
    )

    result = db.execute(sql, {"country": country}).mappings().first()

    if result:
        max_deaths = int(result["max_cumulative_deaths"] or 0)
        sum_new_deaths = int(result["sum_new_deaths"] or 0)
        max_confirmed = int(result["max_confirmed"] or 0)

        return {
            "country": result["country"],
            "max_cumulative_deaths": max_deaths,
            "sum_new_deaths": sum_new_deaths,
            "days_count": int(result["days_count"] or 0),
            "max_confirmed": max_confirmed,
            "data_looks_valid": max_deaths < 2_000_000 and max_deaths <= max_confirmed,
        }

    logger.warning("Country validation failed: %s not found", country)
    return {"error": "Country not found"}
