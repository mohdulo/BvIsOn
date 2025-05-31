// Client/src/api/analytics.ts
import { api } from "./index";

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

// Appels API pour les analytics avec gestion d'erreurs améliorée
export const fetchTopCountries = async (metric: string, limit: number = 10): Promise<CountryData[]> => {
  try {
    const response = await api.get<CountryData[]>(`/analytics/${metric}/top`, {
      params: { limit }
    });
    console.log(`Top ${metric} data:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching top ${metric}:`, error);
    throw error;
  }
};

export const fetchNewCases = async (metric: string, limit: number = 10): Promise<CountryData[]> => {
  try {
    const response = await api.get<CountryData[]>(`/analytics/${metric}/new`, {
      params: { limit }
    });
    console.log(`New ${metric} data:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching new ${metric}:`, error);
    // Si l'endpoint /new échoue, retourner un tableau vide plutôt que de faire échouer toute la requête
    if (error.response?.status === 500) {
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
  } catch (error) {
    console.error(`Error fetching trend ${metric}:`, error);
    throw error;
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
        console.error(`Error in ${endpoints[index]} endpoint:`, result.reason);
      }
    });

    return {
      totalByCountry: topData,
      newByCountry: newData,
      cumulativeTrend: trendData
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des données analytics pour ${metric}:`, error);
    throw error;
  }
};

// Fonction pour tester individuellement chaque endpoint
export const testEndpoints = async (metric: string) => {
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
    } catch (error) {
      console.error(`❌ ${endpoint.name} endpoint failed:`, error);
    }
  }
};