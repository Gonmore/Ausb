import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/lib/api';

interface OnboardingStep {
  step: string;
  title: string;
  description: string;
  action: 'redirect' | 'modal' | 'inline';
  url?: string;
  priority: 'high' | 'medium' | 'low';
  details?: any;
}

interface OnboardingStatus {
  userId: number;
  role: string;
  user: {
    hasBasicInfo: boolean;
    hasPhone: boolean;
    hasProfileComplete: boolean;
  };
  currentStep: string;
  nextSteps: OnboardingStep[];
  isComplete: boolean;
  recommendations: any[];
}

export function useOnboarding() {
  const { user, isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar estado del onboarding
  const checkStatus = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/onboarding/status');
      setStatus(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar onboarding');
      console.error('Error checking onboarding status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Marcar paso como completado
  const completeStep = async (step: string) => {
    try {
      await apiClient.post('/onboarding/complete-step', { step });
      await checkStatus(); // Recargar estado
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al completar paso');
      throw err;
    }
  };

  // Obtener ofertas recomendadas
  const getRecommendedOffers = async () => {
    try {
      const response = await apiClient.get('/onboarding/recommended-offers');
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener ofertas recomendadas');
      throw err;
    }
  };

  // Cargar estado inicial
  useEffect(() => {
    if (isAuthenticated && user) {
      checkStatus();
    }
  }, [isAuthenticated, user]);

  // Helpers
  const hasNextStep = status?.nextSteps && status.nextSteps.length > 0;
  const nextStep = status?.nextSteps?.[0];
  const isComplete = status?.isComplete || false;
  const shouldShowGuide = hasNextStep && nextStep?.priority === 'high';

  return {
    status,
    loading,
    error,
    hasNextStep,
    nextStep,
    isComplete,
    shouldShowGuide,
    checkStatus,
    completeStep,
    getRecommendedOffers,
    clearError: () => setError(null)
  };
}