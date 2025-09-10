'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Calendar,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface ApplicationWithOffer {
  id: string;
  offerId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  reviewedAt?: string; // 🔥 AGREGAR reviewedAt
  message?: string;
  // 🔥 AGREGAR CAMPOS DE ESTADO
  isReviewed: boolean;
  cvViewed: boolean;
  statusLabel: string;
  offer: {
    id: string;
    name: string;
    description: string;
    location: string;
    type: string;
    company: {
      name: string;
      city: string;
      sector: string;
    };
  };
}

export default function AplicacionesPage() {
  const [aplicaciones, setAplicaciones] = useState<ApplicationWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'student') {
      router.push('/dashboard');
      return;
    }

    fetchAplicaciones();
  }, [user, token, router]);

  const fetchAplicaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id || !token) {
        throw new Error('Usuario no válido');
      }

      console.log('🔍 Fetching applications for user:', user.id);
      
      const response = await fetch(`http://localhost:5000/api/applications/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Applications loaded:', data);
      
      setAplicaciones(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplication = async (applicationId: string) => {
    console.log('🗑️ Removing application:', applicationId);

    if (!applicationId || applicationId === 'undefined') {
      alert('Error: ID de aplicación no válido');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres retirar esta aplicación?')) return;
    
    try {
      // 🔥 USAR applicationId EN LA URL PARA COINCIDIR CON LA RUTA
      const url = `http://localhost:5000/api/applications/${applicationId}`;
      console.log('🌐 DELETE URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        throw new Error(errorData.mensaje || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Delete result:', result);

      // 🔥 ACTUALIZAR ESTADO LOCAL
      setAplicaciones(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'withdrawn' as const }
          : app
      ));

      alert('Aplicación retirada exitosamente');
      
    } catch (err: any) {
      console.error('❌ Error removing application:', err);
      alert(`Error al retirar la aplicación: ${err.message}`);
    }
  };

  const getStatusBadge = (aplicacion: ApplicationWithOffer) => {
    // 🔥 PRIORIZAR "CV REVISADO" SOBRE "PENDING"
    if (aplicacion.reviewedAt && aplicacion.status === 'reviewed') {
      return (
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
            ✓ CV Revisado
          </Badge>
          <span className="text-xs text-blue-600">
            {new Date(aplicacion.reviewedAt).toLocaleDateString('es-ES')}
          </span>
        </div>
      );
    }

    switch (aplicacion.status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pendiente</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Revisada</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-600">Aceptada</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazada</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="text-gray-600 border-gray-300">Retirada</Badge>;
      default:
        return <Badge variant="outline">{aplicacion.status}</Badge>;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'Tiempo Completo';
      case 'part-time': return 'Tiempo Parcial';
      case 'internship': return 'Prácticas';
      case 'freelance': return 'Freelance';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
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
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={fetchAplicaciones} 
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Aplicaciones</h1>
          <p className="text-gray-600 mt-2">Revisa el estado de tus aplicaciones a ofertas de trabajo</p>
        </div>
        <Button 
          onClick={fetchAplicaciones} 
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Lista de aplicaciones */}
      {aplicaciones.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes aplicaciones</h3>
            <p className="text-gray-600 mb-4">
              Aún no has aplicado a ninguna oferta de trabajo.
            </p>
            <Button onClick={() => router.push('/ofertas')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Ofertas Disponibles
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {aplicaciones.map((aplicacion) => (
            <Card key={aplicacion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold">{aplicacion.offer.name}</h3>
                      {getStatusBadge(aplicacion)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {aplicacion.offer.company.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {aplicacion.offer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getJobTypeLabel(aplicacion.offer.type)}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{aplicacion.offer.description}</p>

                    {/* 🔥 INFORMACIÓN DE ESTADO MÁS DETALLADA */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Aplicado: {new Date(aplicacion.appliedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      
                      {/* 🔥 MOSTRAR FECHA DE REVISIÓN SI EXISTE */}
                      {aplicacion.reviewedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">
                            CV revisado: {new Date(aplicacion.reviewedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {aplicacion.offer.company.sector}
                      </div>
                    </div>

                    {/* 🔥 INDICADOR VISUAL ADICIONAL PARA CV REVISADO */}
                    {aplicacion.reviewedAt && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            ¡La empresa ha revisado tu CV!
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Esto significa que la empresa ha visto tu perfil completo y está considerando tu aplicación.
                        </p>
                      </div>
                    )}

                    {aplicacion.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Tu mensaje:</strong> {aplicacion.message}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/ofertas/${aplicacion.offer.id}`)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    
                    {aplicacion.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('🔍 Button clicked with ID:', aplicacion.id, 'Type:', typeof aplicacion.id);
                          handleRemoveApplication(aplicacion.id.toString());
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      {aplicaciones.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumen de Aplicaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {aplicaciones.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {aplicaciones.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              {/* 🔥 AGREGAR ESTADÍSTICA DE CV REVISADO */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {aplicaciones.filter(a => a.reviewedAt).length}
                </div>
                <div className="text-sm text-gray-600">CV Revisados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {aplicaciones.filter(a => a.status === 'accepted').length}
                </div>
                <div className="text-sm text-gray-600">Aceptadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {aplicaciones.filter(a => a.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rechazadas</div>
              </div>
            </div>
            
            {/* 🔥 AGREGAR PROGRESO VISUAL */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2">Progreso de tus aplicaciones:</div>
              <div className="flex rounded-full overflow-hidden h-3 bg-gray-200">
                <div 
                  className="bg-yellow-500" 
                  style={{ width: `${(aplicaciones.filter(a => a.status === 'pending').length / aplicaciones.length) * 100}%` }}
                ></div>
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${(aplicaciones.filter(a => a.reviewedAt).length / aplicaciones.length) * 100}%` }}
                ></div>
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(aplicaciones.filter(a => a.status === 'accepted').length / aplicaciones.length) * 100}%` }}
                ></div>
                <div 
                  className="bg-red-500" 
                  style={{ width: `${(aplicaciones.filter(a => a.status === 'rejected').length / aplicaciones.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Pendientes</span>
                <span>CV Revisados</span>
                <span>Aceptadas</span>
                <span>Rechazadas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
