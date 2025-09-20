// UserCompany Service
export const userCompanyService = {
  create: (data: { userId: number; companyId: number; role?: string }) =>
    apiClient.post('/api/user-company', data),
  getByUserId: (userId: number) =>
    apiClient.get(`/api/user-company/user/${userId}`),
};
import apiClient from '@/lib/api';
import {
  Offer,
  CreateOfferData,
  Profamily,
  CreateProfamilyData,
  Tutor,
  CreateTutorData,
  Student,
  CreateStudentData,
  Company,
  CreateCompanyData,
  Scenter,
  CreateScenterData,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '@/types';

// Auth Service
export const authService = {
  login: (credentials: LoginCredentials) => 
    apiClient.post<AuthResponse>('/login', credentials),
  register: (data: RegisterData) => 
    apiClient.post<AuthResponse>('/register', data),
  logout: () => apiClient.post('/logout'),
  // validateToken: () => apiClient.get('/dashboard'), // Removed - backend returns HTML
};

// Offers Service
export const offerService = {
  getAllOffers: async () => {
    try {
      const response = await apiClient.get<Offer[]>('/api/offers');
      return response.data;
    } catch (error: any) {
      console.log('🔍 Error fetching offers from backend, returning mock data');
      
      // Retornar datos mock para desarrollo
      const mockOffers: Offer[] = [
        {
          id: 1,
          name: 'Desarrollador Frontend React',
          location: 'Berlín, Alemania',
          mode: 'Presencial',
          type: 'full-time',
          period: '6 meses',
          schedule: 'Lunes a Viernes 9:00-17:00',
          min_hr: 30,
          car: false,
          sector: 'Tech Solutions GmbH',
          tag: 'Tecnología',
          description: 'Desarrollo de aplicaciones web modernas con React, TypeScript y Next.js. Trabajarás en un equipo dinámico creando interfaces de usuario innovadoras.',
          jobs: 'Desarrollo Frontend',
          requisites: 'Experiencia con React y TypeScript, Conocimientos de HTML, CSS y JavaScript',
          profamilyId: 1,
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z',
          salary: '45.000€ - 55.000€',
          postedDate: '2024-01-15',
          deadline: '2024-02-15',
          contactEmail: 'jobs@techsolutions.de',
          requirements: [
            'Experiencia con React y TypeScript',
            'Conocimientos de HTML, CSS y JavaScript',
            'Familiaridad con Git y herramientas de desarrollo',
            'Nivel intermedio de alemán'
          ],
          benefits: [
            'Horario flexible',
            'Trabajo remoto híbrido',
            'Seguro médico completo',
            'Presupuesto para formación'
          ]
        },
        {
          id: 2,
          name: 'Prácticas Marketing Digital',
          location: 'Múnich, Alemania',
          mode: 'Híbrido',
          type: 'internship',
          period: '3 meses',
          schedule: 'Lunes a Viernes 9:00-15:00',
          min_hr: 20,
          car: false,
          sector: 'Digital Marketing AG',
          tag: 'Marketing',
          description: 'Únete a nuestro equipo de marketing digital y aprende sobre estrategias SEO, SEM, redes sociales y análisis de datos.',
          jobs: 'Marketing Digital',
          requisites: 'Estudiante de Marketing, Conocimientos básicos de Google Analytics',
          profamilyId: 2,
          createdAt: '2024-01-10T00:00:00.000Z',
          updatedAt: '2024-01-10T00:00:00.000Z',
          salary: '800€/mes',
          postedDate: '2024-01-10',
          deadline: '2024-02-10',
          contactEmail: 'internships@digitalmarketing.de',
          requirements: [
            'Estudiante de Marketing o carrera afín',
            'Conocimientos básicos de Google Analytics',
            'Creatividad y capacidad analítica',
            'Nivel básico de alemán'
          ],
          benefits: [
            'Mentoring personalizado',
            'Certificaciones gratuitas',
            'Ambiente joven y dinámico',
            'Posibilidad de contratación'
          ]
        },
        {
          id: 3,
          name: 'Desarrollador Full Stack',
          location: 'Hamburgo, Alemania',
          mode: 'Presencial',
          type: 'full-time',
          period: '12 meses',
          schedule: 'Lunes a Viernes 8:30-17:30',
          min_hr: 40,
          car: true,
          sector: 'Innovation Labs',
          tag: 'Tecnología',
          description: 'Desarrollo de aplicaciones web completas usando tecnologías modernas. Backend con Node.js/Python y frontend con React/Vue.',
          jobs: 'Desarrollo Full Stack',
          requisites: 'Experiencia con tecnologías full-stack, Conocimientos de bases de datos',
          profamilyId: 1,
          createdAt: '2024-01-08T00:00:00.000Z',
          updatedAt: '2024-01-08T00:00:00.000Z',
          salary: '50.000€ - 65.000€',
          postedDate: '2024-01-08',
          deadline: '2024-02-08',
          contactEmail: 'careers@innovationlabs.de',
          requirements: [
            'Experiencia con tecnologías full-stack',
            'Conocimientos de bases de datos',
            'Metodologías ágiles',
            'Nivel avanzado de alemán'
          ],
          benefits: [
            'Proyectos innovadores',
            'Tecnología de vanguardia',
            'Plan de carrera claro',
            'Stock options'
          ]
        },
        {
          id: 4,
          name: 'Diseñador UX/UI',
          location: 'Colonia, Alemania',
          mode: 'Remoto',
          type: 'part-time',
          period: '6 meses',
          schedule: 'Lunes a Viernes 10:00-15:00',
          min_hr: 25,
          car: false,
          sector: 'StartUp Connect',
          tag: 'Diseño',
          description: 'Diseño de interfaces y experiencia de usuario para aplicaciones móviles y web. Trabajo con metodologías de Design Thinking.',
          jobs: 'Diseño UX/UI',
          requisites: 'Portfolio sólido en UX/UI, Dominio de Figma/Sketch',
          profamilyId: 3,
          createdAt: '2024-01-05T00:00:00.000Z',
          updatedAt: '2024-01-05T00:00:00.000Z',
          salary: '35.000€ - 42.000€',
          postedDate: '2024-01-05',
          deadline: '2024-02-05',
          contactEmail: 'design@startupconnect.de',
          requirements: [
            'Portfolio sólido en UX/UI',
            'Dominio de Figma/Sketch',
            'Conocimientos de prototipado',
            'Nivel intermedio de alemán'
          ],
          benefits: [
            'Flexibilidad horaria',
            'Ambiente startup',
            'Herramientas premium',
            'Formación continua'
          ]
        },
        {
          id: 5,
          name: 'Analista de Datos',
          location: 'Frankfurt, Alemania',
          mode: 'Presencial',
          type: 'full-time',
          period: '9 meses',
          schedule: 'Lunes a Viernes 9:00-18:00',
          min_hr: 35,
          car: true,
          sector: 'Data Analytics Pro',
          tag: 'Análisis',
          description: 'Análisis de grandes volúmenes de datos usando Python, SQL y herramientas de BI. Creación de dashboards y reportes.',
          jobs: 'Análisis de Datos',
          requisites: 'Experiencia con Python/R, Conocimientos de SQL',
          profamilyId: 4,
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z',
          salary: '48.000€ - 58.000€',
          postedDate: '2024-01-03',
          deadline: '2024-02-03',
          contactEmail: 'data@analyticspro.de',
          requirements: [
            'Experiencia con Python/R',
            'Conocimientos de SQL',
            'Herramientas de visualización',
            'Nivel intermedio de alemán'
          ],
          benefits: [
            'Proyectos variados',
            'Herramientas modernas',
            'Equipo experto',
            'Crecimiento profesional'
          ]
        }
      ];
      
      return mockOffers;
    }
  },
  getOfferById: (id: number) => apiClient.get<Offer>(`/api/offers/${id}`).then(res => res.data),
  createOffer: (data: CreateOfferData) => apiClient.post<Offer>('/api/offers', data).then(res => res.data),
  updateOffer: (id: number, data: Partial<CreateOfferData>) => 
    apiClient.put<Offer>(`/api/offers/${id}`, data).then(res => res.data),
  deleteOffer: (id: number) => apiClient.delete(`/api/offers/${id}`),
  getOffersByCompany: (companyId: number) => 
    apiClient.get<Offer[]>(`/api/offers/company/${companyId}`).then(res => res.data),
  getOffersByProfamily: (profamilyId: number) => 
    apiClient.get<Offer[]>(`/api/offers/profamily/${profamilyId}`).then(res => res.data),
};

// Professional Families Service
export const profamiliesService = {
  getAll: () => apiClient.get<Profamily[]>('/api/profamilies'),
  getById: (id: number) => apiClient.get<Profamily>(`/api/profamilies/${id}`),
  create: (data: CreateProfamilyData) => 
    apiClient.post<Profamily>('/api/profamilies', data),
  update: (id: number, data: Partial<CreateProfamilyData>) => 
    apiClient.put<Profamily>(`/api/profamilies/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/profamilies/${id}`),
  getStudents: (id: number) => 
    apiClient.get<Student[]>(`/api/profamilies/${id}/students`),
  getTutors: (id: number) => 
    apiClient.get<Tutor[]>(`/api/profamilies/${id}/tutors`),
};

// Tutors Service
export const tutorsService = {
  getAll: () => apiClient.get<Tutor[]>('/api/tutors'),
  getById: (id: string) => apiClient.get<Tutor>(`/api/tutors/${id}`),
  create: (data: CreateTutorData) => apiClient.post<Tutor>('/api/tutors', data),
  update: (id: string, data: Partial<CreateTutorData>) => 
    apiClient.put<Tutor>(`/api/tutors/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/tutors/${id}`),
  getByScenter: (scenterId: number) => 
    apiClient.get<Tutor[]>(`/api/tutors/scenter/${scenterId}`),
  getByProfamily: (profamilyId: number) => 
    apiClient.get<Tutor[]>(`/api/tutors/profamily/${profamilyId}`),
};

// Students Service
export const studentsService = {
  getAll: () => apiClient.get<Student[]>('/api/student'),
  getById: (id: number) => apiClient.get<Student>(`/api/student/${id}`),
  create: (data: CreateStudentData) => 
    apiClient.post<Student>('/api/student', data),
  update: (id: number, data: Partial<CreateStudentData>) => 
    apiClient.put<Student>(`/api/student/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/student/${id}`),
};

// Companies Service
export const companyService = {
  getAll: async () => {
    try {
      const response = await apiClient.get<Company[]>('/api/company');
      return response;
    } catch (error: any) {
      // Si es error de autenticación, devolver array vacío para mostrar en la UI
      if (error.response?.status === 401) {
        return { data: [] };
      }
      throw error;
    }
  },
  getById: (id: number) => apiClient.get<Company>(`/api/company/${id}`),
  create: (data: CreateCompanyData) => 
    apiClient.post<Company>('/api/company', data),
  update: (id: number, data: Partial<CreateCompanyData>) => 
    apiClient.put<Company>(`/api/company/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/company/${id}`),
};

// Educational Centers Service
export const scenterService = {
  getAll: () => apiClient.get<Scenter[]>('/api/scenter'),
  getUserScenters: () => apiClient.put<Scenter[]>('/api/scenter'), // GET user's centers
  getById: (id: number) => apiClient.get<Scenter>(`/api/scenter/${id}`),
  create: (data: CreateScenterData) => 
    apiClient.post<Scenter>('/api/scenter', data),
  update: (id: number, data: Partial<CreateScenterData>) => 
    apiClient.put<Scenter>(`/api/scenter/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/scenter/${id}`),
  activateDeactivate: (id: number, active: boolean) => 
    apiClient.patch(`/api/scenter/${id}`, { active }),
};

// Applications Service
export const applicationService = {
  applyToOffer: async (offerId: number, message?: string) => {
    try {
      const response = await apiClient.post('/api/applications', {
        offerId,
        message: message || 'Estoy interesado en esta oportunidad',
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getUserApplications: () => 
    apiClient.get('/api/applications/user'),
  getOfferApplications: (offerId: number) => 
    apiClient.get(`/api/applications/offer/${offerId}`),
  updateApplicationStatus: (applicationId: number, status: string) => 
    apiClient.put(`/api/applications/${applicationId}/status`, { status }),
};
