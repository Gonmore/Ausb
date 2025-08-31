'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  RefreshCw,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';

interface ApplicationWithDetails {
  id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  message?: string;
  companyNotes?: string;
  rejectionReason?: string;
  offer: {
    id: string;
    name: string;
    location: string;
    type: string;
    description: string;
    sector: string;
  };
  Student: {
    id: string;
    grade: string;
    course: string;
    car: boolean;
    tag?: string;
    User: {
      id: string;
      name: string;
      surname: string;
      email: string;
      phone: string;
    };
    Profamily?: {
      id: string;
      name: string;
      description: string;
    };
  };
}

function CompanyApplicationsContent() {
  const { user, token, canAccessRole } = useAuthStore();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Verificar que el usuario puede acceder como empresa
  if (!canAccessRole('company')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder a las aplicaciones empresariales.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:5000/api/applications/company', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string, notes?: string, rejectionReason?: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          companyNotes: notes,
          rejectionReason
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }

      const result = await response.json();
      
      // Mostrar mensaje específico para aceptación
      if (newStatus === 'accepted') {
        toast.success('¡Estudiante aceptado exitosamente! Se han rechazado automáticamente sus otras aplicaciones.');
      } else if (newStatus === 'rejected') {
        toast.success('Aplicación rechazada');
      } else {
        toast.success('Estado actualizado exitosamente');
      }

      // Recargar las aplicaciones
      await fetchApplications();
      
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Error al actualizar el estado de la aplicación');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Revisada', icon: Eye },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Aceptada', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rechazada', icon: XCircle },
      withdrawn: { color: 'bg-gray-100 text-gray-800', label: 'Retirada', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Button onClick={fetchApplications} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Aplicaciones Recibidas</h1>
          <p className="text-gray-600">Gestiona las aplicaciones a tus ofertas de trabajo</p>
        </div>
        <Button onClick={fetchApplications} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aceptadas</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de aplicaciones */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay aplicaciones</h3>
            <p className="text-gray-600">Aún no has recibido aplicaciones a tus ofertas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {application.Student.User.name} {application.Student.User.surname}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-gray-600 mb-2">
                      Aplicó a: <span className="font-medium">{application.offer.name}</span>
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(application.appliedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {application.offer.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {application.Student.grade} - {application.Student.course}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(application.id, 'accepted')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(application.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalles
                    </Button>
                  </div>
                </div>
                
                {application.message && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Mensaje del candidato:</p>
                    <p className="text-sm text-gray-700">{application.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Detalles de la Aplicación</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApplication(null);
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Información del candidato */}
                <div>
                  <h3 className="font-semibold mb-3">Información del Candidato</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Nombre:</span> {selectedApplication.Student.User.name} {selectedApplication.Student.User.surname}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.Student.User.email}</p>
                    <p><span className="font-medium">Teléfono:</span> {selectedApplication.Student.User.phone}</p>
                    <p><span className="font-medium">Grado:</span> {selectedApplication.Student.grade}</p>
                    <p><span className="font-medium">Curso:</span> {selectedApplication.Student.course}</p>
                    {selectedApplication.Student.Profamily && (
                      <p><span className="font-medium">Familia Profesional:</span> {selectedApplication.Student.Profamily.name}</p>
                    )}
                    <p><span className="font-medium">Coche:</span> {selectedApplication.Student.car ? 'Sí' : 'No'}</p>
                  </div>
                </div>

                {/* Información de la oferta */}
                <div>
                  <h3 className="font-semibold mb-3">Oferta</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Puesto:</span> {selectedApplication.offer.name}</p>
                    <p><span className="font-medium">Ubicación:</span> {selectedApplication.offer.location}</p>
                    <p><span className="font-medium">Tipo:</span> {selectedApplication.offer.type}</p>
                    <p><span className="font-medium">Sector:</span> {selectedApplication.offer.sector}</p>
                  </div>
                </div>

                {/* Mensaje del candidato */}
                {selectedApplication.message && (
                  <div>
                    <h3 className="font-semibold mb-3">Mensaje del Candidato</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p>{selectedApplication.message}</p>
                    </div>
                  </div>
                )}

                {/* Notas de la empresa */}
                {selectedApplication.companyNotes && (
                  <div>
                    <h3 className="font-semibold mb-3">Notas de la Empresa</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p>{selectedApplication.companyNotes}</p>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aceptar Candidato
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar Candidato
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompanyApplicationsPage() {
  return (
    <AuthGuard requireAuth>
      <CompanyApplicationsContent />
    </AuthGuard>
  );
}
