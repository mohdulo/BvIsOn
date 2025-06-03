# Server/app/tests/test_model_pipeline.py

import pickle
import numpy as np  # ou pandas selon le type de données d'entrée

# Charger le modèle pré-entraîné depuis le fichier pickle:contentReference[oaicite:7]{index=7}
with open("Server/app/models/pipeline.pkl", "rb") as f:
    model = pickle.load(f)

# Jeu de données minimal de test (à adapter selon le modèle)
X_test = np.array([[0.0, 0.0, 0.0, 0.0]])  # exemple: 4 features numériques à 0
# Sortie attendue pour cet échantillon (à définir en connaissance du modèle)
expected_output = np.array([0])  # par exemple, classe 0 attendue

# Effectuer une prédiction avec le pipeline
predicted_output = model.predict(X_test)

# Vérifier que la prédiction correspond à la valeur attendue
assert (predicted_output == expected_output).all(), \
    f"Le modèle prédict {predicted_output}, attendu {expected_output}"

print("Test du modèle ML réussi : prédiction =", predicted_output)
