from fastapi.testclient import TestClient
from app.main import app
from datetime import datetime



client = TestClient(app)
created_id = None  # pour stocker l'ID temporaire


def test_create_stat():
    global created_id
    data = {
        "country": "Testland",
        "confirmed": 1234,
        "deaths": 12,
        "recovered": 1000,
        "active": 222,
        "new_cases": 50,
        "new_deaths": 2,
        "new_recovered": 45,
        "continent": "TestContinent",
        "date": datetime.now().isoformat()
    }
    response = client.post("/covid_stats/", json=data)
    assert response.status_code == 200
    created_id = response.json()["id"]  # ✅ bien récupérer l'id ici

def test_read_stats():
    response = client.get("/covid_stats/")
    print("\n--- RÉPONSE DE L'API ---")
    print(response.json())  # 👈 ici on affiche le contenu de la réponse
    print("--- FIN DE RÉPONSE ---\n")
    assert response.status_code == 200

def test_update_stat():
    global created_id
    assert created_id is not None
    data = {
        "country": "UpdatedLand",
        "confirmed": 9999,
        "deaths": 999,
        "recovered": 5000,
        "active": 4000,
        "new_cases": 888,
        "new_deaths": 777,
        "new_recovered": 666,
        "continent": "UpdatedContinent",
        "date": datetime.now().isoformat()
    }
    response = client.put(f"/covid_stats/{created_id}", json=data)
    assert response.status_code == 200
    assert response.json()["country"] == "UpdatedLand"

def test_delete_stat():
    global created_id
    assert created_id is not None
    response = client.delete(f"/covid_stats/{created_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Suppression réussie"