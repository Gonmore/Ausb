import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/lib/api';

interface Application {
  id: number;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  cvViewed: boolean;
  message?: string;
  offer?: {
    id: number;
    name: string;
    location: string;
    sector: string;
    type: string;
  };
}

interface ApplicationsData {
  applications: Application[];
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  reviewed: number;
}

export function useApplications() {
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<ApplicationsData>({
    applications: [],
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    reviewed: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, skipping applications fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching applications from /api/applications/user');
      const response = await apiClient.get('/api/applications/user');
      
      // 🔍 DEBUG: Ver la respuesta completa
      console.log('📋 Raw API response:', response);
      console.log('📋 Response data:', response.data);
      console.log('📋 Response status:', response.status);
      
      // Intentar diferentes estructuras de respuesta
      let applications = [];
      
      if (response.data.applications) {
        applications = response.data.applications;
        console.log('✅ Found applications in response.data.applications');
      } else if (Array.isArray(response.data)) {
        applications = response.data;
        console.log('✅ Found applications in response.data (array)');
      } else if (response.data.data && response.data.data.applications) {
        applications = response.data.data.applications;
        console.log('✅ Found applications in response.data.data.applications');
      } else if (response.data.data && Array.isArray(response.data.data)) {
        applications = response.data.data;
        console.log('✅ Found applications in response.data.data (array)');
      } else {
        console.log('❌ No applications found in any expected structure');
        console.log('📋 Available keys in response.data:', Object.keys(response.data || {}));
      }
      
      console.log('📋 Final applications array:', applications);
      console.log('📋 Applications count:', applications.length);

      // Calcular estadísticas
      const stats = {
        applications: applications || [],
        total: applications.length,
        pending: applications.filter((app: Application) => app.status === 'pending' || !app.status).length,
        accepted: applications.filter((app: Application) => app.status === 'accepted').length,
        rejected: applications.filter((app: Application) => app.status === 'rejected').length,
        reviewed: applications.filter((app: Application) => app.status === 'reviewed').length,
      };

      console.log('📊 Calculated stats:', stats);
      setData(stats);
      
    } catch (err: any) {
      console.error('❌ Error fetching applications:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setError(err.response?.data?.message || 'Error al cargar aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar aplicaciones
  const refresh = () => {
    console.log('🔄 Refreshing applications...');
    fetchApplications();
  };

  // Cargar aplicaciones al montar
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('👤 User authenticated, fetching applications...');
      fetchApplications();
    } else {
      console.log('❌ User not authenticated, skipping applications fetch');
    }
  }, [isAuthenticated, user]);

  return {
    ...data,
    loading,
    error,
    refresh,
    hasApplications: data.total > 0
  };
}