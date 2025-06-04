"""COVID‑19 death prediction endpoints – Black formatted.
Provides a `/predict` POST route secured by HTTPBearer and restricted to admin
users, plus a simple health‑check.
"""

from __future__ import annotations

import os
import pickle
import logging
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer

from app.core.deps import get_current_user
from app.db.models.user import User
from app.schemas.prediction import InputRow, PredictionOut

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

security = HTTPBearer()
router = APIRouter()
logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "pipeline.pkl"
with MODEL_PATH.open("rb") as f:
    model = pickle.load(f)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post("/predict", response_model=PredictionOut, dependencies=[Depends(security)])
def predict(
    input: InputRow,
    current_user: User = Depends(get_current_user),
):
    """Return the predicted number of new deaths (admin‑only)."""

    # --- AuthN / AuthZ ------------------------------------------------------
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # --- Prediction ---------------------------------------------------------
    try:
        timestamp = input.date.timestamp()
        input_data = pd.DataFrame(
            [
                {
                    "Confirmed": input.Confirmed,
                    "Deaths": input.Deaths,
                    "Recovered": input.Recovered,
                    "Active": input.Active,
                    "New cases": input.New_cases,
                    "New recovered": input.New_recovered,
                    "timestamp": timestamp,
                    "Country": input.Country,
                    "WHO Region": input.WHO_Region,
                }
            ]
        )

        pred = model.predict(input_data)[0]
        return {"pred_new_deaths": int(round(pred))}

    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


@router.get("/predict/health", dependencies=[Depends(security)])
def health_check(current_user: User = Depends(get_current_user)):
    """Return model health status (admin‑only)."""

    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return {
        "model_loaded": True,
        "status": "healthy",
        "user": current_user.username,
    }
