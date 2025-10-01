import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/lib/api';

interface UserLocation {
  countryCode: string;
  countryName: string;
  cityId: string;
  cityName: string;
  fullAddress: string;
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  location: UserLocation;
  createdAt: string;
  updatedAt: string;
}

export function useUserProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ Not authenticated, skipping profile fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching user profile from API...');
      const response = await apiClient.get('/api/users/profile/me'); // 🔥 NUEVA RUTA
      
      if (response.data.success) {
        console.log('👤 Profile fetched:', response.data.profile);
        setProfile(response.data.profile);
      } else {
        setError('Error en la respuesta del servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching profile:', err);
      setError(err.response?.data?.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<{
    name: string;
    surname: string;
    phone: string;
    countryCode: string;
    cityId: string;
  }>) => {
    if (!isAuthenticated || !user) {
      throw new Error('No autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Updating profile:', data);
      const response = await apiClient.put('/api/users/profile/me', data); // 🔥 NUEVA RUTA
      
      if (response.data.success) {
        console.log('✅ Profile updated:', response.data.profile);
        setProfile(response.data.profile);
        return response.data.profile;
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar perfil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfil al montar
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  // Refrescar perfil
  const refresh = () => {
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    refresh,
    updateProfile,
    // Datos derivados
    hasLocation: !!(profile?.location?.countryName && profile?.location?.cityName),
    hasCompleteAddress: !!(profile?.location?.fullAddress),
    hasPhone: !!(profile?.phone),
    // Datos de ubicación específicos
    countryCode: profile?.location?.countryCode || '',
    countryName: profile?.location?.countryName || '',
    cityId: profile?.location?.cityId || '',
    cityName: profile?.location?.cityName || '',
    fullAddress: profile?.location?.fullAddress || ''
  };
}