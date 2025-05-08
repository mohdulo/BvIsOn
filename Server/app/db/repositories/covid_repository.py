from typing import Dict, List, Optional

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, case

from slugify import slugify                       # pip install python-slugify

from app.db.models.covid import CovidStats
from app.db.repositories.base_repository import BaseRepository
from app.schemas.covid import (
    CovidStatsCreate,
    CovidStatsUpdate,
    CountrySummary,
)


class CovidRepository(BaseRepository[CovidStats, CovidStatsCreate, CovidStatsUpdate]):
    def __init__(self):
        super().__init__(CovidStats)

    # ------------------------------------------------------------------
    # Global
    # ------------------------------------------------------------------
    def get_global_stats(self, db: Session) -> Dict:
        result = (
            db.query(
                func.sum(self.model.confirmed).label("total_confirmed"),
                func.sum(self.model.deaths).label("total_deaths"),
                func.sum(self.model.recovered).label("total_recovered"),
                func.sum(self.model.new_cases).label("new_cases"),
                func.sum(self.model.new_deaths).label("new_deaths"),
                func.sum(self.model.new_recovered).label("new_recovered"),
                func.max(self.model.date_timestamp).label("last_updated"),
            )
            .first()
        )

        # Mise en forme
        last_updated = (
            datetime.fromtimestamp(result.last_updated) if result.last_updated else None
        )
        return {
            "confirmed": result.total_confirmed or 0,
            "deaths": result.total_deaths or 0,
            "recovered": result.total_recovered or 0,
            "new_confirmed": result.new_cases or 0,
            "new_deaths": result.new_deaths or 0,
            "new_recovered": result.new_recovered or 0,
            "last_updated": last_updated.strftime("%m/%d/%Y") if last_updated else None,
            "last_updated_time": last_updated.strftime("%H:%M:%S")
            if last_updated
            else None,
        }

    # ------------------------------------------------------------------
    # Par pays

    def get_by_country(self, db: Session, country: str) -> List[CovidStats]:
        """Historique complet d’un pays, tri décroissant."""
        return (
            db.query(self.model)
            .filter(func.lower(self.model.country) == country.lower())
            .order_by(self.model.date_timestamp.desc().nullslast())
            .all()
        )

    def get_latest_by_country(self, db: Session, country: str) -> Optional[CovidStats]:
        """Dernier enregistrement pour un pays (timestamp ou, sinon, id)."""
        return (
            db.query(self.model)
            .filter(func.lower(self.model.country) == country.lower())
            .order_by(
                self.model.date_timestamp.desc().nullslast(),  # timestamp prioritaire
                self.model.id.desc(),
            )
            .first()
        )

    # ------------------------------------------------------------------
    # Listes utilitaires
    # ------------------------------------------------------------------
    def get_countries_list(self, db: Session) -> List[str]:
        """Liste des pays distincts."""
        rows = db.query(self.model.country).distinct().all()
        return [r[0] for r in rows]

    # ------------------------------------------------------------------
    # Résumé par pays (pour la page Countries)
    # ------------------------------------------------------------------
    def get_countries_summary(self, db: Session) -> List[CountrySummary]:
        """
        Pour chaque pays, renvoie le total & les nouveaux cas/décès.
        1️⃣  Cherche le dernier date_timestamp non NULL ;
        2️⃣  Si aucun, prend la ligne avec le plus grand id.
        """
        latest_ts = (
            db.query(func.max(self.model.date_timestamp))
            .filter(self.model.date_timestamp.isnot(None))
            .scalar()
        )

        if latest_ts:
            # On a un timestamp : toutes les lignes de ce timestamp
            latest_rows = (
                db.query(self.model).filter(self.model.date_timestamp == latest_ts).all()
            )
        else:
            # Fallback : ligne au plus grand id pour chaque pays
            max_id_subq = (
                db.query(
                    func.max(self.model.id).label("max_id"),
                )
                .group_by(self.model.country)
                .subquery()
            )
            latest_rows = (
                db.query(self.model)
                .join(max_id_subq, self.model.id == max_id_subq.c.max_id)
                .all()
            )

        # Mapping → CountrySummary
        return [
            CountrySummary(
                id=slugify(r.country),
                country=r.country,
                confirmed_total=r.total_confirmed or 0,
                confirmed_new=r.new_cases or 0,
                deaths_total=r.total_deaths or 0,
                deaths_new=r.new_deaths or 0,
            )
            for r in latest_rows
        ]


# Instance unique à importer
covid_repository = CovidRepository()
