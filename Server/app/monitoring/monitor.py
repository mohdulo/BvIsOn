"""
monitor.py — monitoring quotidien avec Deepchecks
  • calcule RMSE & R²
  • alerte si RMSE dépasse le seuil
  • sauvegarde metrics.csv
  • génère un rapport HTML Deepchecks (drift + perf)
"""

import argparse
import pathlib
import datetime
import math
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error, r2_score

from deepchecks.tabular import Dataset
from deepchecks.tabular.suites import regression_model_validation

# ─── Chemins ────────────────────────────────────────────────────────────────
BASE_DIR = pathlib.Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "app" / "models" / "covid_deaths_xgb.joblib"
METRICS_PATH = BASE_DIR / "app" / "monitoring" / "metrics.csv"
REPORT_DIR = BASE_DIR / "app" / "monitoring"
REF_DATA = BASE_DIR / "training_sample.csv"  # échantillon de référence

# ─── Variables du modèle ─────────────────────────────────────────────────────
FEATURES = [
    "Confirmed_log",
    "Confirmed_log_ma_14",
    "cases_per_million",
    "tests_per_million",
    "population",
    "density",
    "Lat",
    "Long",
]
TARGET = "Deaths_log"


# ─── Évaluation classique ────────────────────────────────────────────────────
def evaluate(y_true, y_pred):
    rmse = math.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    return rmse, r2


def append_metrics(date_str, rmse, r2):
    METRICS_PATH.parent.mkdir(exist_ok=True)
    header = not METRICS_PATH.exists()
    with METRICS_PATH.open("a") as f:
        if header:
            f.write("date,rmse_log,r2\n")
        f.write(f"{date_str},{rmse:.4f},{r2:.4f}\n")


# ─── Génération du rapport Deepchecks ────────────────────────────────────────
def generate_report(ref_df: pd.DataFrame, cur_df: pd.DataFrame, model, date_str: str):
    # Préparer les datasets pour Deepchecks
    train_ds = Dataset(ref_df, label=TARGET, cat_features=[])
    test_ds = Dataset(cur_df, label=TARGET, cat_features=[])

    # Suite combinée : validation et performance
    suite = regression_model_validation()
    result = suite.run(train_dataset=train_ds, test_dataset=test_ds, model=model)

    REPORT_DIR.mkdir(exist_ok=True)
    out_path = REPORT_DIR / f"report_{date_str}.html"
    result.save_as_html(str(out_path))
    print(f"✅ Rapport Deepchecks généré : {out_path}")


# ─── Programme principal ─────────────────────────────────────────────────────
def main(batch_csv: str, rmse_threshold: float = 0.12):
    date_str = datetime.date.today().isoformat()

    # 1) Charger le modèle
    model = joblib.load(MODEL_PATH)

    # 2) Charger le batch du jour
    df = pd.read_csv(batch_csv)
    df = df[FEATURES + [TARGET]].fillna(0)

    # 3) Prédiction & évaluation
    y_true = df[TARGET]
    y_pred = model.predict(df[FEATURES])
    rmse, r2 = evaluate(y_true, y_pred)

    # 4) Sauvegarde métriques & log
    append_metrics(date_str, rmse, r2)
    print(f"✅ {date_str}  RMSE(log)={rmse:.4f}  R²={r2:.4f}")

    # 5) Rapport drift + performance, si référence dispo
    if REF_DATA.exists():
        ref_df = pd.read_csv(REF_DATA)[FEATURES + [TARGET]].fillna(0)
        generate_report(ref_df, df, model, date_str)

    # 6) Alerte si dégradation
    if rmse > rmse_threshold:
        print("🚨 ALERTE : la RMSE dépasse le seuil !")


# ─── Entrée en CLI ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data", required=True, help="Chemin vers le batch CSV du jour"
    )
    args = parser.parse_args()
    main(args.data)
