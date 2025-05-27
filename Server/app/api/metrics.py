import pathlib, pandas as pd
from fastapi import APIRouter, HTTPException
from app.schemas.metrics import Metric

router = APIRouter(prefix="/api/v1",tags=["metrics"])
METRICS_PATH = pathlib.Path(__file__).resolve().parent.parent / "monitoring" / "metrics.csv"

@router.get("/metrics", response_model=list[Metric])
def get_metrics():
    if not METRICS_PATH.exists():
        raise HTTPException(status_code=404, detail="Fichier metrics non trouvé")

    try:
        df = pd.read_csv(METRICS_PATH, parse_dates=["date"])
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=500, detail="Le fichier metrics.csv est vide")

    if df.empty:
        raise HTTPException(status_code=204, detail="Aucune métrique enregistrée")

    return df.to_dict(orient="records")
