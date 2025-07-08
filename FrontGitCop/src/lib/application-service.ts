// Servicio para gestionar aplicaciones
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
  // Datos completos de la oferta para poder mostrar detalles
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

class ApplicationService {
  private storageKey = 'user-applications';

  // Obtener todas las aplicaciones del usuario
  getUserApplications(userId: string): Application[] {
    console.log('🔍 getUserApplications called with userId:', userId);
    console.log('🔍 userId type:', typeof userId);
    
    try {
      const applications = localStorage.getItem(this.storageKey);
      console.log('💾 Raw applications from localStorage:', applications);
      
      if (applications) {
        const allApplications: Application[] = JSON.parse(applications);
        console.log('📋 All applications:', allApplications);
        console.log('📋 Filtering for userId:', userId);
        
        const userApps = allApplications.filter(app => {
          console.log(`🔍 Comparing app.userId: "${app.userId}" (${typeof app.userId}) with userId: "${userId}" (${typeof userId})`);
          return app.userId === userId;
        });
        
        console.log('✅ Filtered applications for user:', userApps);
        return userApps;
      }
      console.log('ℹ️ No applications found in localStorage');
      return [];
    } catch (error) {
      console.error('Error loading applications:', error);
      return [];
    }
  }

  // Aplicar a una oferta
  applyToOffer(offer: any, user: any): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      try {
        console.log('🎯 applyToOffer called with:');
        console.log('📄 Offer:', offer);
        console.log('👤 User:', user);
        console.log('🆔 User ID:', user.id, 'Type:', typeof user.id);
        
        // Verificar si ya aplicó a esta oferta
        const existingApplications = this.getUserApplications(user.id.toString());
        console.log('📋 Existing applications:', existingApplications);
        
        const alreadyApplied = existingApplications.some(app => app.offerId === offer.id);
        console.log('🔍 Already applied?', alreadyApplied);
        
        if (alreadyApplied) {
          console.log('❌ User already applied to this offer');
          resolve({ success: false, message: 'Ya has aplicado a esta oferta' });
          return;
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

        console.log('✨ Created new application:', newApplication);

        // Guardar en localStorage
        const allApplications = this.getAllApplications();
        console.log('📋 Current applications in storage:', allApplications);
        
        allApplications.push(newApplication);
        localStorage.setItem(this.storageKey, JSON.stringify(allApplications));

        console.log('✅ Application saved to localStorage');
        console.log('💾 Updated applications:', allApplications);
        
        resolve({ success: true, message: 'Aplicación enviada exitosamente' });
      } catch (error) {
        console.error('Error applying to offer:', error);
        resolve({ success: false, message: 'Error al enviar la aplicación' });
      }
    });
  }

  // Obtener todas las aplicaciones (para administración)
  private getAllApplications(): Application[] {
    try {
      const applications = localStorage.getItem(this.storageKey);
      return applications ? JSON.parse(applications) : [];
    } catch (error) {
      console.error('Error loading all applications:', error);
      return [];
    }
  }

  // Eliminar una aplicación
  removeApplication(applicationId: string, userId: string): boolean {
    try {
      const allApplications = this.getAllApplications();
      const filteredApplications = allApplications.filter(
        app => !(app.id === applicationId && app.userId === userId)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(filteredApplications));
      return true;
    } catch (error) {
      console.error('Error removing application:', error);
      return false;
    }
  }

  // Actualizar estado de aplicación
  updateApplicationStatus(applicationId: string, status: Application['status']): boolean {
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
      console.error('Error updating application status:', error);
      return false;
    }
  }

  // Obtener aplicación por ID
  getApplicationById(applicationId: string): Application | null {
    try {
      const allApplications = this.getAllApplications();
      return allApplications.find(app => app.id === applicationId) || null;
    } catch (error) {
      console.error('Error getting application by ID:', error);
      return null;
    }
  }
}

export const applicationService = new ApplicationService();
