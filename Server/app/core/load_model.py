from __future__ import annotations

import pickle
from pathlib import Path

MODEL_PATH: Path = Path(__file__).resolve().parent.parent / "models" / "pipeline.pkl"

with MODEL_PATH.open("rb") as fp:
    model = pickle.load(fp)
