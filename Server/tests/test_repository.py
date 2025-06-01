import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base
from app.db.models.covid import CovidStat
from app.db.repositories.covid_repo import get_global_stats, get_countries_summary

# Fixture pour créer une base en mémoire à chaque test (rapide et isolé)
@pytest.fixture(scope="function")
def db_session():
    # Base SQLite temporaire pour les tests, pas de fichier écrit sur disque
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)  # Crée les tables

    session = TestingSessionLocal()

    # On injecte deux pays avec toutes les données nécessaires pour les tests
    session.add_all([
        CovidStat(
            country="France",
            confirmed=100,
            deaths=10,
            recovered=50,
            active=40,
            new_cases=5,
            new_deaths=1,
            new_recovered=2,
            continent="Europe",
            total_confirmed=100,
            total_deaths=10,
            total_recovered=50,
            date_timestamp=1716609282,  # timestamp fictif
        ),
        CovidStat(
            country="Germani",
            confirmed=200,
            deaths=20,
            recovered=150,
            active=30,
            new_cases=10,
            new_deaths=2,
            new_recovered=5,
            continent="Europe",
            total_confirmed=200,
            total_deaths=20,
            total_recovered=150,
            date_timestamp=1716609282,
        ),
    ])
    session.commit()  # On enregistre en base
    yield session      # On donne la session au test
    session.close()    # On ferme à la fin

def test_repo_get_global_stats(db_session):
    """
    Vérifie que get_global_stats renvoie la somme totale des valeurs des pays.
    """
    stats = get_global_stats(db_session)
    assert stats.confirmed == 300  # 100 + 200
    assert stats.deaths == 30      # 10 + 20
    assert stats.recovered == 200  # 50 + 150

def test_repo_get_countries_summary(db_session):
    """
    Vérifie que get_countries_summary renvoie la liste avec chaque pays ajouté.
    """
    summary = get_countries_summary(db_session)
    countries = [c.country for c in summary]
    assert "France" in countries and "Germani" in countries
