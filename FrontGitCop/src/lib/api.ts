import axios from 'axios';
import { tokenUtils } from './token-utils';

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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        // No redirigir automáticamente desde ciertas páginas públicas
        const currentPath = window.location.pathname;
        const publicPaths = ['/ofertas', '/', '/login', '/registro'];
        
        // Solo redirigir si no estamos en una página pública
        if (!publicPaths.includes(currentPath)) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
