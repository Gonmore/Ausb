import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUserProfile } from './useUserProfile'; // 🆕 IMPORTAR

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    summary: string;
    // 🆕 CAMPOS DE UBICACIÓN DETALLADOS
    countryCode: string;
    countryName: string;
    cityId: string;
    cityName: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string;
    category: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  languages: Array<{
    language: string;
    level: string;
  }>;
}

export function useCV() {
  const { user } = useAuthStore();
  const { profile, hasLocation, hasPhone, loading: profileLoading } = useUserProfile(); // 🆕 USAR PERFIL DE LA API
  const [cvData, setCVData] = useState<CVData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      summary: '',
      countryCode: '',
      countryName: '',
      cityId: '',
      cityName: ''
    },
    education: [],
    skills: [],
    experience: [],
    languages: []
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos del CV cuando el perfil esté disponible
  useEffect(() => {
    if (profile) {
      loadCVData();
    } else if (!profileLoading) {
      // Si no hay perfil y no está cargando, usar datos básicos del store
      loadCVDataFromStore();
    }
  }, [profile, profileLoading]);

  const loadCVData = () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      console.log('🔄 Loading CV with profile data:', profile);
      
      // Cargar CV del localStorage
      const savedCV = localStorage.getItem('cv-data');
      let cvFromStorage: CVData | null = null;
      
      if (savedCV) {
        cvFromStorage = JSON.parse(savedCV);
      }

      // 🔥 INICIALIZAR CON DATOS REALES DE LA API
      const initialCV: CVData = {
        personalInfo: {
          name: profile.name || user?.username || '',
          email: profile.email || '',
          phone: profile.phone || '', // ✅ Teléfono persistente de la BD
          address: profile.location.fullAddress || '', // ✅ Dirección construida de GeoNames
          dateOfBirth: '',
          summary: '',
          // 🆕 DATOS DE UBICACIÓN DE GEONAMES
          countryCode: profile.location.countryCode || '',
          countryName: profile.location.countryName || '',
          cityId: profile.location.cityId || '',
          cityName: profile.location.cityName || ''
        },
        education: [],
        skills: [],
        experience: [],
        languages: []
      };

      // Mezclar datos guardados con datos persistentes de la API
      if (cvFromStorage) {
        setCVData({
          ...cvFromStorage,
          personalInfo: {
            ...cvFromStorage.personalInfo,
            // ✅ SIEMPRE MANTENER DATOS FRESCOS DE LA API
            name: cvFromStorage.personalInfo.name || profile.name || user?.username || '',
            email: cvFromStorage.personalInfo.email || profile.email || '',
            phone: cvFromStorage.personalInfo.phone || profile.phone || '', // ✅ Persistente
            address: profile.location.fullAddress || cvFromStorage.personalInfo.address || '',
            // ✅ DATOS DE UBICACIÓN SIEMPRE FRESCOS
            countryCode: profile.location.countryCode || '',
            countryName: profile.location.countryName || '',
            cityId: profile.location.cityId || '',
            cityName: profile.location.cityName || ''
          }
        });
      } else {
        setCVData(initialCV);
      }

      console.log('✅ CV loaded with API data');
    } catch (error) {
      console.error('Error loading CV data:', error);
      // En caso de error, usar datos básicos del perfil
      setCVData({
        personalInfo: {
          name: profile.name || user?.username || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.location.fullAddress || '',
          dateOfBirth: '',
          summary: '',
          countryCode: profile.location.countryCode || '',
          countryName: profile.location.countryName || '',
          cityId: profile.location.cityId || '',
          cityName: profile.location.cityName || ''
        },
        education: [],
        skills: [],
        experience: [],
        languages: []
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCVDataFromStore = () => {
    // Fallback usando solo datos del store auth si no hay perfil
    setLoading(true);
    try {
      const savedCV = localStorage.getItem('cv-data');
      let cvFromStorage: CVData | null = null;
      
      if (savedCV) {
        cvFromStorage = JSON.parse(savedCV);
      }

      const initialCV: CVData = {
        personalInfo: {
          name: user?.username || user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '', // Del store auth
          address: '', // Se construirá cuando llegue el perfil
          dateOfBirth: '',
          summary: '',
          countryCode: '',
          countryName: '',
          cityId: '',
          cityName: ''
        },
        education: [],
        skills: [],
        experience: [],
        languages: []
      };

      if (cvFromStorage) {
        setCVData({
          ...cvFromStorage,
          personalInfo: {
            ...cvFromStorage.personalInfo,
            name: cvFromStorage.personalInfo.name || user?.username || user?.name || '',
            email: cvFromStorage.personalInfo.email || user?.email || '',
            phone: cvFromStorage.personalInfo.phone || user?.phone || ''
          }
        });
      } else {
        setCVData(initialCV);
      }

      console.log('⚠️ CV loaded with store data (no profile yet)');
    } catch (error) {
      console.error('Error loading CV from store:', error);
      setCVData({
        personalInfo: {
          name: user?.username || user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          address: '',
          dateOfBirth: '',
          summary: '',
          countryCode: '',
          countryName: '',
          cityId: '',
          cityName: ''
        },
        education: [],
        skills: [],
        experience: [],
        languages: []
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CALCULAR ESTADÍSTICAS CONSIDERANDO DATOS PERSISTENTES
  const calculateCVStats = () => {
    const { personalInfo, education, skills, experience } = cvData;

    // Verificar información personal
    const hasPersonalInfo = !!(personalInfo.name && personalInfo.email);
    const hasContactInfo = !!(personalInfo.phone); // ✅ De la BD
    const hasSummary = !!(personalInfo.summary && personalInfo.summary.length > 10);
    const hasAddress = !!(personalInfo.address); // ✅ De GeoNames
    const hasDateOfBirth = !!(personalInfo.dateOfBirth);

    // Verificar secciones
    const hasEducation = education.length > 0 && education.some(edu => 
      edu.institution && edu.degree
    );
    
    const hasSkills = skills.length > 0;
    
    const hasExperience = experience.length > 0 && experience.some(exp => 
      exp.company && exp.position
    );

    // Calcular campos faltantes
    const missingFields: string[] = [];
    
    if (!personalInfo.name) missingFields.push('Nombre');
    if (!personalInfo.email) missingFields.push('Email');
    if (!personalInfo.phone) missingFields.push('Teléfono');
    if (!personalInfo.summary) missingFields.push('Resumen personal');
    if (!personalInfo.address) missingFields.push('Dirección');
    if (!personalInfo.dateOfBirth) missingFields.push('Fecha de nacimiento');
    if (!hasEducation) missingFields.push('Educación');
    if (!hasSkills) missingFields.push('Habilidades');
    if (!hasExperience) missingFields.push('Experiencia laboral');

    // ✅ CALCULAR PORCENTAJE CONSIDERANDO DATOS PERSISTENTES
    const checks = [
      personalInfo.name ? 15 : 0,        // Nombre (15%)
      personalInfo.email ? 10 : 0,       // Email (10%)
      personalInfo.phone ? 10 : 0,       // Teléfono (10%) ✅ De la BD
      personalInfo.summary ? 15 : 0,     // Resumen (15%)
      personalInfo.address ? 5 : 0,      // Dirección (5%) ✅ De GeoNames
      personalInfo.dateOfBirth ? 5 : 0,  // Fecha nacimiento (5%)
      hasEducation ? 20 : 0,             // Educación (20%)
      hasSkills ? 15 : 0,                // Skills (15%)
      hasExperience ? 15 : 0             // Experiencia (15%)
    ];
    
    const completionPercentage = checks.reduce((sum, value) => sum + value, 0);
    
    // Contar secciones completadas
    const sectionChecks = [
      hasPersonalInfo,
      hasContactInfo,
      hasSummary,
      hasEducation,
      hasSkills,
      hasExperience
    ];
    
    const completedSections = sectionChecks.filter(Boolean).length;
    const totalSections = sectionChecks.length;

    const isEmpty = !personalInfo.name && 
                   !personalInfo.email && 
                   education.length === 0 && 
                   skills.length === 0 && 
                   experience.length === 0;

    return {
      completionPercentage,
      hasPersonalInfo,
      hasEducation,
      hasSkills,
      hasExperience,
      hasContactInfo,
      hasSummary,
      hasAddress,
      totalSections,
      completedSections,
      missingFields,
      isEmpty
    };
  };

  const stats = calculateCVStats();

  // Refrescar datos del CV
  const refresh = () => {
    if (profile) {
      loadCVData();
    } else {
      loadCVDataFromStore();
    }
  };

  return {
    cvData,
    loading: loading || profileLoading, // Considerar ambas cargas
    refresh,
    ...stats,
    // Métodos de utilidad
    isComplete: stats.completionPercentage >= 80,
    isBasicComplete: stats.completionPercentage >= 50,
    hasMinimumInfo: stats.hasPersonalInfo && stats.hasContactInfo,
    // Datos de ubicación específicos
    hasLocationFromAPI: hasLocation,
    hasPhoneFromAPI: hasPhone
  };
}