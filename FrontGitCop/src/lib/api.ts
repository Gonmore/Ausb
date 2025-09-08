import axios from 'axios';
import { tokenUtils } from './token-utils';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'AusbildungApp/1.0', // Custom user-agent to avoid browser detection
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

export default apiClient;
