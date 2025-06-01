import { api } from "./index";

/* ----------- shape venant du back-end (snake_case) ----------- */
export interface CountryManage {
  id: string;
  country: string;
  total_cases: number;
  total_deaths: number;
  total_recovered: number;
}

/* ----------- shape utilisé dans le front (camelCase) ----------- */
export interface CountryData {
  id: string;
  country: string;
  totalCases: number;
  totalDeaths: number;
  totalRecovered: number;
}

/* ----------- conversions ----------- */
const toFrontend = (d: CountryManage): CountryData => ({
  id:              d.id,
  country:         d.country,
  totalCases:      d.total_cases,
  totalDeaths:     d.total_deaths,
  totalRecovered:  d.total_recovered,
});

const toBackend = (d: CountryData): CountryManage => ({
  id:              d.id,
  country:         d.country,
  total_cases:     d.totalCases,
  total_deaths:    d.totalDeaths,
  total_recovered: d.totalRecovered,
});

/* ----------- appels CRUD ----------- */

/** GET  /covid/countries/manage */
export const fetchCountries = () =>
  api
    .get<CountryManage[]>("/covid/countries/manage")
    .then((r) => r.data.map(toFrontend));

/** PUT  /covid/countries/:id */
export const saveCountry = (payload: CountryData) =>
  api
    .put<CountryManage>(`/covid/countries/${payload.id}`, toBackend(payload))
    .then((r) => toFrontend(r.data));

/** DELETE  /covid/countries/:id */
export const deleteCountry = (id: string) =>
  api.delete(`/covid/countries/${id}`);
