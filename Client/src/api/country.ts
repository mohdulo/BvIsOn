import { api } from "./index";

export interface CountryDetail {
  id: string;
  country: string;
  confirmed_total: number;
  confirmed_new: number;
  deaths_total: number;
  deaths_new: number;
  // you can extend with recovered etc. if back‑end delivers
}

/* fetch single country detail by its slug / id */
export const fetchCountryDetail = async (id: string): Promise<CountryDetail | null> => {
  const res = await api.get<CountryDetail[]>("/covid/countries/summary");
  const found = res.data.find((c) => c.id === id);
  return found ?? null;
};
