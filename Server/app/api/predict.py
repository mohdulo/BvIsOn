from fastapi import APIRouter
from app.schemas.prediction import InputRow, PredictionOut
import pickle
import os
# from datetime import datetime

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'pipeline.pkl')
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

import pandas as pd

@router.post("/predict", response_model=PredictionOut)
def predict(input: InputRow):
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


# # Chargement du DataFrame utilisé pour l'entraînement (à adapter selon ton projet)
# df = pd.read_csv("chemin/vers/ton_df.csv")  # ou ton df original en mémoire

# @router.get("/api/v1/metadata")
# def get_metadata():
#     countries = sorted(df['Country'].dropna().unique().tolist())
#     regions = sorted(df['WHO_Region'].dropna().unique().tolist())
#     return {
#         "countries": countries,
#         "regions": regions
#     }
