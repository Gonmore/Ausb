// Adaptador para manejar aplicaciones con múltiples backends
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
}

// Backend con localStorage (para desarrollo/demo)
class LocalStorageBackend implements ApplicationBackend {
  private storageKey = 'user-applications';

  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const applications = localStorage.getItem(this.storageKey);
      if (applications) {
        const allApplications: Application[] = JSON.parse(applications);
        return allApplications.filter(app => app.userId === userId);
      }
      return [];
    } catch (error) {
      console.error('LocalStorage error:', error);
      return [];
    }
  }

  async applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar aplicación duplicada
      const existingApplications = await this.getUserApplications(user.id.toString());
      const alreadyApplied = existingApplications.some(app => app.offerId === offer.id.toString());
      
      if (alreadyApplied) {
        return { success: false, message: 'Ya has aplicado a esta oferta' };
      }

      // Crear nueva aplicación
      const newApplication: Application = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        offerId: offer.id.toString(),
        userId: user.id.toString(),
        companyName: offer.company,
        position: offer.title,
        location: offer.location,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        description: offer.description,
        salary: offer.salary,
        type: offer.type,
        offer: {
          id: offer.id.toString(),
          title: offer.title,
          company: offer.company,
          description: offer.description,
          requirements: offer.requirements || [],
          benefits: offer.benefits || [],
          salary: offer.salary,
          location: offer.location,
          type: offer.type,
          postedDate: offer.postedDate,
          deadline: offer.deadline,
          contactEmail: offer.contactEmail
        }
      };

      // Guardar en localStorage
      const allApplications = this.getAllApplications();
      allApplications.push(newApplication);
      localStorage.setItem(this.storageKey, JSON.stringify(allApplications));

      return { success: true, message: 'Aplicación enviada exitosamente' };
    } catch (error) {
      console.error('LocalStorage apply error:', error);
      return { success: false, message: 'Error al enviar la aplicación' };
    }
  }

  async removeApplication(applicationId: string, userId: string): Promise<boolean> {
    try {
      const allApplications = this.getAllApplications();
      const filteredApplications = allApplications.filter(
        app => !(app.id === applicationId && app.userId === userId)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(filteredApplications));
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  }

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      const allApplications = this.getAllApplications();
      const applicationIndex = allApplications.findIndex(app => app.id === applicationId);
      
      if (applicationIndex !== -1) {
        allApplications[applicationIndex].status = status;
        localStorage.setItem(this.storageKey, JSON.stringify(allApplications));
        return true;
      }
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
}

// Backend con API REST (para producción)
class APIBackend implements ApplicationBackend {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/applications/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API getUserApplications error:', error);
      throw error;
    }
  }

  async applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: offer.id,
          userId: user.id,
          // Otros datos relevantes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al aplicar' };
      }

      const result = await response.json();
      return { success: true, message: result.message || 'Aplicación enviada exitosamente' };
    } catch (error) {
      console.error('API applyToOffer error:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async removeApplication(applicationId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      return response.ok;
    } catch (error) {
      console.error('API removeApplication error:', error);
      return false;
    }
  }

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      return response.ok;
    } catch (error) {
      console.error('API updateApplicationStatus error:', error);
      return false;
    }
  }

  private getToken(): string {
    // Obtener token del store o localStorage
    const authStore = JSON.parse(localStorage.getItem('auth-store') || '{}');
    return authStore.state?.token || '';
  }
}

// Service principal que maneja la lógica de backend
class ApplicationService {
  private backend: ApplicationBackend;

  constructor() {
    // Determinar qué backend usar basado en configuración o disponibilidad
    this.backend = this.selectBackend();
  }

  private selectBackend(): ApplicationBackend {
    const useAPI = process.env.NEXT_PUBLIC_USE_API === 'true';
    const apiURL = process.env.NEXT_PUBLIC_API_URL;

    if (useAPI && apiURL) {
      console.log('🌐 Using API Backend for applications');
      return new APIBackend();
    } else {
      console.log('💾 Using LocalStorage Backend for applications');
      return new LocalStorageBackend();
    }
  }

  // Métodos públicos que delegan al backend seleccionado
  async getUserApplications(userId: string): Promise<Application[]> {
    return this.backend.getUserApplications(userId);
  }

  async applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    return this.backend.applyToOffer(offer, user);
  }

  async removeApplication(applicationId: string, userId: string): Promise<boolean> {
    return this.backend.removeApplication(applicationId, userId);
  }

  async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    return this.backend.updateApplicationStatus(applicationId, status);
  }

  // Método para cambiar backend dinámicamente
  switchBackend(type: 'localStorage' | 'api'): void {
    if (type === 'api') {
      this.backend = new APIBackend();
    } else {
      this.backend = new LocalStorageBackend();
    }
  }

  // Método para migrar datos de localStorage a API
  async migrateToAPI(): Promise<{ success: boolean; message: string }> {
    try {
      const localBackend = new LocalStorageBackend();
      const apiBackend = new APIBackend();
      
      // Obtener todas las aplicaciones de localStorage
      const applications = JSON.parse(localStorage.getItem('user-applications') || '[]');
      
      if (applications.length === 0) {
        return { success: true, message: 'No hay aplicaciones para migrar' };
      }

      // Migrar cada aplicación
      let migrated = 0;
      for (const app of applications) {
        try {
          // Simular migración a API (ajustar según tu implementación real)
          const result = await apiBackend.applyToOffer(app.offer, { id: app.userId });
          if (result.success) {
            migrated++;
          }
        } catch (error) {
          console.error('Error migrando aplicación:', app.id, error);
        }
      }
      
      return { success: true, message: `${migrated}/${applications.length} aplicaciones migradas` };
    } catch (error) {
      console.error('Migration error:', error);
      return { success: false, message: 'Error en la migración' };
    }
  }
}

export const applicationService = new ApplicationService();
