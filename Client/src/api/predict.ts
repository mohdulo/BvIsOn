import axios from "axios";

/* ---------- Types ---------- */
export interface InputRow {
  Confirmed_log: number;
  Confirmed_log_ma_14: number;
  cases_per_million: number;
  tests_per_million: number;
  population: number;
  density: number;
  Lat: number;
  Long: number;
}

export interface Prediction {
  pred_log: number;
  pred_deaths: number;
}

/* ---------- Axios instance ---------- */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL_ROOT}/api/v1`,
});

/* ---------- Function ---------- */
export async function predict(row: InputRow) {
  const { data } = await api.post<Prediction>("/predict", row);
  return data;
}
