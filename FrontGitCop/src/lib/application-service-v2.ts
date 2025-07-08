import { config, checkAPIAvailability, debugLog } from './config';

export interface Application {
  id: string;
  offerId: string;
  userId: string;
  companyName: string;
  position: string;
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  description: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  offer: {
    id: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    benefits: string[];
    salary: string;
    location: string;
    type: string;
    postedDate: string;
    deadline: string;
    contactEmail: string;
  };
}

export interface ApplicationBackend {
  getUserApplications(userId: string): Promise<Application[]>;
  applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }>;
  removeApplication(applicationId: string, userId: string): Promise<boolean>;
  updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean>;
  isAvailable(): Promise<boolean>;
}

// Backend con localStorage (para desarrollo/demo)
class LocalStorageBackend implements ApplicationBackend {
  private storageKey = config.localStorage.applicationsKey;

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      debugLog('LocalStorage: Getting applications for user', userId);
      const applications = localStorage.getItem(this.storageKey);
      if (applications) {
        const allApplications: Application[] = JSON.parse(applications);
        return allApplications.filter(app => app.userId === userId);
      }
      return [];
    } catch (error) {
      console.error('LocalStorage getUserApplications error:', error);
      return [];
    }
  }

  async applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    try {
      debugLog('LocalStorage: Applying to offer', { offerId: offer.id, userId: user.id });
      
      const applications = this.getAllApplications();
      
      // Verificar si ya aplicó
      const existingApplication = applications.find(
        app => app.offerId === offer.id && app.userId === user.id
      );
      
      if (existingApplication) {
        return { success: false, message: 'Ya has aplicado a esta oferta' };
      }

      const newApplication: Application = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        offerId: offer.id,
        userId: user.id,
        companyName: offer.company,
        position: offer.title,
        location: offer.location,
        appliedDate: new Date().toISOString(),
        status: 'pending',
        description: offer.description,
        salary: offer.salary,
        type: offer.type,
        offer: offer,
      };

      applications.push(newApplication);
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
      
      debugLog('LocalStorage: Application saved successfully', newApplication.id);
      return { success: true, message: 'Aplicación enviada exitosamente' };
    } catch (error) {
      console.error('LocalStorage apply error:', error);
      return { success: false, message: 'Error al enviar la aplicación' };
    }
  }

  async removeApplication(applicationId: string, userId: string): Promise<boolean> {
    try {
      debugLog('LocalStorage: Removing application', { applicationId, userId });
      
      const allApplications = this.getAllApplications();
      const filteredApplications = allApplications.filter(
        app => !(app.id === applicationId && app.userId === userId)
      );
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredApplications));
      debugLog('LocalStorage: Application removed successfully');
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  }

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      debugLog('LocalStorage: Updating application status', { applicationId, status });
      
      const allApplications = this.getAllApplications();
      const applicationIndex = allApplications.findIndex(app => app.id === applicationId);
      
      if (applicationIndex !== -1) {
        allApplications[applicationIndex].status = status;
        localStorage.setItem(this.storageKey, JSON.stringify(allApplications));
        debugLog('LocalStorage: Status updated successfully');
        return true;
      }
      
      debugLog('LocalStorage: Application not found for status update');
      return false;
    } catch (error) {
      console.error('LocalStorage update error:', error);
      return false;
    }
  }

  private getAllApplications(): Application[] {
    try {
      const applications = localStorage.getItem(this.storageKey);
      return applications ? JSON.parse(applications) : [];
    } catch (error) {
      console.error('LocalStorage get all error:', error);
      return [];
    }
  }

  // Método público para migración
  getStoredApplications(): Application[] {
    return this.getAllApplications();
  }
}

// Backend con API REST (para producción)
class APIBackend implements ApplicationBackend {
  private baseURL = config.backend.apiURL;

  async isAvailable(): Promise<boolean> {
    return await checkAPIAvailability();
  }

  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      debugLog('API: Getting applications for user', userId);
      
