import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.covid import CovidStat
from app.db.database import Base, get_db
from app.main import app

# URL SQLite pour la base de test (tu ne touches pas à ta prod)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Cette fixture va créer les tables une seule fois pour tous les tests de la session
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield


# Cette fixture est appelée à chaque test pour avoir une base propre
@pytest.fixture(scope="function")
def db_session():
    session = TestingSessionLocal()
    # On vide la table avant chaque test pour éviter les doublons
    session.query(CovidStat).delete()
    session.commit()
    # On ajoute des données tests cohérentes avec le schéma de la BDD
    session.add_all(
        [
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
        ]
    )
    session.commit()
    yield session  # On donne la session au test
    session.close()  # Puis on ferme


# Cette fonction permet de forcer FastAPI à utiliser la base de test
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# On indique à FastAPI d’utiliser la base de test plutôt que la vraie
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)  # client HTTP pour simuler des requêtes API


# ----------- TESTS -----------
def test_api_global_stats_works(db_session):
    """Teste la route des stats globales"""
    response = client.get("/api/v1/covid/global")
    assert response.status_code == 200
    data = response.json()
    assert "confirmed" in data  # Vérifie que le champ est présent
    assert data["confirmed"] == 300  # 100 (France) + 200 (Germany)


def test_api_countries_summary_works(db_session):
    """Teste la route summary pays"""
    response = client.get("/api/v1/covid/countries/summary")
    assert response.status_code == 200
    data = response.json()
    countries = [c["country"] for c in data]
    assert "France" in countries  # On doit retrouver France dans la liste


def test_api_update_country_stats_works(db_session):
    """Teste la mise à jour des stats pour un pays existant"""
    payload = {
        "id": "france",  # Doit être identique au paramètre de l’URL en minuscule/snake-case
        "country": "France",
        "total_cases": 999,
        "total_deaths": 99,
        "total_recovered": 888,
    }
    # On simule la requête PUT pour modifier France
    response = client.put("/api/v1/covid/countries/france", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_cases"] == 999
    assert data["total_deaths"] == 99
    assert data["total_recovered"] == 888


def test_api_delete_country_stats_works(db_session):
    """Teste la suppression des stats d’un pays"""
    # On supprime la France
    response = client.delete("/api/v1/covid/countries/france")
    # Le statut doit être 204 (No Content) ou 200 (OK) selon FastAPI
    assert response.status_code in [200, 204]
