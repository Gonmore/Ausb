import axios from 'axios';
import { tokenUtils } from './token-utils';
import { useAuthStore } from '@/stores/auth';

// ⚠️ CAMBIAR LA URL BASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // ← Sin /api por defecto

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = tokenUtils.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Token was expired and removed
        console.log('🕒 No valid token available');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si es error 401 (no autorizado) o 403 (token expirado)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.mensaje || error.response?.data?.message;
      
      // Si el mensaje indica token expirado o inválido
      if (errorMessage?.includes('expirado') || 
          errorMessage?.includes('expired') || 
          errorMessage?.includes('invalid') ||
          errorMessage?.includes('inválido') ||
          error.response?.status === 401) {
        
        console.log('🔥 Token expirado detectado, limpiando sesión...');
        
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('auth-storage');
          
          // Limpiar el store de Zustand
          const { logout } = useAuthStore.getState();
          logout();
          
          // Redirigir al login
          window.location.href = '/login?expired=true';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const onboardingApi = {
  checkStatus: () => {
    console.log('🔍 Calling checkStatus');
    return apiClient.get('/onboarding/status'); // ← Sin /api, igual que auth
  },
  getNextStep: () => apiClient.get('/onboarding/next-step'),
  completeStep: (step: string) => apiClient.post('/onboarding/complete-step', { step }),
  getRecommendedOffers: () => apiClient.get('/onboarding/recommended-offers'),
};

export const authApi = {
  login: (credentials: { email: string; password: string }) => {
    return apiClient.post('/api/auth/login', credentials);
  },
  register: (userData: any) => {
    return apiClient.post('/api/auth/register', userData);
  },
  logout: () => 
    apiClient.post('/api/auth/logout'),
};

export default apiClient;
