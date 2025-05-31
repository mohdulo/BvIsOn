import axios from "axios";

// Base URL sans suffixe /api/v1, car /hello est monté à la racine
const API_ROOT = import.meta.env.VITE_API_URL_ROOT || "http://localhost:8000";

export const getHello = async (): Promise<string> => {
  const { data } = await axios.get<{ message: string }>(`${API_ROOT}/hello`);
  return data.message;
};
