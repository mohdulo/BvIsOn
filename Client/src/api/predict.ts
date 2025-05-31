// src/api/predict.ts
import axios from "axios";

export interface InputRow {
  Confirmed: number;
  Deaths: number;
  Recovered: number;
  Active: number;
  New_cases: number;
  New_recovered: number;
  date: string; // Date ISO string
  Country: string;
  WHO_Region: string;
}

export interface Metadata {
  who_regions: string[];
  countries_by_region: {
    [region: string]: string[];
  };
}

export interface PredictionOut {
  pred_new_deaths: number;
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL_ROOT}/api/v1`,
});

export async function predict(row: InputRow) {
  const { data } = await api.post<PredictionOut>("/predict", row);
  return data;
}

export async function getMetadata(): Promise<Metadata> {
  const res = await fetch("http://localhost:8000/api/v1/metadata");
  if (!res.ok) throw new Error("Erreur récupération metadata");
  return res.json();
}