      const response = await fetch(`${this.baseURL}/api/applications/user`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      debugLog('API: Applications retrieved successfully', data.length);
      return data;
    } catch (error) {
      console.error('API getUserApplications error:', error);
      throw error;
    }
  }

  async applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    try {
      debugLog('API: Applying to offer', { offerId: offer.id, userId: user.id });
      
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No se encontró token de autenticación. Por favor, inicia sesión nuevamente.' };
      }
      
      const response = await fetch(`${this.baseURL}/api/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: offer.id,
          message: `Aplicación a ${offer.title || offer.name}`,
        }),
      });

      if (!response.ok) {
        // Si la respuesta no es OK, verificar si es JSON antes de parsear
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return { success: false, message: data.message || `Error ${response.status}: ${response.statusText}` };
        } else {
          // Si no es JSON, usar el texto de la respuesta
          const errorText = await response.text();
          return { success: false, message: errorText || `Error ${response.status}: ${response.statusText}` };
        }
      }

      const data = await response.json();
      debugLog('API: Application submitted successfully');
      return { success: true, message: data.message || 'Aplicación enviada exitosamente' };
    } catch (error) {
      console.error('API apply error:', error);
      return { success: false, message: 'Error de conexión al enviar la aplicación' };
    }
  }

  async removeApplication(applicationId: string, userId: string): Promise<boolean> {
    try {
      debugLog('API: Removing application', { applicationId, userId });
      
      const response = await fetch(`${this.baseURL}/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const success = response.ok;
      debugLog('API: Application removal result', success);
      return success;
    } catch (error) {
      console.error('API removeApplication error:', error);
      return false;
    }
  }

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      debugLog('API: Updating application status', { applicationId, status });
      
      const response = await fetch(`${this.baseURL}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const success = response.ok;
      debugLog('API: Status update result', success);
      return success;
    } catch (error) {
      console.error('API updateApplicationStatus error:', error);
      return false;
    }
  }

  private getToken(): string {
    try {
      // Usar la misma lógica que tokenUtils para consistencia
      const token = localStorage.getItem('authToken');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }
}

// Service principal con fallback automático
class ApplicationService {
  private primaryBackend: ApplicationBackend;
  private fallbackBackend: ApplicationBackend;
  private currentBackend: ApplicationBackend;

  constructor() {
    this.primaryBackend = new APIBackend();
    this.fallbackBackend = new LocalStorageBackend();
    this.currentBackend = this.selectInitialBackend();
  }

  private selectInitialBackend(): ApplicationBackend {
    if (config.backend.useAPI) {
      debugLog('ApplicationService: Attempting to use API backend');
      return this.primaryBackend;
    } else {
      debugLog('ApplicationService: Using localStorage backend');
      return this.fallbackBackend;
    }
  }

  // Método para cambiar backend con validación
  async switchBackend(type: 'api' | 'localStorage'): Promise<boolean> {
    try {
      const targetBackend = type === 'api' ? this.primaryBackend : this.fallbackBackend;
      
      if (await targetBackend.isAvailable()) {
        this.currentBackend = targetBackend;
        debugLog('ApplicationService: Backend switched successfully', type);
        return true;
      } else {
        debugLog('ApplicationService: Target backend not available', type);
        return false;
      }
    } catch (error) {
      console.error('Error switching backend:', error);
      return false;
    }
  }

  // Método para intentar con fallback automático
  private async executeWithFallback<T>(
    operation: (backend: ApplicationBackend) => Promise<T>
  ): Promise<T> {
    try {
      return await operation(this.currentBackend);
    } catch (error) {
      if (config.backend.autoFallback && this.currentBackend === this.primaryBackend) {
        debugLog('ApplicationService: Primary backend failed, trying fallback');
        
        try {
          if (await this.fallbackBackend.isAvailable()) {
            this.currentBackend = this.fallbackBackend;
            return await operation(this.fallbackBackend);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      throw error;
    }
  }

  // Métodos públicos con fallback automático
  async getUserApplications(userId: string): Promise<Application[]> {
    return this.executeWithFallback(backend => backend.getUserApplications(userId));
  }

  async applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    return this.executeWithFallback(backend => backend.applyToOffer(offer, user));
  }

  async removeApplication(applicationId: string, userId: string): Promise<boolean> {
    return this.executeWithFallback(backend => backend.removeApplication(applicationId, userId));
  }

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    return this.executeWithFallback(backend => backend.updateApplicationStatus(applicationId, status));
  }

  // Método para migrar datos de localStorage a API
  async migrateToAPI(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      debugLog('ApplicationService: Starting migration to API');
      
      // Verificar que la API esté disponible
      if (!await this.primaryBackend.isAvailable()) {
        return { success: false, message: 'API no disponible para migración' };
      }

      // Obtener datos de localStorage
      const localBackend = this.fallbackBackend as LocalStorageBackend;
      const applications = localBackend.getStoredApplications();
      
      if (applications.length === 0) {
        return { success: true, message: 'No hay aplicaciones para migrar' };
      }

      // Migrar cada aplicación
      let migrated = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const app of applications) {
        try {
          const result = await this.primaryBackend.applyToOffer(app.offer, { id: app.userId });
          if (result.success) {
            migrated++;
            debugLog('ApplicationService: Migrated application', app.id);
          } else {
            failed++;
            errors.push(`${app.id}: ${result.message}`);
          }
        } catch (error) {
          failed++;
          errors.push(`${app.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      
      const message = `Migración completada: ${migrated} exitosas, ${failed} fallidas`;
      debugLog('ApplicationService: Migration completed', { migrated, failed });
      
      return { 
        success: failed === 0, 
        message,
        details: { migrated, failed, errors }
      };
    } catch (error) {
      console.error('Migration error:', error);
      return { success: false, message: 'Error crítico en la migración' };
    }
  }

  // Método para obtener información del backend actual
  getBackendInfo(): { type: string; available: boolean } {
    const isAPI = this.currentBackend === this.primaryBackend;
    return {
      type: isAPI ? 'API' : 'localStorage',
      available: true // Se puede mejorar con verificación asíncrona
    };
  }
}

export const applicationService = new ApplicationService();
