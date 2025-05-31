"""
monitor.py — Exécute le modèle XGBoost sur un batch quotidien :
  ➜ calcule RMSE / R²
  ➜ alerte si la performance chute
  ➜ sauvegarde metrics.csv et un rapport HTML Evidently
"""

import argparse, pathlib, datetime, math, joblib, pandas as pd, numpy as np
from sklearn.metrics import mean_squared_error, r2_score
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, RegressionPreset

# Chemins
BASE_DIR = pathlib.Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "app" / "models" / "covid_deaths_xgb.joblib"
METRICS_PATH = BASE_DIR / "app" / "monitoring" / "metrics.csv"
REPORT_DIR = BASE_DIR / "app" / "monitoring"
REF_DATA = BASE_DIR / "training_sample.csv"  # référence pour drift

# Variables du modèle
FEATURES = ['Confirmed_log', 'Confirmed_log_ma_14', 'cases_per_million',
            'tests_per_million', 'population', 'density', 'Lat', 'Long']
TARGET = "Deaths_log"

# Évaluation
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

def generate_report(ref_df, cur_df, date_str):
    report = Report(metrics=[DataDriftPreset(), RegressionPreset()])
    report.run(reference_data=ref_df, current_data=cur_df)
    REPORT_DIR.mkdir(exist_ok=True)
    report.save_html(REPORT_DIR / f"report_{date_str}.html")

# Programme principal
def main(batch_csv: str, rmse_threshold: float = 0.12):
    date_str = datetime.date.today().isoformat()

    model = joblib.load(MODEL_PATH)
    df = pd.read_csv(batch_csv)
    df = df[FEATURES + [TARGET]].fillna(0)

    y_true = df[TARGET]
    y_pred = model.predict(df[FEATURES])

    rmse, r2 = evaluate(y_true, y_pred)
    append_metrics(date_str, rmse, r2)
    print(f"✅ {date_str}  RMSE={rmse:.4f}  R²={r2:.4f}")

    # Drift report
    if REF_DATA.exists():
        ref_df = pd.read_csv(REF_DATA)[FEATURES + [TARGET]].fillna(0)
        generate_report(ref_df, df, date_str)

    # Alerte
    if rmse > rmse_threshold:
        print("🚨 ALERTE : la RMSE dépasse le seuil !")

# Exécution CLI
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Chemin vers le batch CSV du jour")
    args = parser.parse_args()
    main(args.data)
