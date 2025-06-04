"""Analytics endpoints – Black & Flake8‑compliant (≤88 chars)."""

from __future__ import annotations

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

ALLOWED_METRICS: dict[str, tuple[str, str]] = {
    "cases": ("total_confirmed", "New cases"),
    "deaths": ("total_deaths", "New deaths"),
    "recovered": ("total_recovered", "New recovered"),
}


def _admin_required(user: User) -> None:  # noqa: D401 – simple helper
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    if user.role != "admin":  # role check
        raise HTTPException(status_code=403, detail="Admin access required")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")


def _metric_columns(metric: str) -> tuple[str, str]:
    if metric not in ALLOWED_METRICS:
        allowed = ", ".join(ALLOWED_METRICS)
        raise HTTPException(400, f"Invalid metric. Allowed: [{allowed}]")
    return ALLOWED_METRICS[metric]

@router.get("/{metric}/top", dependencies=[Depends(security)])
def get_top_countries(
    metric: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _admin_required(current_user)

    if metric == "cases":
        column = "total_confirmed"
    elif metric == "deaths":
        column = "total_deaths"
    elif metric == "recovered":
        column = "total_recovered"
    else:
        raise HTTPException(400, "Invalid metric")

    sql = text(
        f"""
        WITH LastValues AS (
            SELECT country, {column} AS value, date_timestamp,
                   ROW_NUMBER() OVER (
                       PARTITION BY country
                       ORDER BY date_timestamp DESC
                   ) AS rn
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
    result = [
        {"name": r["name"], "value": int(r["value"] or 0)} for r in rows
    ]
    logger.info("Top %s requested by %s", metric, current_user.username)
    return result

@router.get("/{metric}/new", dependencies=[Depends(security)])
def get_new_cases(
    metric: str,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _admin_required(current_user)

    if metric == "cases":
        column = "New cases"
    elif metric == "deaths":
        column = "New deaths"
    elif metric == "recovered":
        column = "New recovered"
    else:
        raise HTTPException(400, "Invalid metric")

    sql = text(
        f"""
        WITH RecentData AS (
            SELECT country, `{column}` AS value, date_timestamp,
                   ROW_NUMBER() OVER (
                       PARTITION BY country
                       ORDER BY date_timestamp DESC
                   ) AS rn
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
    result = [
        {"name": r["name"], "value": int(r["value"] or 0)} for r in rows
    ]
    logger.info("New %s requested by %s", metric, current_user.username)
    return result

@router.get("/{metric}/trend", dependencies=[Depends(security)])
def get_trend(
    metric: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _admin_required(current_user)

    if metric == "cases":
        column = "New cases"
    elif metric == "deaths":
        column = "New deaths"
    elif metric == "recovered":
        column = "New recovered"
    else:
        raise HTTPException(400, "Invalid metric")

    sql = text(
        f"""
        SELECT DATE(FROM_UNIXTIME(date_timestamp / 1000)) AS name,
               CAST(SUM(`{column}`) AS SIGNED) AS value
        FROM covid_stats
        WHERE date_timestamp > 0
          AND DATE(FROM_UNIXTIME(date_timestamp / 1000)) >
              CURDATE() - INTERVAL :days_val DAY
          AND `{column}` >= 0
        GROUP BY name
        ORDER BY name
        """
    )

    rows = db.execute(sql, {"days_val": days}).mappings().all()
    result = [
        {"name": str(r["name"]), "value": int(r["value"] or 0)} for r in rows
    ]
    logger.info("Trend %s requested by %s", metric, current_user.username)
    return result

@router.get("/mortality-recovery", dependencies=[Depends(security)])
def get_mortality_recovery(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _admin_required(current_user)

    sql = text(
        """
        WITH LastValues AS (
            SELECT country, total_confirmed, total_deaths, total_recovered,
                   date_timestamp,
                   ROW_NUMBER() OVER (
                       PARTITION BY country ORDER BY date_timestamp DESC
                   ) AS rn
            FROM covid_stats
            WHERE total_confirmed > 0
        )
        SELECT country AS name, total_confirmed, total_deaths, total_recovered,
               CASE WHEN total_confirmed > 0 THEN
                   ROUND((total_deaths / total_confirmed) * 100, 2)
               ELSE 0 END AS mortality_rate,
               CASE WHEN total_confirmed > 0 THEN
                   ROUND((total_recovered / total_confirmed) * 100, 2)
               ELSE 0 END AS recovery_rate
        FROM LastValues
        WHERE rn = 1 AND total_confirmed >= 1000
        ORDER BY total_confirmed DESC
        LIMIT :limit_val
        """
    )

    rows = db.execute(sql, {"limit_val": limit}).mappings().all()
    out: list[dict[str, int | float | str]] = []
    for r in rows:
        out.append(
            {
                "name": r["name"],
                "Mortality %": min(100.0, max(0.0, float(r["mortality_rate"] or 0))),
                "Recovery %": min(100.0, max(0.0, float(r["recovery_rate"] or 0))),
                "confirmed": int(r["total_confirmed"] or 0),
                "deaths": int(r["total_deaths"] or 0),
                "recovered": int(r["total_recovered"] or 0),
            }
        )
    logger.info("Mortality/Recovery requested by %s", current_user.username)
    return out

@router.get("/{metric}/total", dependencies=[Depends(security)])
def get_total(
    metric: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _admin_required(current_user)

    if metric == "cases":
        column = "New cases"
    elif metric == "deaths":
        column = "New deaths"
    elif metric == "recovered":
        column = "New recovered"
    else:
        raise HTTPException(400, "Invalid metric")

    sql = text(
        f"""
        SELECT CAST(SUM(`{column}`) AS SIGNED) AS total_value
        FROM covid_stats
        WHERE `{column}` > 0
        """
    )

    total = int(db.execute(sql).scalar() or 0)
    logger.info("Total %s requested by %s", metric, current_user.username)
    return {"total": total}

@router.get("/validate/data", dependencies=[Depends(security)])
def validate_data(
    country: str = Query("usa", description="Country to validate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _admin_required(current_user)

    sql = text(
        """
        SELECT country,
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
        return {
            "country": result["country"],
            "max_cumulative_deaths": max_deaths,
            "sum_new_deaths": int(result["sum_new_deaths"] or 0),
            "days_count": int(result["days_count"] or 0),
            "max_confirmed": int(result["max_confirmed"] or 0),
            "data_looks_valid": (
                max_deaths < 2_000_000 and max_deaths <= int(result["max_confirmed"])
            ),
        }

    logger.warning("Country validation failed: %s", country)
    return {"error": "Country not found"}
