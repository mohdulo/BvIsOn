import joblib, pathlib

MODEL_PATH = pathlib.Path(__file__).resolve().parent.parent / "models" / "covid_deaths_xgb.joblib"
model = joblib.load(MODEL_PATH)
