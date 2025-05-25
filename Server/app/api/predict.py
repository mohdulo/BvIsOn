from fastapi import APIRouter, HTTPException
import pandas as pd, numpy as np
from app.core.load_model import model
from app.schemas.prediction import InputRow, PredictionOut

router = APIRouter(prefix="/api/v1", tags=["predict"])
FEATURES = ['Confirmed_log', 'Confirmed_log_ma_14', 'cases_per_million',
            'tests_per_million', 'population', 'density', 'Lat', 'Long']

@router.post("/predict", response_model=PredictionOut)
def predict(row: InputRow):
    try:
        X = pd.DataFrame([row.dict()])[FEATURES]
        pred_log = float(model.predict(X)[0])
        deaths   = float(round(np.exp(pred_log) - 1, 0))
        return {"pred_log": pred_log, "pred_deaths": deaths}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
