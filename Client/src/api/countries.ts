// Client/src/api/countries.ts
import axios from 'axios';

const api = axios.create({
  baseURL:
    `${import.meta.env.VITE_API_URL_ROOT}/api/v1`,  // <-- on concatène ici
});


export interface CountrySummary {
  id: string;
  country: string;
  confirmed_total: number;
  confirmed_new: number;
  deaths_total: number;
  deaths_new: number;
}


export const fetchCountriesSummary = async (): Promise<CountrySummary[]> => {
  const { data } = await api.get<CountrySummary[]>('/covid/countries/summary');
  return data;
};