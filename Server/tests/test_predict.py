from fastapi.testclient import TestClient
from app.main import app

# Création d'un client de test pour simuler des requêtes à l'API
client = TestClient(app)

def test_predict_nominal():
    """
    Cas normal : on envoie des données valides, on attend un résultat correct.
    """
    payload = {
        "Confirmed": 1000,
        "Deaths": 50,
        "Recovered": 800,
        "Active": 150,
        "New_cases": 20,
        "New_recovered": 10,
        "date": "2023-06-01T00:00:00",
        "Country": "France",
        "WHO_Region": "Europe"
    }
    # Envoi d'une requête POST sur le endpoint de prédiction
    response = client.post("/api/v1/predict", json=payload)
    # Le code retour doit être 200 (OK)
    assert response.status_code == 200
    # On vérifie que la clé attendue est dans la réponse
    assert "pred_new_deaths" in response.json()

def test_predict_missing_field():
    """
    Test d'erreur : il manque un champ obligatoire ("Active").
    On attend une erreur 422 (Unprocessable Entity).
    """
    payload = {
        "Confirmed": 1000,
        "Deaths": 50,
        "Recovered": 800,
        # "Active" est manquant ici
        "New_cases": 20,
        "New_recovered": 10,
        "date": "2023-06-01T00:00:00",
        "Country": "France",
        "WHO_Region": "Europe"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422  # Erreur de validation attendue

def test_predict_invalid_type():
    """
    Test d'erreur : on met une chaîne de caractères à la place d'un nombre.
    On attend une erreur 422 (Unprocessable Entity).
    """
    payload = {
        "Confirmed": "beaucoup",  # Valeur invalide (doit être un int)
        "Deaths": 50,
        "Recovered": 800,
        "Active": 150,
        "New_cases": 20,
        "New_recovered": 10,
        "date": "2023-06-01T00:00:00",
        "Country": "France",
        "WHO_Region": "Europe"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422  # Erreur de validation attendue

def test_predict_invalid_date():
    """
    Test d'erreur : la date n'est pas au bon format.
    On attend une erreur 422 (Unprocessable Entity).
    """
    payload = {
        "Confirmed": 1000,
        "Deaths": 50,
        "Recovered": 800,
        "Active": 150,
        "New_cases": 20,
        "New_recovered": 10,
        "date": "pas-une-date",  # Format invalide
        "Country": "France",
        "WHO_Region": "Europe"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 422  # Erreur de validation attendue
