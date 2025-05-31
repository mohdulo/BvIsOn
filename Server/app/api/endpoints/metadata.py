from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

@router.get("/metadata")
def get_metadata():
    csv_path = os.path.join("app", "data", "data_cleaned_used.csv")
    df = pd.read_csv(csv_path)

    # Nettoyage
    df = df.dropna(subset=["Country", "WHO Region"])
    
    regions = sorted(df["WHO Region"].unique().tolist())

    # Mapping région -> [pays...]
    region_country_map = {}
    for region in regions:
        countries = df[df["WHO Region"] == region]["Country"].unique().tolist()
        region_country_map[region] = sorted(countries)

    return {
        "who_regions": regions,
        "countries_by_region": region_country_map
    }