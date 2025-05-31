import joblib
import pathlib

# ../models/pipeline.pkl
MODEL_PATH = (
    pathlib.Path(__file__)
    .resolve()
    .parent        # → core
    .parent        # → app
    / "models"
    / "pipeline.pkl"   # ← nouveau fichier
)

model = joblib.load(MODEL_PATH)
