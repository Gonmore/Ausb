'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Eye, 
  Mail, 
  Search, 
  User, 
  Car, 
  GraduationCap, 
  Briefcase, 
  Send, 
  Download, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building,
  MapPin,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';

interface StudentApplication {
  id: number;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  message?: string;
  companyNotes?: string;
  rejectionReason?: string;
  offer: {
    id: number;
    name: string;
    location: string;
    type: string;
    mode: string;
    description: string;
    sector: string;
  };
}

interface GroupedStudent {
  student: {
    id: number;
    grade: string;
    course: string;
    car: boolean;
    tag: string;
    description: string;
    User: {
      id: number;
      name: string;
      surname: string;
      email: string;
      phone: string;
    };
    profamily?: {
      id: number;
      name: string;
    };
  };
  applications: StudentApplication[];
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
    latestApplication: string;
    firstApplication: string;
  };
  primaryStatus: string;
  mostRecentOffer: string;
  totalOffers: number;
}

function CandidateSearchContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<GroupedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<GroupedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState({ totalStudents: 0, totalApplications: 0, averageApplicationsPerStudent: 0 });
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const { token } = useAuthStore();

  // Cargar aplicaciones agrupadas
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Cargando aplicaciones agrupadas por estudiante...');
        
        const response = await fetch('http://localhost:5000/api/applications/company', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Datos agrupados cargados:', data);
        
        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
        setSummary(data.summary || { totalStudents: 0, totalApplications: 0, averageApplicationsPerStudent: 0 });
        
      } catch (error) {
        console.error('❌ Error cargando aplicaciones:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchApplications();
    }
  }, [token]);

  // Filtrar estudiantes
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.student.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.User.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.User.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.applications.some(app => 
          app.offer.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const toggleStudentExpansion = (studentId: number) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleViewCV = async (student: any) => {
    try {
      console.log('📄 Ver CV gratuito para candidato:', student.id);
      
      const response = await fetch(`http://localhost:5000/api/students/${student.id}/view-cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromIntelligentSearch: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al obtener el CV');
      }

      const cvData = await response.json();
      console.log('✅ CV obtenido gratuitamente:', cvData);
      
      setSelectedStudent({
        ...student,
        cvData: cvData
      });
      setShowCVModal(true);
      
    } catch (error) {
      console.error('❌ Error obteniendo CV:', error);
      alert(error instanceof Error ? error.message : 'Error al obtener el CV del estudiante');
    }
  };

  const handleContactStudent = async (student: any, applications: StudentApplication[]) => {
    const offerNames = applications.map(app => app.offer.name).join(', ');
    
    setSelectedStudent(student);
    setContactForm({
      subject: `Interés en tus aplicaciones - ${applications.length > 1 ? 'Múltiples ofertas' : applications[0].offer.name}`,
      message: `Estimado/a ${student.User.name},\n\nHemos revisado tus aplicaciones para ${applications.length > 1 ? 'nuestras ofertas' : 'nuestra oferta'} y nos ha parecido muy interesante tu perfil.\n\nOfertas aplicadas:\n${applications.map(app => `- ${app.offer.name} (${app.status === 'pending' ? 'Pendiente' : app.status})`).join('\n')}\n\nNos gustaría conocerte mejor y discutir estas oportunidades contigo.\n\n¿Estarías disponible para una entrevista?\n\nSaludos cordiales.`
    });
    setShowContactModal(true);
  };

  const handleSendEmail = async () => {
    if (!selectedStudent) return;

    try {
      console.log('📞 Contactar candidato gratuito:', selectedStudent.id);
      
      const response = await fetch(`http://localhost:5000/api/students/${selectedStudent.id}/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromIntelligentSearch: false,
          subject: contactForm.subject,
          message: contactForm.message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al contactar el estudiante');
      }

      const result = await response.json();
      console.log('✅ Contacto registrado gratuitamente:', result);

      // Abrir cliente de email
      const emailBody = encodeURIComponent(contactForm.message);
      const emailSubject = encodeURIComponent(contactForm.subject);
      const emailUrl = `mailto:${selectedStudent.User.email}?subject=${emailSubject}&body=${emailBody}`;
      
      window.open(emailUrl);
      
      setShowContactModal(false);
      setContactForm({ subject: '', message: '' });
      
      alert('✅ Contacto registrado exitosamente. Se ha abierto tu cliente de email.');
      
    } catch (error) {
      console.error('❌ Error contactando estudiante:', error);
      alert(error instanceof Error ? error.message : 'Error al contactar el estudiante');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'reviewed': 'bg-blue-100 text-blue-800 border-blue-300',
      'accepted': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300',
      'withdrawn': 'bg-gray-100 text-gray-800 border-gray-300'
    };

    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'reviewed': 'Revisado',
      'accepted': 'Aceptado',
      'rejected': 'Rechazado',
      'withdrawn': 'Retirado'
    };

    return (
      <Badge variant="outline" className={variants[status] || variants.pending}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPrimaryStatusBadge = (primaryStatus: string, stats: any) => {
    if (stats.accepted > 0) {
      return <Badge className="bg-green-100 text-green-800">✅ Aceptado en {stats.accepted} oferta{stats.accepted > 1 ? 's' : ''}</Badge>;
    }
    if (stats.rejected === stats.total && stats.total > 0) {
      return <Badge className="bg-red-100 text-red-800">❌ Rechazado en todas</Badge>;
    }
    if (stats.reviewed > 0) {
      return <Badge className="bg-blue-100 text-blue-800">👀 {stats.reviewed} revisada{stats.reviewed > 1 ? 's' : ''}</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">⏳ {stats.pending} pendiente{stats.pending > 1 ? 's' : ''}</Badge>;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-800">Error al cargar candidatos</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con estadísticas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidatos</h1>
        <p className="text-gray-600 mb-4">
          Estudiantes que han aplicado a tus ofertas - Vista agrupada por persona
        </p>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Candidatos únicos</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total aplicaciones</p>
                  <p className="text-2xl font-bold text-green-600">{summary.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Promedio por candidato</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.averageApplicationsPerStudent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Acceso gratuito: Puedes ver CVs completos y contactar sin costo
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar candidatos por nombre, email, curso u oferta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de candidatos agrupados */}
      <div className="grid gap-6">
        {filteredStudents.map((studentData) => {
          const student = studentData.student;
          const isExpanded = expandedStudents.has(student.id);

          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Información básica del estudiante */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.User.name?.charAt(0) || 'N'}{student.User.surname?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{student.User.name} {student.User.surname}</h3>
                        <p className="text-gray-600">{student.User.email}</p>
                        {student.User.phone && (
                          <p className="text-gray-500 text-sm">{student.User.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {getPrimaryStatusBadge(studentData.primaryStatus, studentData.stats)}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {studentData.totalOffers} aplicacion{studentData.totalOffers > 1 ? 'es' : ''}
                        </Badge>
                      </div>
                    </div>

                    {/* Información académica */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {student.grade} - {student.course}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="w-4 h-4 mr-2" />
                        {student.car ? 'Con vehículo' : 'Sin vehículo'}
                      </div>
                      {student.profamily && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {student.profamily.name}
                        </div>
                      )}
                    </div>

                    {/* Resumen de aplicaciones */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Última aplicación: {new Date(studentData.stats.latestApplication).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-sm text-gray-600">
                          • Oferta: {studentData.mostRecentOffer}
                        </span>
                      </div>
                      
                      {/* Estadísticas rápidas */}
                      <div className="flex gap-2 text-xs">
                        {studentData.stats.pending > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                            {studentData.stats.pending} pendiente{studentData.stats.pending > 1 ? 's' : ''}
                          </span>
                        )}
                        {studentData.stats.reviewed > 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {studentData.stats.reviewed} revisada{studentData.stats.reviewed > 1 ? 's' : ''}
                          </span>
                        )}
                        {studentData.stats.accepted > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                            {studentData.stats.accepted} aceptada{studentData.stats.accepted > 1 ? 's' : ''}
                          </span>
                        )}
                        {studentData.stats.rejected > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                            {studentData.stats.rejected} rechazada{studentData.stats.rejected > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón para expandir aplicaciones */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStudentExpansion(student.id)}
                          className="mb-4"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Ocultar aplicaciones ({studentData.applications.length})
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Ver todas las aplicaciones ({studentData.applications.length})
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className={isExpanded ? 'block' : 'hidden'}>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <h4 className="font-medium text-gray-900 mb-3">Todas las aplicaciones:</h4>
                          {studentData.applications.map((application) => (
                            <div key={application.id} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{application.offer.name}</span>
                                    {getStatusBadge(application.status)}
                                  </div>
                                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {application.offer.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(application.appliedAt).toLocaleDateString('es-ES')}
                                    </div>
                                  </div>
                                  {application.message && (
                                    <p className="text-sm text-gray-700 mt-2 italic bg-gray-100 p-2 rounded">
                                      "{application.message}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Habilidades */}
                    {student.tag && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {student.tag.split(',').slice(0, 8).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            {tag.trim()}
                          </Badge>
                        ))}
                        {student.tag.split(',').length > 8 && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            +{student.tag.split(',').length - 8} más
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCV(student)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver CV (Gratis)
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleContactStudent(student, studentData.applications)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contactar (Gratis)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay estudiantes que hayan aplicado a tus ofertas'}
            </p>
            {!searchTerm && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Sugerencia:</strong> Publica ofertas para recibir aplicaciones, 
                  o usa el "Buscador Inteligente" para encontrar candidatos proactivamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal CV - Mismo que antes */}
      <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              CV de {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
              <Badge className="bg-green-100 text-green-800 ml-2">
                Acceso Gratuito
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Información personal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="font-medium">{selectedStudent.User.name} {selectedStudent.User.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudent.User.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{selectedStudent.User.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehículo propio</p>
                    <p className="font-medium">{selectedStudent.car ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Formación académica */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Grado</p>
                    <p className="font-medium">{selectedStudent.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Curso</p>
                    <p className="font-medium">{selectedStudent.course}</p>
                  </div>
                  {selectedStudent.profamily && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Familia Profesional</p>
                      <p className="font-medium">{selectedStudent.profamily.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Habilidades */}
              {selectedStudent.tag && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.tag.split(',').map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {selectedStudent.description && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Descripción Personal</h3>
                  <p className="text-gray-700">{selectedStudent.description}</p>
                </div>
              )}

              {/* Información de acceso */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Acceso Completo Gratuito</h4>
                </div>
                <p className="text-sm text-green-700">
                  Este estudiante aplicó a tus ofertas, por lo que puedes ver su CV completo y contactarlo sin costo adicional.
                </p>
              </div>

              {/* Acciones adicionales */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Imprimir CV
                </Button>
                <Button 
                  onClick={() => {
                    setShowCVModal(false);
                    // Encontrar las aplicaciones del estudiante seleccionado
                    const studentData = filteredStudents.find(s => s.student.id === selectedStudent.id);
                    if (studentData) {
                      handleContactStudent(selectedStudent, studentData.applications);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Estudiante
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Contactar - Mismo que antes pero con mensaje mejorado para múltiples aplicaciones */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contactar a {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
              <Badge className="bg-green-100 text-green-800 ml-2">
                Gratis
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del email"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Escribe tu mensaje aquí..."
                rows={10}
              />
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Contacto gratuito</span>
              </div>
              <p className="text-sm text-green-700">
                <strong>Para:</strong> {selectedStudent?.User?.email}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowContactModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CandidateSearchPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <CandidateSearchContent />
    </AuthGuard>
  );
}
