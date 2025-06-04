// Client/src/api/analytics.ts
import { api } from "./index";
import { AxiosError } from "axios";

export interface CountryData {
  name: string;
  value: number;
}

export interface TrendData {
  name: string; // date ISO
  value: number;
}

export interface AnalyticsData {
  totalByCountry: CountryData[];
  newByCountry: CountryData[];
  cumulativeTrend: TrendData[];
}

// Helper function pour gérer les erreurs de manière consistante
const handleApiError = (error: unknown, operation: string): never => {
  if (error instanceof Error) {
    console.error(`Error in ${operation}:`, error.message);
  } else {
    console.error(`Unknown error in ${operation}:`, error);
  }
  throw error;
};

// Helper function pour vérifier si c'est une erreur Axios
const isAxiosError = (error: unknown): error is AxiosError => {
  return error !== null && typeof error === 'object' && 'response' in error;
};

// Appels API pour les analytics avec gestion d'erreurs améliorée
export const fetchTopCountries = async (metric: string, limit: number = 10): Promise<CountryData[]> => {
  try {
    const response = await api.get<CountryData[]>(`/analytics/${metric}/top`, {
      params: { limit }
    });
    console.log(`Top ${metric} data:`, response.data);
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, `fetchTopCountries for ${metric}`);
    return []; // Add return statement after handleApiError
  }
};

export const fetchNewCases = async (metric: string, limit: number = 10): Promise<CountryData[]> => {
  try {
    const response = await api.get<CountryData[]>(`/analytics/${metric}/new`, {
      params: { limit }
    });
    console.log(`New ${metric} data:`, response.data);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching new ${metric}:`, errorMessage);
    
    // Si l'endpoint /new échoue, retourner un tableau vide plutôt que de faire échouer toute la requête
    if (isAxiosError(error) && error.response?.status === 500) {
      console.warn(`Endpoint /new for ${metric} failed, returning empty array`);
      return [];
    }
    throw error;
  }
};

export const fetchTrend = async (metric: string, days: number = 30): Promise<TrendData[]> => {
  try {
    const response = await api.get<TrendData[]>(`/analytics/${metric}/trend`, {
      params: { days }
    });
    console.log(`Trend ${metric} data:`, response.data);
    return response.data;
  } catch (error: unknown) {
    handleApiError(error, `fetchTrend for ${metric}`);
    return []; // Add return statement after handleApiError
  }
};

// Fonction pour récupérer toutes les données analytics en une fois
export const fetchAnalyticsData = async (metric: string): Promise<AnalyticsData> => {
  try {
    console.log(`Fetching analytics data for metric: ${metric}`);
    
    // Exécuter les requêtes en parallèle mais gérer les erreurs individuellement
    const results = await Promise.allSettled([
      fetchTopCountries(metric, 10),
      fetchNewCases(metric, 10),
      fetchTrend(metric, 30)
    ]);

    const topData = results[0].status === 'fulfilled' ? results[0].value : [];
    const newData = results[1].status === 'fulfilled' ? results[1].value : [];
    const trendData = results[2].status === 'fulfilled' ? results[2].value : [];

    // Log les erreurs mais ne pas faire échouer toute la requête
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const endpoints = ['top', 'new', 'trend'];
        const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
        console.error(`Error in ${endpoints[index]} endpoint:`, reason);
      }
    });

    return {
      totalByCountry: topData,
      newByCountry: newData,
      cumulativeTrend: trendData
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Erreur lors de la récupération des données analytics pour ${metric}:`, errorMessage);
    throw error;
  }
};

// Fonction pour tester individuellement chaque endpoint
export const testEndpoints = async (metric: string): Promise<void> => {
  const endpoints = [
    { name: 'top', fn: () => fetchTopCountries(metric, 5) },
    { name: 'new', fn: () => fetchNewCases(metric, 5) },
    { name: 'trend', fn: () => fetchTrend(metric, 7) }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name} endpoint...`);
      const data = await endpoint.fn();
      console.log(`✅ ${endpoint.name} endpoint working:`, data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${endpoint.name} endpoint failed:`, errorMessage);
    }
  }
};