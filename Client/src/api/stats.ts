// Client/src/api/stats.ts
import { api } from "./index";

export interface GlobalStats {
  confirmed: number;
  deaths: number;
  recovered: number;
  new_confirmed: number;
  new_deaths: number;
  new_recovered: number;
  last_updated: string;         // ISO 8601 envoyé par le back
}

export const fetchGlobalStats = () =>
  api.get<GlobalStats>("/covid/global").then((res) => res.data);
