import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';

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
      
      const response = await fetch('http://localhost:5000/api/offers/company-with-candidates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data);
        console.log('✅ Ofertas cargadas:', data.length);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
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
      const response = await fetch(`http://localhost:5000/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
        return true;
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
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