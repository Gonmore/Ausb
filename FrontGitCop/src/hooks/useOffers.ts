import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/lib/api';

interface Offer {
  id: number;
  name: string;
  location: string;
  mode: string;
  type: string;
  description: string;
  tag: string;
  createdAt: string;
  candidates: any[];
  candidateStats: {
    total: number;
    byAffinity: {
      'muy alto': number;
      'alto': number;
      'medio': number;
      'bajo': number;
      'sin datos': number;
    };
  };
  offerSkills: {[key: string]: number};
  skills?: { id: number; name: string }[];
  profamily?: {
    id: number;
    name: string;
    description?: string;
  };
  profamilys?: {
    id: number;
    name: string;
    description?: string;
  }[];
}

export const useOffers = () => {
  const { token } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 Función de fetch optimizada
  const fetchOffers = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/offers/company-with-candidates');
      setOffers(response.data);
      console.log('✅ Ofertas cargadas:', response.data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error cargando ofertas:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🚀 Función para eliminar oferta optimizada
  const deleteOffer = useCallback(async (offerId: number): Promise<boolean> => {
    if (!token) return false;

    try {
      await apiClient.delete(`/api/offers/${offerId}`);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      return true;
    } catch (err) {
      console.error('❌ Error eliminando oferta:', err);
      return false;
    }
  }, [token]);

  // 🚀 Estadísticas memoizadas
  const offerStats = useMemo(() => {
    return {
      total: offers.length,
      withCandidates: offers.filter(o => (o.candidateStats?.total || 0) > 0).length,
      totalCandidates: offers.reduce((sum, o) => sum + (o.candidateStats?.total || 0), 0),
      averageCandidatesPerOffer: offers.length > 0 
        ? Math.round(offers.reduce((sum, o) => sum + (o.candidateStats?.total || 0), 0) / offers.length)
        : 0
    };
  }, [offers]);

  // Cargar ofertas al montar el componente
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    loading,
    error,
    offerStats,
    fetchOffers,
    deleteOffer,
    // Funciones de utilidad
    refetch: fetchOffers
  };
};