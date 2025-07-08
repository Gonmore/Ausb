'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { applicationService, Application } from '@/lib/application-service-v2';
import BackendManager from '@/components/backend-manager';
// import { ConditionalHeader } from '@/components/conditional-header';

// La interface ya está definida en el servicio
// interface Aplicacion {...

export default function AplicacionesPage() {
  const [aplicaciones, setAplicaciones] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBackendManager, setShowBackendManager] = useState(false);
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchAplicaciones();
  }, [user, token, router]);

  const fetchAplicaciones = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('Usuario no válido');
      }

      console.log('🔍 Fetching applications for user:', user);
      console.log('🔍 User ID:', user.id);
      console.log('🔍 User ID type:', typeof user.id);

      // Usar el servicio real de aplicaciones
      const userApplications = await applicationService.getUserApplications(user.id.toString());
      console.log('📋 Applications loaded:', userApplications);
      console.log('📋 Applications count:', userApplications.length);
      
      // También vamos a verificar qué hay en localStorage
      const allApplicationsInStorage = localStorage.getItem('user-applications');
      console.log('💾 Raw localStorage data:', allApplicationsInStorage);
      
      if (allApplicationsInStorage) {
        const parsedApplications = JSON.parse(allApplicationsInStorage);
        console.log('💾 Parsed applications:', parsedApplications);
        console.log('💾 Total applications in storage:', parsedApplications.length);
      }
      
      setAplicaciones(userApplications);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplication = async (applicationId: string) => {
    if (!user?.id) return;
    
    const success = await applicationService.removeApplication(applicationId, user.id.toString());
    if (success) {
      setAplicaciones(prev => prev.filter(app => app.id !== applicationId));
    } else {
      alert('Error al eliminar la aplicación');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando aplicaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <ConditionalHeader /> */}
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Aplicaciones</h1>
        <p className="text-gray-600">
          Aquí puedes ver todas las ofertas a las que has aplicado y su estado actual.
        </p>
        
        {/* Debug section - temporal */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p className="text-sm">Usuario: {user?.username || user?.name || 'N/A'}</p>
          <p className="text-sm">User ID: {user?.id} (Type: {typeof user?.id})</p>
          <p className="text-sm">Aplicaciones encontradas: {aplicaciones.length}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowBackendManager(true)}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
            >
              ⚙️ Backend Manager
            </button>
            <button
              onClick={() => {
                console.log('🗑️ Clearing localStorage');
                localStorage.removeItem('user-applications');
                fetchAplicaciones();
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Limpiar LocalStorage
            </button>
            <button
              onClick={fetchAplicaciones}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>

      {aplicaciones.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes aplicaciones aún
          </h3>
          <p className="text-gray-600 mb-4">
            Explora las ofertas disponibles y aplica a las que te interesen.
          </p>
          <button 
            onClick={() => router.push('/ofertas')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Ver Ofertas
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aplicaciones.map((aplicacion) => (
            <div key={aplicacion.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {aplicacion.position}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span>🏢</span>
                    {aplicacion.companyName}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  aplicacion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  aplicacion.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  aplicacion.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {aplicacion.status === 'pending' ? 'Pendiente' :
                   aplicacion.status === 'reviewed' ? 'Revisado' :
                   aplicacion.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📍</span>
                  <span>{aplicacion.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📅</span>
                  <span>Aplicado el {new Date(aplicacion.appliedDate).toLocaleDateString('es-ES')}</span>
                </div>

                {aplicacion.salary && (
                  <div className="text-sm font-medium text-green-600">
                    💰 {aplicacion.salary}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {aplicacion.description}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/ofertas/${aplicacion.offerId}`)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver Oferta
                </button>
                <button
                  onClick={() => handleRemoveApplication(aplicacion.id)}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Backend Manager Modal */}
      {showBackendManager && (
        <BackendManager 
          onClose={() => {
            setShowBackendManager(false);
            // Recargar aplicaciones después de cerrar el manager
            fetchAplicaciones();
          }} 
        />
      )}
      </div>
    </div>
  );
}
