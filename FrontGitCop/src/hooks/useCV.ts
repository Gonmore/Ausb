import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUserProfile } from './useUserProfile';
import { useStudentProfile } from './useStudentProfile';
import { useApplications } from './useApplications';
import apiClient from '@/lib/api';

interface AcademicBackground {
  scenter?: number;
  profamily?: number;
  status?: 'por_egresar' | 'egresado' | 'titulado';
}

interface CvSkill {
  id: number;
  skillId: number;
  skill: {
    id: number;
    name: string;
    category?: string;
  };
  proficiencyLevel: 'bajo' | 'medio' | 'alto';
  yearsOfExperience: number;
  isHighlighted: boolean;
  notes?: string;
  addedAt: string;
}

interface CVData {
  summary: string;
  academicBackground: AcademicBackground | null;
  skills: CvSkill[];
  availability: 'immediate' | '1_month' | '3_months' | '6_months' | 'flexible';
  academicVerificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  academicVerifiedAt?: string;
}

export function useCV() {
  const { user } = useAuthStore();
  const { profile, hasLocation, hasPhone, loading: profileLoading } = useUserProfile();
  const { studentProfile, hasGrade, hasCourse, hasCar, hasProfamily, hasSkills, hasDescription, hasPhoto, hasScenter, loading: studentLoading } = useStudentProfile();
  const { hasApplications, loading: applicationsLoading } = useApplications();

  const [cvData, setCVData] = useState<CVData>({
    summary: '',
    academicBackground: null,
    skills: [],
    availability: 'flexible'
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos del CV desde la API
  useEffect(() => {
    if (user?.id && user.role === 'student') {
      loadCVData();
    }
  }, [user]);

  const loadCVData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/api/cv/student/${user.id}`);
      const cv = response.data;

      setCVData({
        summary: cv.summary || '',
        academicBackground: cv.academicBackground || null,
        skills: cv.skills || [], // Ahora cv.skills contiene CvSkill[] con información de la skill
        availability: cv.availability || 'flexible',
        academicVerificationStatus: cv.academicVerificationStatus || 'unverified',
        academicVerifiedAt: cv.academicVerifiedAt || undefined
      });
    } catch (error) {
      console.error('Error loading CV:', error);
      // CV no existe aún, usar valores por defecto
      setCVData({
        summary: studentProfile?.description || '',
        academicBackground: null,
        skills: [],
        availability: 'flexible'
      });
    } finally {
      setLoading(false);
    }
  };

  // Guardar CV
  const saveCV = async (data: Partial<CVData>) => {
    if (!user?.id) return;

    try {
      // Preparar payload para CV (sin skills, ya que se manejan por separado)
      const cvPayload = {
        summary: data.summary || cvData.summary,
        academicBackground: data.academicBackground || cvData.academicBackground,
        availability: data.availability || cvData.availability
      };

      await apiClient.post('/api/cv', cvPayload);

      // Actualizar el estado local
      setCVData(prev => ({
        ...prev,
        summary: cvPayload.summary,
        academicBackground: cvPayload.academicBackground,
        availability: cvPayload.availability
      }));

      return true;
    } catch (error) {
      console.error('Error saving CV:', error);
      return false;
    }
  };

  // Actualizar CV
  const updateCV = async (data: Partial<CVData>) => {
    if (!user?.id) return;

    try {
      // Preparar payload para CV (sin skills)
      const cvPayload = {
        summary: data.summary !== undefined ? data.summary : cvData.summary,
        academicBackground: data.academicBackground || cvData.academicBackground,
        availability: data.availability || cvData.availability
      };

      await apiClient.put(`/api/cv/student/${user.id}`, cvPayload);

      // Actualizar el estado local
      setCVData(prev => ({
        ...prev,
        summary: cvPayload.summary,
        academicBackground: cvPayload.academicBackground,
        availability: cvPayload.availability
      }));

      return true;
    } catch (error) {
      console.error('Error updating CV:', error);
      return false;
    }
  };

  // Calcular estadísticas del CV
  const calculateCVStats = () => {
    const { summary, academicBackground, skills } = cvData;

    // Información básica (40% del total)
    const hasName = !!(profile?.name && profile.name.trim().length > 0);
    const hasEmail = !!(profile?.email && profile.email.trim().length > 0);
    const hasPhone = !!(profile?.phone && profile.phone.trim().length > 0);
    const hasLocation = !!(profile?.location?.countryName && profile.location.cityName);
    const hasCar = studentProfile?.car !== undefined;
    const hasAvailability = hasCar;

    const basicFields = [hasName, hasEmail, hasPhone, hasLocation, hasAvailability, hasCar];
    const basicComplete = basicFields.every(field => field);
    const basicScore = basicComplete ? 40 : (basicFields.filter(Boolean).length / basicFields.length) * 40;

    // Información del CV (60% del total)
    const hasProfamily = !!(academicBackground?.profamily);
    const hasAcademicInfo = !!(academicBackground?.scenter && academicBackground?.status);
    const hasSkills = skills.length > 0;
    const hasPhoto = !!(studentProfile?.photo && studentProfile.photo.trim().length > 0);
    const hasSummary = !!(summary && summary.trim().length > 10);

    const cvFields = [hasProfamily, hasAcademicInfo, hasSkills, hasSummary]; // Removido hasPhoto como requerido
    const cvComplete = cvFields.every(field => field);
    const cvScore = cvComplete ? 60 : (cvFields.filter(Boolean).length / cvFields.length) * 60;

    const completionPercentage = basicScore + cvScore;

    const missingFields: string[] = [];
    if (!hasName || !hasEmail || !hasPhone) missingFields.push('Información básica incompleta');
    if (!hasLocation) missingFields.push('Ubicación');
    if (!hasAvailability) missingFields.push('Disponibilidad');
    if (!hasCar) missingFields.push('Información sobre vehículo');
    if (!hasProfamily) missingFields.push('Orientación profesional');
    if (!hasAcademicInfo) missingFields.push('Información académica');
    if (!hasSkills) missingFields.push('Habilidades');
    if (!hasPhoto) missingFields.push('Foto de perfil');
    if (!hasSummary) missingFields.push('Resumen profesional');

    return {
      completionPercentage,
      hasPersonalInfo: hasName && hasEmail && hasPhone,
      hasEducation: hasAcademicInfo,
      hasSkills,
      hasExperience: false, // Ya no hay experiencia laboral
      hasContactInfo: hasPhone,
      hasSummary,
      hasAddress: hasLocation,
      hasGrade: !!(studentProfile?.grade),
      hasCourse: !!(studentProfile?.course),
      hasCar,
      hasProfamily,
      hasStudentSkills: hasSkills,
      hasScenter: !!(academicBackground?.scenter),
      hasPhoto,
      totalSections: 2,
      completedSections: [basicComplete, cvComplete].filter(Boolean).length,
      missingFields,
      isEmpty: !hasName && !cvComplete,
      hasName,
      hasEmail,
      hasPhone,
      hasLocation,
      hasAvailability
    };
  };

  const stats = calculateCVStats();

  // Funciones para manejar skills en el CV
  const addSkillToCV = async (skillId: number, proficiencyLevel: 'bajo' | 'medio' | 'alto' = 'medio', yearsOfExperience: number = 0, isHighlighted: boolean = false, notes?: string) => {
    try {
      const response = await apiClient.post('/api/cv/skills', {
        skillId,
        proficiencyLevel,
        yearsOfExperience,
        isHighlighted,
        notes
      });

      // Actualizar el estado local agregando la nueva skill
      setCVData(prev => ({
        ...prev,
        skills: [...prev.skills, response.data.cvSkill]
      }));

      return response.data.cvSkill;
    } catch (error) {
      console.error('Error adding skill to CV:', error);
      throw error;
    }
  };

  const updateCVSkill = async (cvSkillId: number, updates: Partial<{
    proficiencyLevel: 'bajo' | 'medio' | 'alto';
    yearsOfExperience: number;
    isHighlighted: boolean;
    notes: string;
  }>) => {
    try {
      const response = await apiClient.put(`/api/cv/skills/${cvSkillId}`, updates);

      // Actualizar el estado local
      setCVData(prev => ({
        ...prev,
        skills: prev.skills.map(skill =>
          skill.id === cvSkillId ? response.data.cvSkill : skill
        )
      }));

      return response.data.cvSkill;
    } catch (error) {
      console.error('Error updating CV skill:', error);
      throw error;
    }
  };

  const removeSkillFromCV = async (cvSkillId: number) => {
    try {
      await apiClient.delete(`/api/cv/skills/${cvSkillId}`);

      // Actualizar el estado local removiendo la skill
      setCVData(prev => ({
        ...prev,
        skills: prev.skills.filter(skill => skill.id !== cvSkillId)
      }));

      return true;
    } catch (error) {
      console.error('Error removing skill from CV:', error);
      throw error;
    }
  };

  // Refrescar datos del CV
  const refresh = () => {
    loadCVData();
  };

  return {
    cvData,
    loading: loading || profileLoading || studentLoading || applicationsLoading,
    saveCV,
    updateCV,
    addSkillToCV,
    updateCVSkill,
    removeSkillFromCV,
    refresh,
    ...stats,
    isComplete: stats.completionPercentage >= 80,
    isBasicComplete: stats.completionPercentage >= 50,
    hasMinimumInfo: stats.hasPersonalInfo && stats.hasContactInfo,
    hasLocationFromAPI: hasLocation,
    hasPhoneFromAPI: hasPhone,
    studentProfile
  };
}