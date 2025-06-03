// src/api/predict.ts - VERSION CORRIGÉE AVEC AUTHENTIFICATION
import { api } from "./index";  // ✅ Utiliser l'API sécurisée au lieu d'axios direct

export interface InputRow {
  Confirmed: number;
  Deaths: number;
  Recovered: number;
  Active: number;
  New_cases: number;
  New_recovered: number;
  date: string; // Date ISO string
  Country: string;
  WHO_Region: string;
}

export interface Metadata {
  who_regions: string[];
  countries_by_region: {
    [region: string]: string[];
  };
}

export interface PredictionOut {
  pred_new_deaths: number;
}

// ✅ Fonction de prédiction avec authentification
export async function predict(row: InputRow): Promise<PredictionOut> {
  try {
    console.log('🔍 Making prediction request...');
    const { data } = await api.post<PredictionOut>("/predict", row);
    console.log('✅ Prediction successful:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Prediction error:', error);
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Accès refusé. Authentification admin requise.');
    }
    
    throw new Error(error.response?.data?.detail || 'Erreur lors de la prédiction');
  }
}

// ✅ Fonction metadata avec authentification sécurisée
export async function getMetadata(): Promise<Metadata> {
  try {
    console.log('🔍 Fetching metadata...');
    const response = await api.get<Metadata>("/metadata");  // ✅ Utilise l'API sécurisée
    console.log('✅ Metadata received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Metadata error:', error);
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      throw new Error('Accès refusé. Authentification admin requise.');
    }
    
    throw new Error(error.response?.data?.detail || 'Erreur récupération metadata');
  }
}