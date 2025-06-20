import pickle
import pathlib

# ../models/pipeline.pkl
MODEL_PATH = (
    pathlib.Path(__file__)
    .resolve()
    .parent        # → core
    .parent        # → app
    / "models"
    / "pipeline.pkl"
)

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

