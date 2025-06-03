import pickle
import sys
import numpy as np
import xgboost as xgb

model_path = "Server/app/models/pipeline.pkl"

# 1) Chargement du modèle
try:
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print("✅ Model deserialized")
except Exception as e:
    print(f"❌ Unable to load model from {model_path}: {e}")
    sys.exit(1)


# 2) Extraction de l'estimateur
def get_estimator(obj):
    if hasattr(obj, "get_booster"):
        return obj
    if hasattr(obj, "named_steps") and "model" in obj.named_steps:
        return obj.named_steps["model"]
    return None


est = get_estimator(model)

# 3) Prédiction de test
try:
    if est is not None:
        booster = est.get_booster()
        n_feats = booster.num_features()
        dmat = xgb.DMatrix(np.zeros((1, n_feats), dtype=np.float32))
        booster.predict(dmat)
    else:
        n_feats = getattr(model, "n_features_in_", 1)
        model.predict(np.zeros((1, n_feats), dtype=np.float32))
    print("✅ predict() ran successfully")
except Exception as e:
    print(f"❌ Model loaded, but prediction failed: {e}")
    sys.exit(1)
