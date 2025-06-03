# Server/app/api/predict.py - VERSION COMPLÈTEMENT SÉCURISÉE
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from app.schemas.prediction import InputRow, PredictionOut
from app.core.deps import get_current_user
from app.db.models.user import User
import pickle
import os
import pandas as pd

# ✅ Sécurité HTTPBearer obligatoire
security = HTTPBearer()
router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline.pkl')
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

@router.post("/predict", response_model=PredictionOut, dependencies=[Depends(security)])
def predict(
    input: InputRow,
    current_user: User = Depends(get_current_user)
):
    """Prédiction COVID-19 - ADMIN SEULEMENT"""
    
    # Vérification explicite que l'utilisateur est authentifié
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Vérification explicite du rôle admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        timestamp = input.date.timestamp()

        # ⚠️ Utilise exactement les mêmes noms de colonnes qu'à l'entraînement
        input_data = pd.DataFrame([{
            "Confirmed": input.Confirmed,
            "Deaths": input.Deaths,
            "Recovered": input.Recovered,
            "Active": input.Active,
            "New cases": input.New_cases,
            "New recovered": input.New_recovered,
            "timestamp": timestamp,
            "Country": input.Country,
            "WHO Region": input.WHO_Region
        }])

        pred = model.predict(input_data)[0]
        return {"pred_new_deaths": int(round(pred))}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.get("/predict/health", dependencies=[Depends(security)])
def health_check(current_user: User = Depends(get_current_user)):
    """Vérification santé du modèle - ADMIN SEULEMENT"""
    
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "model_loaded": True,
        "status": "healthy",
        "user": current_user.username
    }