'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useAuthStore } from '@/stores/auth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { apiClient } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  FileText,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserProfile {
  name: string;
  surname: string;
  phone: string;
  countryCode: string;
  cityId: string;
  cityName: string;
  countryName: string;
  fullAddress: string;
}

interface StudentProfile {
  car: boolean;
}

function EditarPerfilContent() {
  const { user, token } = useAuthStore();
  const { profile, loading, error } = useUserProfile();
  const router = useRouter();

  const [formData, setFormData] = useState<StudentProfile>({
    car: false
  });

  const [userFormData, setUserFormData] = useState<UserProfile>({
    name: '',
    surname: '',
    phone: '',
    countryCode: '',
    cityId: '',
    cityName: '',
    countryName: '',
    fullAddress: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Load current user and student data
  useEffect(() => {
    if (profile) {
      // Load user data
      setUserFormData({
        name: profile.name || '',
        surname: profile.surname || '',
        phone: profile.phone || '',
        countryCode: profile.location?.countryCode || '',
        cityId: profile.location?.cityId || '',
        cityName: profile.location?.cityName || '',
        countryName: profile.location?.countryName || '',
        fullAddress: profile.location?.fullAddress || ''
      });
    }

    if (profile && (profile as any).student) {
      const studentData = (profile as any).student;
      setFormData({
        car: studentData.car || false
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof StudentProfile, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserInputChange = (field: keyof UserProfile, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !token) return;

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      // Actualizar datos del usuario (nombre, apellido, teléfono, ubicación)
      await apiClient.put('/api/users/profile/me', {
        name: userFormData.name,
        surname: userFormData.surname,
        phone: userFormData.phone,
        countryCode: userFormData.countryCode,
        cityId: userFormData.cityId
      });

      // Actualizar datos del estudiante (solo movilidad)
      const studentData = {
        car: formData.car
      };

      await apiClient.put(`/api/students/${user.id}`, studentData);

      setSaveStatus('success');
      setSaveMessage('Perfil actualizado exitosamente');
      // Redirect back to CV page after a short delay
      setTimeout(() => {
        router.push('/mi-cv');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
      setSaveMessage(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Error al cargar el perfil
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="text-gray-600 mt-1">
            Actualiza tu información personal básica
          </p>
        </div>

        {/* Status Messages */}
        {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            saveStatus === 'success'
              ? 'bg-green-50 border border-green-200'
              : saveStatus === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            {saveStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : saveStatus === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            <span className={
              saveStatus === 'success' ? 'text-green-800' :
              saveStatus === 'error' ? 'text-red-800' : 'text-blue-800'
            }>
              {saveMessage}
            </span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Información Personal
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => handleUserInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={userFormData.surname}
                  onChange={(e) => handleUserInputChange('surname', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tu apellido"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) => handleUserInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+54 9 11 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  value={userFormData.countryName}
                  onChange={(e) => handleUserInputChange('countryName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Argentina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={userFormData.cityName}
                  onChange={(e) => handleUserInputChange('cityName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Buenos Aires"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={userFormData.fullAddress}
                  onChange={(e) => handleUserInputChange('fullAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Calle 123, Barrio Centro"
                />
              </div>
            </div>
          </div>

          {/* Mobility Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Car className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Movilidad
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.car}
                    onChange={(e) => handleInputChange('car', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ¿Tienes acceso a un vehículo?
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-7">
                  Indica si tienes disponibilidad de transporte propio
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditarPerfilPage() {
  return (
    <AuthGuard requireAuth={true}>
      <EditarPerfilContent />
    </AuthGuard>
  );
}