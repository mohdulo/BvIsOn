from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

@router.get("/metadata")
def get_metadata():
    csv_path = os.path.join("app", "data", "data_cleaned_used.csv")
    df = pd.read_csv(csv_path)

    countries = sorted(df["Country"].dropna().unique().tolist())
    regions = sorted(df["WHO Region"].dropna().unique().tolist())

    return {
        "countries": countries,
        "who_regions": regions
    }
