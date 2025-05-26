// Client/src/api/index.ts
import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL_ROOT}/api/v1`,
});
