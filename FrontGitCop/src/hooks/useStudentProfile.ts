import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/lib/api';

interface StudentProfile {
  id: number;
  grade: string;
  course: string;
  car: boolean;
  tag: string;
  description: string;
  photo: string; // Foto del estudiante
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    description: string;
  };
  profamily: {
    id: number;
    name: string;
    description: string;
  } | null;
  scenter: {
    id: number;
    name: string;
  } | null;
}

export function useStudentProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentProfile = async () => {
    if (!isAuthenticated || !user || user.role !== 'student') {
      console.log('❌ Not authenticated or not a student, skipping student profile fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching student profile from API...');
      const response = await apiClient.get('/api/students/me');

      console.log('👨‍🎓 Student profile fetched:', response.data);
      setStudentProfile(response.data);

    } catch (err: any) {
      console.error('❌ Error fetching student profile:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar perfil de estudiante');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentProfile = async (data: Partial<{
    grade: string;
    course: string;
    car: boolean;
    tag: string;
    description: string;
    photo: string;
    scenter_id: number;
    profamily_id: number;
  }>) => {
    if (!isAuthenticated || !user || !studentProfile) {
      throw new Error('No autenticado o perfil no disponible');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Updating student profile:', data);
      const response = await apiClient.put(`/api/students/${studentProfile.id}`, data);

      console.log('✅ Student profile updated:', response.data);
      // Refrescar el perfil después de actualizar
      await fetchStudentProfile();
      return response.data;

    } catch (err: any) {
      console.error('❌ Error updating student profile:', err);
      const errorMessage = err.response?.data?.mensaje || 'Error al actualizar perfil de estudiante';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfil al montar
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'student') {
      fetchStudentProfile();
    }
  }, [isAuthenticated, user]);

  // Refrescar perfil
  const refresh = () => {
    fetchStudentProfile();
  };

  return {
    studentProfile,
    loading,
    error,
    refresh,
    updateStudentProfile,
    // Datos derivados
    hasGrade: !!(studentProfile?.grade),
    hasCourse: !!(studentProfile?.course),
    hasCar: studentProfile?.car !== undefined,
    hasProfamily: !!(studentProfile?.profamily),
    hasScenter: !!(studentProfile?.scenter),
    hasSkills: !!(studentProfile?.tag && studentProfile.tag.trim().length > 0),
    hasDescription: !!(studentProfile?.description && studentProfile.description.trim().length > 10),
    hasPhoto: !!(studentProfile?.photo && studentProfile.photo.trim().length > 0)
  };
}