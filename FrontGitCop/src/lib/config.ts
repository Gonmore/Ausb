// Configuración de la aplicación
export const config = {
  // Backend configuration
  backend: {
    // Usar API REST si está disponible, sino localStorage
    useAPI: process.env.NEXT_PUBLIC_USE_API === 'true',
    apiURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    
    // Fallback automático si la API no está disponible
    autoFallback: true,
    
    // Timeout para requests de API
    apiTimeout: 10000,
  },
  
  // Configuración de desarrollo
  development: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
    showDebugPanel: process.env.NODE_ENV === 'development',
    mockDataEnabled: process.env.NEXT_PUBLIC_MOCK_DATA === 'true',
  },
  
  // Configuración de autenticación
  auth: {
    tokenStorageKey: 'auth-store',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Configuración de localStorage
  localStorage: {
    applicationsKey: 'user-applications',
    offersKey: 'job-offers',
    userDataKey: 'user-data',
  },
};

// Función para verificar si la API está disponible
export const checkAPIAvailability = async (): Promise<boolean> => {
  if (!config.backend.useAPI) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.backend.apiTimeout);
    
    const response = await fetch(`${config.backend.apiURL}/health`, {
      signal: controller.signal,
      method: 'GET',
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API no disponible, usando localStorage como fallback');
    return false;
  }
};

// Función para logs de debug
export const debugLog = (message: string, data?: any) => {
  if (config.development.enableDebugLogs) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

// Función para obtener configuración del entorno
export const getEnvironmentConfig = () => {
  return {
    environment: process.env.NODE_ENV,
    apiURL: config.backend.apiURL,
    useAPI: config.backend.useAPI,
    mockData: config.development.mockDataEnabled,
  };
};
