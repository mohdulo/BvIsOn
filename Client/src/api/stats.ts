import { api } from "./index";

/* ----------------------------- global ----------------------------- */
export interface GlobalStats {
  confirmed: number;
  deaths: number;
  recovered: number;
  new_confirmed: number;
  new_deaths: number;
  new_recovered: number;
  last_updated: string; // ISO‑8601
}

export const fetchGlobalStats = () =>
  api.get<GlobalStats>("/covid/global").then((res) => res.data);

/* ----------------------------- country ---------------------------- */
export interface CountrySummary {
  id: string;
  country: string;
  confirmed_total: number;
  confirmed_new: number;
  deaths_total: number;
  deaths_new: number;
}

export const fetchCountriesSummary = () =>
  api
    .get<CountrySummary[]>("/covid/countries/summary")
    .then((res) => res.data);
