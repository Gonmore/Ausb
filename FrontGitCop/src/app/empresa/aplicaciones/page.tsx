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
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface ApplicationWithDetails {
  id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn' | 'interview_requested' | 'interview_confirmed' | 'interview_rejected';
  appliedAt: string;
  message?: string;
  companyNotes?: string;
  rejectionReason?: string;
  interviewDetails?: {
    date: string;
    time: string;
    location: string;
    type: 'presencial' | 'remoto' | 'telefonica';
    notes?: string;
    link?: string;
  };
  interviewRequestedAt?: string;
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
  
  // 🔥 NUEVOS ESTADOS PARA LOS MODALES
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInterviewDetailsModal, setShowInterviewDetailsModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [generatedInterviewDetails, setGeneratedInterviewDetails] = useState<any>(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    location: '',
    type: 'presencial', // presencial, online, telefónica
    link: '',
    notes: ''
  });
  const [rejectForm, setRejectForm] = useState({
    reason: '',
    message: ''
  });

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

  // 🔥 LIMPIAR CAMPOS CUANDO CAMBIA EL TIPO DE ENTREVISTA
  useEffect(() => {
    if (interviewForm.type === 'remoto') {
      // Para entrevistas remotas, limpiar el campo de link manual ya que se genera automáticamente
      setInterviewForm(prev => ({ ...prev, link: '' }));
    }
  }, [interviewForm.type]);

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
      // Aplanar las aplicaciones agrupadas por estudiante
      const flattenedApplications = data.students ? data.students.flatMap((student: any) => 
        student.applications.map((app: any) => {
          console.log(`🔍 Frontend App ${app.id}:`, {
            status: app.status,
            interviewDetails: app.interviewDetails,
            interviewRequestedAt: app.interviewRequestedAt
          });
          return {
            ...app,
            Student: student.student,
            offer: app.offer
          };
        })
      ) : [];
      setApplications(flattenedApplications);
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

  const handleRequestInterview = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApplication.id}/interview`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'interview_requested',
          interviewDetails: {
            date: interviewForm.date,
            time: interviewForm.time,
            location: interviewForm.location,
            type: interviewForm.type,
            link: interviewForm.link || undefined,
            notes: interviewForm.notes
          },
          companyNotes: `Entrevista solicitada para ${interviewForm.date} a las ${interviewForm.time}`
        })
      });

      if (!response.ok) {
        throw new Error('Error al solicitar entrevista');
      }

      const result = await response.json();
      
      toast.success('Solicitud de entrevista enviada exitosamente');
      
      // 🔥 MOSTRAR MODAL DE CONFIRMACIÓN CON DETALLES GENERADOS
      setGeneratedInterviewDetails(result.application.interviewDetails);
      setShowConfirmationModal(true);
      
      // Limpiar formulario y cerrar modal de solicitud
      setInterviewForm({
        date: '',
        time: '',
        location: '',
        type: 'presencial',
        link: '',
        notes: ''
      });
      setShowInterviewModal(false);
      
      // Recargar aplicaciones
      await fetchApplications();
      
    } catch (error) {
      console.error('Error requesting interview:', error);
      toast.error('Error al solicitar la entrevista');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectWithMessage = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApplication.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectForm.reason,
          companyNotes: rejectForm.message
        })
      });

      if (!response.ok) {
        throw new Error('Error al rechazar aplicación');
      }

      toast.success('Aplicación rechazada con mensaje enviado');
      
      // Limpiar formulario y cerrar modal
      setRejectForm({
        reason: '',
        message: ''
      });
      setShowRejectModal(false);
      
      // Recargar aplicaciones
      await fetchApplications();
      
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error al rechazar la aplicación');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Revisada', icon: Eye },
      interview_requested: { color: 'bg-purple-100 text-purple-800', label: 'Entrevista Solicitada', icon: Calendar },
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
                  
                  {/* 🔥 BOTONES DE ACCIÓN RESTAURADOS Y MEJORADOS */}
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
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowInterviewModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Entrevista
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    
                    {application.status === 'reviewed' && (
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
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowInterviewModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Entrevista
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowRejectModal(true);
                          }}
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

                    {/* 🔥 SECCIÓN DE DETALLES DE ENTREVISTA AGREGADA */}
                    {selectedApplication.status === 'interview_requested' && (
                      <div>
                        <h3 className="font-semibold mb-3">Detalles de la Entrevista</h3>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
                              📅 Entrevista Solicitada
                            </Badge>
                            {selectedApplication.interviewRequestedAt && (
                              <span className="text-sm text-gray-600">
                                Solicitada el {new Date(selectedApplication.interviewRequestedAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>

                          {selectedApplication.interviewDetails ? (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Fecha:</span>
                                <p className="text-purple-700">{new Date(selectedApplication.interviewDetails.date).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Hora:</span>
                                <p className="text-purple-700">{selectedApplication.interviewDetails.time}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Modalidad:</span>
                                <p className="text-purple-700 capitalize">{selectedApplication.interviewDetails.type}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Ubicación:</span>
                                <p className="text-purple-700">{selectedApplication.interviewDetails.location}</p>
                              </div>
                              {selectedApplication.interviewDetails.link && (
                                <div className="col-span-2">
                                  <span className="font-medium text-gray-700">Enlace de reunión:</span>
                                  <p className="text-purple-700">
                                    <a
                                      href={selectedApplication.interviewDetails.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline hover:text-purple-800"
                                    >
                                      {selectedApplication.interviewDetails.link}
                                    </a>
                                  </p>
                                </div>
                              )}
                              {selectedApplication.interviewDetails.notes && (
                                <div className="col-span-2">
                                  <span className="font-medium text-gray-700">Notas:</span>
                                  <p className="text-purple-700 mt-1">{selectedApplication.interviewDetails.notes}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                              <h4 className="font-semibold text-yellow-800 mb-2">Esperando Detalles de la Entrevista</h4>
                              <p className="text-yellow-700 text-sm">
                                Los detalles específicos de la entrevista aún no están disponibles.
                                Te notificaremos cuando el candidato confirme la entrevista.
                              </p>
                            </div>
                          )}
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

          {/* Modal de detalles de entrevista */}
          {showInterviewDetailsModal && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Detalles de la Entrevista</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowInterviewDetailsModal(false);
                        setSelectedApplication(null);
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Información del candidato */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{selectedApplication.Student.User.name} {selectedApplication.Student.User.surname}</h3>
                      <p className="text-sm text-gray-600 mb-2">Aplicó a: {selectedApplication.offer.name}</p>
                      <p className="text-sm text-gray-700">{selectedApplication.offer.description}</p>
                    </div>

                    {/* Estado de la entrevista */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">Estado de la Entrevista</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50">
                          📅 Entrevista Solicitada
                        </Badge>
                        {selectedApplication.interviewRequestedAt && (
                          <span className="text-sm text-gray-600">
                            Solicitada el {new Date(selectedApplication.interviewRequestedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detalles de la entrevista */}
                    {selectedApplication.interviewDetails ? (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-3">Detalles de la Entrevista</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Fecha:</span>
                            <p className="text-purple-700">{new Date(selectedApplication.interviewDetails.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Hora:</span>
                            <p className="text-purple-700">{selectedApplication.interviewDetails.time}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Modalidad:</span>
                            <p className="text-purple-700 capitalize">{selectedApplication.interviewDetails.type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Ubicación:</span>
                            <p className="text-purple-700">{selectedApplication.interviewDetails.location}</p>
                          </div>
                          {selectedApplication.interviewDetails.link && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">Enlace de reunión:</span>
                              <p className="text-purple-700">
                                <a
                                  href={selectedApplication.interviewDetails.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-purple-800"
                                >
                                  {selectedApplication.interviewDetails.link}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                        {selectedApplication.interviewDetails.notes && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Notas:</span>
                            <p className="text-purple-700 mt-1">{selectedApplication.interviewDetails.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">Esperando Detalles de la Entrevista</h4>
                        <p className="text-yellow-700 text-sm">
                          Los detalles específicos de la entrevista aún no están disponibles.
                          Te notificaremos cuando el candidato confirme la entrevista.
                        </p>
                      </div>
                    )}

                    {/* Notas de la empresa */}
                    {selectedApplication.companyNotes && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Mensaje de la Empresa</h4>
                        <p className="text-blue-700 text-sm">{selectedApplication.companyNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal para solicitar entrevista */}
          {showInterviewModal && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Solicitar Entrevista</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowInterviewModal(false);
                        setInterviewForm({
                          date: '',
                          time: '',
                          location: '',
                          type: 'presencial',
                          link: '',
                          notes: ''
                        });
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Candidato:</strong> {selectedApplication.Student.User.name} {selectedApplication.Student.User.surname}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Oferta:</strong> {selectedApplication.offer.name}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de la entrevista
                        </label>
                        <input
                          type="date"
                          value={interviewForm.date}
                          onChange={(e) => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora
                        </label>
                        <input
                          type="time"
                          value={interviewForm.time}
                          onChange={(e) => setInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de entrevista
                      </label>
                      <select
                        value={interviewForm.type}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="presencial">Presencial</option>
                        <option value="remoto">Remoto (videollamada)</option>
                        <option value="telefonica">Telefónica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación / Enlace
                      </label>
                      <input
                        type="text"
                        value={interviewForm.location}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder={
                          interviewForm.type === 'presencial' ? 'Dirección de la oficina' :
                          interviewForm.type === 'remoto' ? 'Plataforma de videollamada (ej: Google Meet)' :
                          'Número de teléfono'
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {interviewForm.type !== 'remoto' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enlace de reunión (opcional)
                        </label>
                        <input
                          type="url"
                          value={interviewForm.link}
                          onChange={(e) => setInterviewForm(prev => ({ ...prev, link: e.target.value }))}
                          placeholder="https://meet.google.com/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        value={interviewForm.notes}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Instrucciones adicionales, documentos a traer, etc."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t mt-6">
                    <Button
                      onClick={handleRequestInterview}
                      disabled={!interviewForm.date || !interviewForm.time || !interviewForm.location}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Solicitar Entrevista
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInterviewModal(false);
                        setInterviewForm({
                          date: '',
                          time: '',
                          location: '',
                          type: 'presencial',
                          link: '',
                          notes: ''
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal para rechazar con mensaje */}
          {showRejectModal && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Rechazar Aplicación</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectForm({ reason: '', message: '' });
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Candidato:</strong> {selectedApplication.Student.User.name} {selectedApplication.Student.User.surname}
                    </p>
                    <p className="text-sm text-red-800">
                      <strong>Oferta:</strong> {selectedApplication.offer.name}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo del rechazo
                      </label>
                      <select
                        value={rejectForm.reason}
                        onChange={(e) => setRejectForm(prev => ({ ...prev, reason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Selecciona un motivo</option>
                        <option value="perfil_no_coincide">El perfil no coincide con los requisitos</option>
                        <option value="experiencia_insuficiente">Experiencia insuficiente</option>
                        <option value="formacion_inadecuada">Formación no adecuada para el puesto</option>
                        <option value="posicion_cubierta">La posición ya fue cubierta</option>
                        <option value="candidato_sobrecualificado">Candidato sobrecualificado</option>
                        <option value="disponibilidad_incompatible">Disponibilidad incompatible</option>
                        <option value="ubicacion_inadecuada">Ubicación no compatible</option>
                        <option value="otro">Otro motivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje para el candidato
                      </label>
                      <textarea
                        value={rejectForm.message}
                        onChange={(e) => setRejectForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Escribe un mensaje constructivo para el candidato..."
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Este mensaje será enviado al candidato junto con la notificación de rechazo.
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Importante</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta acción no se puede deshacer. El candidato recibirá una notificación con el motivo del rechazo.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t mt-6">
                    <Button
                      onClick={handleRejectWithMessage}
                      disabled={!rejectForm.reason}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirmar Rechazo
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectModal(false);
                        setRejectForm({ reason: '', message: '' });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación de entrevista solicitada */}
      {showConfirmationModal && generatedInterviewDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-green-700">✅ Entrevista Solicitada Exitosamente</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setGeneratedInterviewDetails(null);
                    setSelectedApplication(null);
                  }}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Información del candidato */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Entrevista programada con:</h3>
                  <p className="text-green-700 font-medium">
                    {selectedApplication.Student.User.name} {selectedApplication.Student.User.surname}
                  </p>
                  <p className="text-green-600 text-sm">
                    Oferta: {selectedApplication.offer.name}
                  </p>
                </div>

                {/* Detalles de la entrevista generados */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">📅 Detalles de la Entrevista</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Fecha:</span>
                      <p className="text-blue-700">{new Date(generatedInterviewDetails.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hora:</span>
                      <p className="text-blue-700">{generatedInterviewDetails.time}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Modalidad:</span>
                      <p className="text-blue-700 capitalize">{generatedInterviewDetails.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Ubicación:</span>
                      <p className="text-blue-700">{generatedInterviewDetails.location}</p>
                    </div>
                    {generatedInterviewDetails.link && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">🔗 Enlace de reunión:</span>
                        <p className="text-blue-700 mt-1">
                          <a
                            href={generatedInterviewDetails.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-800 break-all"
                          >
                            {generatedInterviewDetails.link}
                          </a>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Este enlace ha sido generado automáticamente para la videollamada.
                        </p>
                      </div>
                    )}
                    {generatedInterviewDetails.notes && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Notas:</span>
                        <p className="text-blue-700 mt-1">{generatedInterviewDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Próximos pasos */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">📋 Próximos Pasos</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• El estudiante recibirá una notificación con los detalles de la entrevista</li>
                    <li>• El estudiante podrá confirmar o rechazar la entrevista</li>
                    <li>• Recibirás una notificación cuando el estudiante responda</li>
                    {generatedInterviewDetails.type === 'remoto' && (
                      <li>• El enlace de Google Meet está listo para usar en la fecha programada</li>
                    )}
                  </ul>
                </div>

                {/* Botón de cerrar */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowConfirmationModal(false);
                      setGeneratedInterviewDetails(null);
                      setSelectedApplication(null);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Entendido
                  </Button>
                </div>
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
