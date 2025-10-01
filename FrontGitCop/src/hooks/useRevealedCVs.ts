import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/lib/api';

export const useRevealedCVs = () => {
  const { token } = useAuthStore();
  const [revealedCVs, setRevealedCVs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRevealedCVs = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await apiClient.get('/api/students/revealed-cvs');
      setRevealedCVs(response.data.revealedStudentIds);
      console.log('✅ CVs revelados cargados:', response.data.revealedStudentIds.length);
    } catch (error) {
      console.error('❌ Error cargando CVs revelados:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addRevealedCV = useCallback((studentId: number) => {
    setRevealedCVs(prev => {
      if (prev.includes(studentId)) return prev;
      return [...prev, studentId];
    });
  }, []);

  const isRevealed = useCallback((studentId: number) => {
    return revealedCVs.includes(studentId);
  }, [revealedCVs]);

  useEffect(() => {
    fetchRevealedCVs();
  }, [fetchRevealedCVs]);

  return {
    revealedCVs,
    loading,
    addRevealedCV,
    isRevealed,
    refetch: fetchRevealedCVs
  };
};