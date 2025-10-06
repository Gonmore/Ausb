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
      // Para centros de estudios y usuarios generales, usar el endpoint público que lista todas las ofertas
      const response = await apiClient.get<Offer[]>('/api/offers');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching offers from backend:', error);
      // No retornar datos mock, lanzar el error para que se maneje en el componente
      throw error;
    }
  },
  getOffersWithAptitude: async () => {
    try {
      // Para estudiantes, usar el endpoint que calcula aptitud
      const response = await apiClient.get<Offer[]>('/api/offers/with-aptitude');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching offers with aptitude from backend:', error);
      throw error;
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
  getUserScenterInfo: () => apiClient.get('/api/scenter-user/info'), // GET current user's scenter info
  getScenterStudents: () => apiClient.get('/api/scenter-user/students'), // GET students from user's scenter
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
