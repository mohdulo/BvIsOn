import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.main import app
from app.db.models.covid import CovidStat

# URL de connexion à ta base MySQL de test
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/data"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crée les tables si elles n'existent pas (exécuté avant tous les tests)
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    # Optionnel : vider tables ou drop base si tu veux après tests
    # Base.metadata.drop_all(bind=engine)

# Fixture session DB par test
@pytest.fixture(scope="function")
def db_session():
    session = TestingSessionLocal()

    # Nettoyer la table avant chaque test pour éviter doublons
    session.query(CovidStat).delete()
    session.commit()

    # Ajouter des données tests
    session.add_all([
        CovidStat(
            country="France",
            total_confirmed=100,
            total_deaths=10,
            total_recovered=50,
            new_cases=5,
            new_deaths=1,
            new_recovered=2,
            date_timestamp=1685000000,
        ),
        CovidStat(
            country="Germany",
            total_confirmed=200,
            total_deaths=20,
            total_recovered=150,
            new_cases=10,
            new_deaths=2,
            new_recovered=5,
            date_timestamp=1685000500,
        ),
    ])
    session.commit()

    yield session

    session.close()

# Override la dépendance FastAPI get_db pour utiliser la session de test
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_get_global_stats_api(db_session):
    response = client.get("/api/v1/covid/global")
    assert response.status_code == 200
    data = response.json()
    assert "confirmed" in data
    assert data["confirmed"] == 300

def test_get_countries_summary_api(db_session):
    response = client.get("/api/v1/covid/countries/summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(c["country"] == "France" for c in data)

def test_manage_list_countries_api(db_session):
    response = client.get("/api/v1/countries/manage")
    assert response.status_code == 200
    data = response.json()
    assert any(c["country"] == "France" for c in data)

def test_manage_update_country_api(db_session):
    payload = {
        "id": "france",
        "country": "France",
        "total_cases": 999,
        "total_deaths": 99,
        "total_recovered": 888,
    }
    response = client.put("/api/v1/countries/france", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_cases"] == 999

def test_manage_delete_country_api(db_session):
    response = client.delete("/api/v1/countries/france")
    assert response.status_code == 204
