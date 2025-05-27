import { api } from "./index";

export interface CountryManage {
  id: string;
  country: string;
  total_cases: number;
  total_deaths: number;
  total_recovered: number;
}

/* liste */
export const fetchManageList = () =>
  api.get<CountryManage[]>("/covid/countries/manage").then((r) => r.data);

/* update */
export const updateCountry = (payload: CountryManage) =>
  api.put<CountryManage>(`/covid/countries/${payload.id}`, payload).then((r) => r.data);

/* delete */
export const deleteCountry = (id: string) =>
  api.delete(`/covid/countries/${id}`);
