// src/api/index.ts - VERSION CORRIGÉE DÉFINITIVE
import axios from "axios";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL_ROOT}/api/v1`,
});

// ✅ Intercepteur de requête - Ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    // Debug pour voir si le token est présent
    console.log('🔍 Interceptor check:', {
      url: config.url,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'No token'
    });
    
    if (token) {
      // S'assurer que les headers existent
      if (!config.headers) {
        config.headers = {} as import("axios").AxiosRequestHeaders;
      }
      
      // Ajouter le token Bearer
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Intercepteur de réponse - Gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config?.url, response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ API Error:', {
      status,
      url,
      message: error.response?.data?.detail || error.message
    });
    
    // Gestion spécifique des erreurs d'authentification
    if (status === 401 || status === 403) {
      console.warn('🔒 Authentication error - clearing token and redirecting');
      
      // Supprimer le token invalide
      localStorage.removeItem('auth_token');
      localStorage.removeItem('selected_country');
      
      // Rediriger vers login seulement si pas déjà sur la page login
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login page');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ Fonction utilitaire pour tester l'API avec token
export const testApiWithToken = async () => {
  const token = localStorage.getItem('auth_token');
  console.log('🧪 Testing API with token:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.error('❌ No token to test with');
    return;
  }
  
  try {
    const response = await api.get('/covid/global');
    console.log('✅ API test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API test failed:', error);
    throw error;
  }
};