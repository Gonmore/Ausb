// User types
export type UserRole = 'student' | 'company' | 'scenter' | 'tutor' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  availableRoles?: UserRole[]; // Roles disponibles para el usuario
  activeRole?: UserRole; // Rol activo actual
  name: string;
  surname?: string;
  phone?: string;
  countryCode?: string; // Código de país de la empresa
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // Relaciones con otros modelos según el rol
  studentId?: number; // ID del estudiante si role = 'student'
  companyId?: number; // ID de la empresa si role = 'company'
  scenterId?: number; // ID del centro educativo si role = 'scenter'
  tutorId?: number; // ID del tutor si role = 'tutor'
}

// Student types
export interface Student {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  userId: number;
  profamilyId: number;
  createdAt: string;
  updatedAt: string;
  User?: User;
  Profamily?: Profamily;
  Cv?: CV;
}

// Company types
export interface Company {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  sector: string;
  createdAt: string;
  updatedAt: string;
}

// Educational Center types
export interface Scenter {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Professional Family types
export interface Profamily {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  Students?: Student[];
  Tutors?: Tutor[];
  Offers?: Offer[];
}

// Tutor types
export interface Tutor {
  id: string;
  name: string;
  email: string;
  grade: string;
  degree: string;
  tutorId: number; // Foreign key to Scenter
  profamilyId: number; // Foreign key to Profamily
  createdAt: string;
  updatedAt: string;
  Scenter?: Scenter;
  Profamily?: Profamily;
}

// Offer types
export interface Offer {
  id: number;
  name: string;
  location: string;
  mode: string;
  type: string;
  period: string;
  schedule: string;
  min_hr: number;
  car: boolean;
  sector?: string;
  tag: string;
  description: string;
  jobs: string;
  requisites: string;
  profamilyId: number | null; // Legacy field for backward compatibility
  profamilyIds?: number[]; // New field for multiple profamilies
  createdAt: string;
  updatedAt: string;
  profamily?: Profamily; // Legacy field for backward compatibility
  profamilys?: Profamily[]; // New field for multiple profamilies
  companies?: Company;
  Skills?: Array<{
    id: number;
    name: string;
  }>;
  skills?: Array<{
    id: number;
    name: string;
  }>;
  // Campos adicionales para aplicaciones
  requirements?: string[];
  benefits?: string[];
  salary?: string;
  postedDate?: string;
  deadline?: string;
  contactEmail?: string;
  // Campo para aptitud/compatibilidad para estudiantes
  aptitude?: number;
  aptitudeDetails?: {
    level: string;
    score: number;
    matches: number;
    coverage: number;
    explanation: string;
    matchingSkills: string[];
  };
}

// CV types
export interface CV {
  id: number;
  studentId: number;
  createdAt: string;
  updatedAt: string;
  Student?: Student;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  mensaje?: string;
  message?: string;
}

export interface ApiError {
  mensaje?: string;
  message?: string;
}

// Form types for creating/updating entities
export interface CreateOfferData {
  name: string;
  location: string;
  mode: string;
  type: string;
  period: string;
  schedule: string;
    min_hr?: number;
    skills?: number[]; // IDs de skills seleccionados (3-6 requeridos)
  car?: boolean;
  tag: string;
  description: string;
  jobs: string;
  requisites: string;
  profamilyId: number; // Legacy field for backward compatibility
  profamilyIds?: number[]; // New field for multiple profamilies (1-4 requeridos)
  companyId?: number;
}

export interface CreateProfamilyData {
  name: string;
  description: string;
}

export interface CreateTutorData {
  id: string;
  name: string;
  email: string;
  grade: string;
  degree: string;
  scenterId: number;
  profamilyId: number;
}

export interface CreateStudentData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  profamilyId: number;
}

export interface CreateCompanyData {
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  sector: string;
}

export interface CreateScenterData {
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
}

// Application types
export interface Application {
  id: number;
  offerId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  updatedAt: string;
  offer?: Offer;
  user?: User;
  student?: Student;
}

export interface ApplyToOfferData {
  offerId: number;
  userId: number;
  coverLetter?: string;
  message?: string;
}
