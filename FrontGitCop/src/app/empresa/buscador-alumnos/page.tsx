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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BarChart3,
  XCircle,
  Brain,          // 🔥 AGREGAR
  Star,           // 🔥 AGREGAR
  CreditCard,     // 🔥 AGREGAR
  Video,          // 🔥 AGREGAR PARA GOOGLE MEET
  AlertTriangle   // 🔥 AGREGAR PARA PROFAMILIA SIMILAR
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

  // 🔥 NUEVOS ESTADOS PARA GESTIÓN DE CANDIDATOS
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedCandidateApplications, setSelectedCandidateApplications] = useState<StudentApplication[]>([]);
  const [interviewForm, setInterviewForm] = useState({
    applicationIds: [] as number[],
    date: '',
    time: '',
    location: '',
    type: 'presencial',
    notes: ''
  });
  const [rejectForm, setRejectForm] = useState({
    applicationIds: [] as number[],
    reason: '',
    message: ''
  });
  const [acceptForm, setAcceptForm] = useState({
    applicationIds: [] as number[],
    message: ''
  });

  // 🔥 NUEVOS ESTADOS PARA CONFIRMACIÓN DE ENTREVISTA
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [generatedInterviewDetails, setGeneratedInterviewDetails] = useState<any>(null);
   // 🔥 NUEVOS ESTADOS PARA CVs REVELADOS
  const [revealedStudents, setRevealedStudents] = useState<any[]>([]);
  const [loadingRevealed, setLoadingRevealed] = useState(false);
  const [revealedSummary, setRevealedSummary] = useState({ 
    totalRevealed: 0, 
    totalTokensSpent: 0, 
    averageTokensPerReveal: 0 
  });
  const [activeTab, setActiveTab] = useState('aplicaciones');

  const { token } = useAuthStore();

  // Cargar aplicaciones agrupadas
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) return;
      
      // Cargar aplicaciones
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

      // 🔥 CARGAR CVs REVELADOS
      await fetchRevealedStudents();
    };

    fetchAllData();
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

  // 🔥 LIMPIAR CAMPO LOCATION CUANDO CAMBIA EL TIPO DE ENTREVISTA
  useEffect(() => {
    if (interviewForm.type === 'online') {
      setInterviewForm(prev => ({ ...prev, location: '' }));
    } else if (interviewForm.type === 'telefonica') {
      setInterviewForm(prev => ({ ...prev, location: '' }));
    }
  }, [interviewForm.type]);

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

  const handleAcceptCandidate = (student: any, applications: StudentApplication[]) => {
    console.log('✅ Aceptar candidato:', student.User.name, 'Aplicaciones:', applications.length);
    setSelectedStudent(student);
    setSelectedCandidateApplications(applications);
    setAcceptForm({
      applicationIds: applications.map(app => app.id),
      message: `¡Felicidades ${student.User.name}! Hemos decidido aceptar tu candidatura para ${applications.length > 1 ? 'nuestras ofertas' : applications[0].offer.name}.\n\nNos pondremos en contacto contigo pronto para coordinar los próximos pasos.\n\n¡Bienvenido/a al equipo!`
    });
    setShowAcceptModal(true);
  };

  const handleRequestInterview = (student: any, applications: StudentApplication[]) => {
    console.log('📅 Solicitar entrevista:', student.User.name, 'Aplicaciones:', applications.length);
    setSelectedStudent(student);
    setSelectedCandidateApplications(applications);
    setInterviewForm({
      applicationIds: applications.map(app => app.id),
      date: '',
      time: '',
      location: '',
      type: 'presencial',
      notes: `Entrevista para ${applications.length > 1 ? 'múltiples posiciones' : applications[0].offer.name}`
    });
    setShowInterviewModal(true);
  };

  const handleRejectCandidate = (student: any, applications: StudentApplication[]) => {
    console.log('❌ Rechazar candidato:', student.User.name, 'Aplicaciones:', applications.length);
    setSelectedStudent(student);
    setSelectedCandidateApplications(applications);
    setRejectForm({
      applicationIds: applications.map(app => app.id),
      reason: '',
      message: `Estimado/a ${student.User.name},\n\nTe agradecemos el interés mostrado en ${applications.length > 1 ? 'nuestras ofertas' : applications[0].offer.name}.\n\nEn esta ocasión hemos decidido continuar con otros candidatos que se ajustan más al perfil que buscamos.\n\nTe animamos a seguir participando en futuras convocatorias.\n\nSaludos cordiales.`
    });
    setShowRejectModal(true);
  };

  const handleConfirmAccept = async () => {
    if (!selectedStudent) return;

    try {
      console.log('✅ Confirmando aceptación para aplicaciones:', acceptForm.applicationIds);
      
      // Procesar cada aplicación
      for (const applicationId of acceptForm.applicationIds) {
        const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'accepted',
            companyNotes: acceptForm.message
          })
        });

        if (!response.ok) {
          throw new Error(`Error al aceptar aplicación ${applicationId}`);
        }
      }

      alert(`✅ Candidato aceptado exitosamente para ${acceptForm.applicationIds.length} aplicación(es)`);
      
      // Recargar datos
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error aceptando candidato:', error);
      alert('Error al aceptar el candidato');
    } finally {
      setShowAcceptModal(false);
      setAcceptForm({ applicationIds: [], message: '' });
    }
  };

  const handleConfirmInterview = async () => {
    if (!selectedStudent) return;

    try {
      console.log('📅 Confirmando entrevista para aplicaciones:', interviewForm.applicationIds);
      
      let finalLocation = interviewForm.location;
      
      // 🔥 GENERAR AUTOMÁTICAMENTE ENLACE DE GOOGLE MEET PARA ENTREVISTAS ONLINE
      if (interviewForm.type === 'online') {
        try {
          const meetResponse = await fetch('http://localhost:5000/api/meetings/generate-link', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: `Entrevista - ${selectedStudent.User.name} ${selectedStudent.User.surname}`,
              date: interviewForm.date,
              time: interviewForm.time
            })
          });

          if (meetResponse.ok) {
            const meetData = await meetResponse.json();
            finalLocation = meetData.meetLink;
            console.log('✅ Enlace de Google Meet generado:', finalLocation);
          } else {
            console.error('❌ Error generando enlace de Google Meet');
            alert('Error al generar el enlace de Google Meet. La entrevista se programará sin enlace.');
          }
        } catch (error) {
          console.error('❌ Error en la petición de Google Meet:', error);
          alert('Error al generar el enlace de Google Meet. La entrevista se programará sin enlace.');
        }
      }
      
      // 🔥 MOSTRAR MODAL DE CONFIRMACIÓN CON DETALLES GENERADOS
      const interviewDetails = {
        date: interviewForm.date,
        time: interviewForm.time,
        location: finalLocation,
        type: interviewForm.type,
        notes: interviewForm.notes,
        generatedLink: interviewForm.type === 'online' ? finalLocation : null,
        candidateName: `${selectedStudent.User.name} ${selectedStudent.User.surname}`,
        applicationsCount: interviewForm.applicationIds.length
      };
      
      setGeneratedInterviewDetails(interviewDetails);
      setShowConfirmationModal(true);
      
    } catch (error) {
      console.error('❌ Error preparando entrevista:', error);
      alert('Error al preparar la entrevista');
    }
  };

  // 🔥 FUNCIÓN PARA CONFIRMAR LA ENTREVISTA DESPUÉS DE VER LOS DETALLES
  const handleFinalConfirmInterview = async () => {
    if (!selectedStudent || !generatedInterviewDetails) return;

    try {
      console.log('📅 Ejecutando entrevista programada...');
      
      // Procesar cada aplicación
      for (const applicationId of interviewForm.applicationIds) {
        const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/interview`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interviewDetails: {
              date: generatedInterviewDetails.date,
              time: generatedInterviewDetails.time,
              location: generatedInterviewDetails.location,
              type: generatedInterviewDetails.type,
              notes: generatedInterviewDetails.notes
            },
            companyNotes: `Entrevista programada para ${generatedInterviewDetails.date} a las ${generatedInterviewDetails.time}`
          })
        });

        if (!response.ok) {
          throw new Error(`Error al programar entrevista para aplicación ${applicationId}`);
        }
      }

      alert(`📅 Entrevista programada exitosamente para ${interviewForm.applicationIds.length} aplicación(es)`);
      
      // Recargar datos
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error programando entrevista:', error);
      alert('Error al programar la entrevista');
    } finally {
      setShowConfirmationModal(false);
      setShowInterviewModal(false);
      setGeneratedInterviewDetails(null);
      setInterviewForm({
        applicationIds: [],
        date: '',
        time: '',
        location: '',
        type: 'presencial',
        notes: ''
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedStudent) return;

    try {
      console.log('❌ Confirmando rechazo para aplicaciones:', rejectForm.applicationIds);
      
      // Procesar cada aplicación
      for (const applicationId of rejectForm.applicationIds) {
        const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'rejected',
            rejectionReason: rejectForm.reason,
            companyNotes: rejectForm.message
          })
        });

        if (!response.ok) {
          throw new Error(`Error al rechazar aplicación ${applicationId}`);
        }
      }

      alert(`❌ Candidato rechazado para ${rejectForm.applicationIds.length} aplicación(es)`);
      
      // Recargar datos
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error rechazando candidato:', error);
      alert('Error al rechazar el candidato');
    } finally {
      setShowRejectModal(false);
      setRejectForm({ applicationIds: [], reason: '', message: '' });
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

  // 🔥 FUNCIONES PARA RESALTAR COINCIDENCIAS CON LA OFERTA
  const getMatchingSkills = (studentSkills: any[], offerSkills: any) => {
    if (!studentSkills || !offerSkills) return [];
    
    const offerSkillNames = Object.keys(offerSkills).map(name => name.toLowerCase().trim());
    return studentSkills.filter(skill => 
      offerSkillNames.includes(skill.name.toLowerCase().trim())
    );
  };

  const isMatchingProFamily = (studentProFamily: any, offerProFamily: any) => {
    if (!studentProFamily || !offerProFamily) return false;
    
    // Comparar por ID o por nombre (case insensitive)
    return studentProFamily.id === offerProFamily.id || 
           studentProFamily.name?.toLowerCase().trim() === offerProFamily.name?.toLowerCase().trim();
  };

  const isSimilarProFamily = (studentProFamily: any, offerProFamily: any) => {
    if (!studentProFamily || !offerProFamily) return false;
    
    // Si ya es matching, no es "similar"
    if (isMatchingProFamily(studentProFamily, offerProFamily)) return false;
    
    // Comparar por descripción o palabras clave similares
    const studentDesc = studentProFamily.description?.toLowerCase() || '';
    const offerDesc = offerProFamily.description?.toLowerCase() || '';
    
    // Palabras clave comunes que indican similitud
    const techKeywords = ['informática', 'tecnología', 'desarrollo', 'programación', 'software', 'it', 'computación'];
    const hasTechMatch = techKeywords.some(keyword => 
      studentDesc.includes(keyword) && offerDesc.includes(keyword)
    );
    
    return hasTechMatch;
  };

  const getAffinityColor = (level: string) => {
    switch (level) {
      case 'muy alto': return 'bg-green-100 text-green-800 border-green-300';
      case 'alto': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // AGREGAR esta función después de las funciones existentes:

  const fetchRevealedStudents = async () => {
    try {
      setLoadingRevealed(true);
      console.log('🔍 Cargando estudiantes con CVs revelados...');
      
      const response = await fetch('http://localhost:5000/api/students/revealed-candidates', {
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
      console.log('✅ CVs revelados cargados:', data);
      
      setRevealedStudents(data.students || []);
      setRevealedSummary(data.summary || { 
        totalRevealed: 0, 
        totalTokensSpent: 0, 
        averageTokensPerReveal: 0 
      });
      
    } catch (error) {
      console.error('❌ Error cargando CVs revelados:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoadingRevealed(false);
    }
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
          Gestiona todos los candidatos: aplicaciones directas y CVs revelados con tokens
        </p>
        
        {/* Pestañas */}
        <Tabs defaultValue="aplicaciones" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="aplicaciones" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Aplicaciones Directas
              <Badge variant="outline" className="ml-2">{summary.totalStudents}</Badge>
            </TabsTrigger>
            <TabsTrigger value="revelados" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              CVs Revelados
              <Badge variant="outline" className="ml-2">{revealedSummary.totalRevealed}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Contenido de Aplicaciones Directas */}
          <TabsContent value="aplicaciones" className="space-y-6">
            {/* Estadísticas de aplicaciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6">
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

            {/* Lista de candidatos con aplicaciones */}
            <div className="grid gap-6">
              {loading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No se encontraron candidatos</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay estudiantes que hayan aplicado a tus ofertas'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredStudents.map((studentData) => {
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
                                <p className="text-gray-600">•••••••••••@•••••••••••</p>
                                <p className="text-gray-500 text-sm">•••••••••••</p>
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
                            
                            {/* 🔥 NUEVOS BOTONES DE GESTIÓN */}
                            <div className="border-t pt-2 mt-2">
                              <div className="text-xs text-gray-500 mb-2">Gestionar candidato:</div>
                              
                              <Button
                                size="sm"
                                onClick={() => handleAcceptCandidate(student, studentData.applications)}
                                className="bg-green-600 hover:bg-green-700 text-white w-full mb-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aceptar
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => handleRequestInterview(student, studentData.applications)}
                                className="bg-purple-600 hover:bg-purple-700 text-white w-full mb-1"
                              >
                                <Calendar className="w-4 h-4 mr-1" />
                                Entrevista
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectCandidate(student, studentData.applications)}
                                className="w-full"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* 🔥 NUEVO CONTENIDO DE CVs REVELADOS */}
          <TabsContent value="revelados" className="space-y-6">
            {/* Estadísticas de CVs revelados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">CVs revelados</p>
                      <p className="text-2xl font-bold text-purple-600">{revealedSummary.totalRevealed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tokens gastados</p>
                      <p className="text-2xl font-bold text-orange-600">{revealedSummary.totalTokensSpent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Promedio por CV</p>
                      <p className="text-2xl font-bold text-yellow-600">{revealedSummary.averageTokensPerReveal}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800 font-medium">
                  Candidatos inteligentes: Encontrados con IA y revelados usando tokens
                </span>
              </div>
            </div>

            {/* Lista de CVs revelados */}
            <div className="grid gap-6">
              {loadingRevealed ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
                </div>
              ) : revealedStudents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No hay CVs revelados</h3>
                    <p className="text-gray-600 mb-4">
                      Aún no has revelado ningún CV usando tokens. 
                      Usa el buscador inteligente para encontrar candidatos ideales.
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = '/empresa/buscador-inteligente'}>
                      <Brain className="w-4 h-4 mr-2" />
                      Buscar Candidatos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                revealedStudents.map((revealedData) => {
                  const student = revealedData.student;

                  return (
                    <Card key={revealedData.id} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Información básica del estudiante */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {student.User.name?.charAt(0) || 'N'}{student.User.surname?.charAt(0) || 'A'}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold">{student.User.name} {student.User.surname}</h3>
                                <p className="text-gray-600">•••••••••••@•••••••••••</p>
                                <p className="text-gray-500 text-sm">•••••••••••</p>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  <Brain className="w-3 h-3 mr-1" />
                                  Candidato IA
                                </Badge>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                  {revealedData.tokensUsed} tokens
                                </Badge>
                              </div>
                            </div>

                            {/* Información de revelación */}
                            <div className="bg-purple-50 p-3 rounded-lg mb-4">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-purple-600" />
                                  <span className="text-purple-800">
                                    Revelado: {new Date(revealedData.revealedAt).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-4 h-4 text-orange-600" />
                                  <span className="text-orange-800">
                                    {revealedData.tokensUsed} tokens gastados
                                  </span>
                                </div>
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

                          {/* Botones de acción para CVs revelados */}
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCV(student)}
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver CV (Ya revelado)
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleContactStudent(student, [])} // Sin aplicaciones
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Contactar Candidato
                            </Button>

                            {/* Nota: Los CVs revelados no tienen aplicaciones, pero podrías agregar funcionalidad para invitarlos a aplicar */}
                            <div className="border-t pt-2 mt-2">
                              <div className="text-xs text-gray-500 mb-2">Acciones especiales:</div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Funcionalidad para invitar a aplicar a una oferta específica
                                  alert('Funcionalidad de invitar a aplicar próximamente');
                                }}
                                className="w-full text-xs"
                              >
                                Invitar a Aplicar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MANTENER TODOS LOS MODALES EXISTENTES */}
      {/* Modal CV, Modal Contactar, Modal Aceptar, Modal Entrevista, Modal Rechazar */}
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
                    <p className="font-medium">{selectedStudent.cvData?.student?.User?.name || selectedStudent.User?.name} {selectedStudent.cvData?.student?.User?.surname || selectedStudent.User?.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudent.cvData?.student?.User?.email || selectedStudent.User?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{selectedStudent.cvData?.student?.User?.phone || selectedStudent.User?.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehículo propio</p>
                    <p className="font-medium">{selectedStudent.cvData?.student?.car !== undefined ? (selectedStudent.cvData.student.car ? 'Sí' : 'No') : (selectedStudent.car ? 'Sí' : 'No')}</p>
                  </div>
                </div>
              </div>

              {/* Formación académica */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                {selectedStudent.cvData?.student?.academicInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Centro de Estudios</p>
                      <p className="font-medium">{selectedStudent.cvData.student.academicInfo.scenter?.name || 'No especificado'}</p>
                      {selectedStudent.cvData.student.academicInfo.scenter?.code && (
                        <p className="text-xs text-gray-500">Código: {selectedStudent.cvData.student.academicInfo.scenter.code}</p>
                      )}
                      {selectedStudent.cvData.student.academicInfo.scenter?.city && (
                        <p className="text-xs text-gray-500">Ciudad: {selectedStudent.cvData.student.academicInfo.scenter.city}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-gray-600">Familia Profesional</p>
                        {/* 🔥 INDICADORES DE COINCIDENCIA CON OFERTA - AQUÍ NO HAY OFERTA ESPECÍFICA */}
                        <Badge className="bg-gray-100 text-gray-800 text-xs">
                          Información académica
                        </Badge>
                      </div>
                      <p className="font-medium">{selectedStudent.cvData.student.academicInfo.profamily?.name || 'No especificado'}</p>
                      {selectedStudent.cvData.student.academicInfo.profamily?.description && (
                        <p className="text-xs text-gray-500">{selectedStudent.cvData.student.academicInfo.profamily.description}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Estado Académico</p>
                      <p className="font-medium">{selectedStudent.cvData.student.academicInfo.status || 'No especificado'}</p>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              {/* Habilidades */}
              {selectedStudent.cvData?.student?.skills && selectedStudent.cvData.student.skills.length > 0 ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <div className="grid gap-3">
                    {selectedStudent.cvData.student.skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <Badge variant="outline" className={
                                skill.proficiencyLevel === 'alto' ? 'bg-green-50 text-green-700 border-green-300' :
                                skill.proficiencyLevel === 'medio' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                'bg-red-50 text-red-700 border-red-300'
                              }>
                                {skill.proficiencyLevel === 'alto' ? 'Avanzado' :
                                 skill.proficiencyLevel === 'medio' ? 'Intermedio' : 'Básico'}
                              </Badge>
                              {skill.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {skill.category}
                                </Badge>
                              )}
                            </div>
                            {skill.yearsOfExperience && skill.yearsOfExperience > 0 && (
                              <p className="text-sm text-gray-600">
                                {skill.yearsOfExperience} año{skill.yearsOfExperience !== 1 ? 's' : ''} de experiencia
                              </p>
                            )}
                            {skill.notes && (
                              <p className="text-sm text-gray-700 mt-1 italic">"{skill.notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedStudent.tag ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.tag.split(',').map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Descripción */}
              {selectedStudent.cvData?.cv?.description || selectedStudent.cvData?.student?.description || selectedStudent.description ? (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Descripción Personal</h3>
                  <p className="text-gray-700">
                    {selectedStudent.cvData?.cv?.description || 
                     selectedStudent.cvData?.student?.description || 
                     selectedStudent.description}
                  </p>
                </div>
              ) : null}

              {/* Información de acceso */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Acceso Completo Gratuito</h4>
                </div>
                <p className="text-sm text-green-700">
                  Este estudiante aplicó a tus ofertas, por lo que puedes ver su CV completo y contactarlo sin costo adicional.
                </p>
                {selectedStudent.cvData?.access && (
                  <div className="mt-2 text-xs text-green-600">
                    <p>Tipo de acceso: {selectedStudent.cvData.access.type}</p>
                    {selectedStudent.cvData.access.tokensUsed > 0 && (
                      <p>Tokens utilizados: {selectedStudent.cvData.access.tokensUsed}</p>
                    )}
                  </div>
                )}
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
                <span className="text-sm text-green-800 font-medium">Contacto gratuito</span>
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

      {/* Modal para aceptar candidato */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Aceptar Candidato: {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Candidato:</strong> {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
              </p>
              <p className="text-sm text-green-800">
                <strong>Aplicaciones a aceptar:</strong> {selectedCandidateApplications.length}
              </p>
              <div className="mt-2">
                {selectedCandidateApplications.map(app => (
                  <div key={app.id} className="text-sm text-green-700">
                    • {app.offer.name} ({app.offer.location})
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje de aceptación
              </label>
              <textarea
                value={acceptForm.message}
                onChange={(e) => setAcceptForm(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleConfirmAccept}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Aceptación
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAcceptModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para solicitar entrevista */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Solicitar Entrevista: {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Candidato:</strong> {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
              </p>
              <p className="text-sm text-purple-800">
                <strong>Aplicaciones:</strong> {selectedCandidateApplications.length}
              </p>
              <div className="mt-2">
                {selectedCandidateApplications.map(app => (
                  <div key={app.id} className="text-sm text-purple-700">
                    • {app.offer.name} ({app.offer.location})
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="presencial">Presencial</option>
                <option value="online">Online (videollamada)</option>
                <option value="telefonica">Telefónica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación / Enlace
              </label>
              {interviewForm.type === 'online' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Video className="w-4 h-4" />
                    <span className="text-sm font-medium">Enlace automático de Google Meet</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Se generará automáticamente un enlace único de Google Meet para esta entrevista
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  value={interviewForm.location}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={
                    interviewForm.type === 'presencial' ? 'Dirección de la oficina' :
                    interviewForm.type === 'telefonica' ? 'Número de teléfono' :
                    'Ubicación o enlace'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleConfirmInterview}
                disabled={!interviewForm.date || !interviewForm.time || (interviewForm.type !== 'online' && !interviewForm.location)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Programar Entrevista
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInterviewModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para rechazar candidato */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Rechazar Candidato: {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Candidato:</strong> {selectedStudent?.User?.name} {selectedStudent?.User?.surname}
              </p>
              <p className="text-sm text-red-800">
                <strong>Aplicaciones a rechazar:</strong> {selectedCandidateApplications.length}
              </p>
              <div className="mt-2">
                {selectedCandidateApplications.map(app => (
                  <div key={app.id} className="text-sm text-red-700">
                    • {app.offer.name} ({app.offer.location})
                  </div>
                ))}
              </div>
            </div>

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
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleConfirmReject}
                disabled={!rejectForm.reason}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Confirmar Rechazo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔥 MODAL DE CONFIRMACIÓN DE ENTREVISTA */}
      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirmar Entrevista Programada
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Detalles de la Entrevista</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Candidato:</span>
                  <span className="font-medium text-green-800">{generatedInterviewDetails?.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Fecha:</span>
                  <span className="font-medium text-green-800">{generatedInterviewDetails?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Hora:</span>
                  <span className="font-medium text-green-800">{generatedInterviewDetails?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Tipo:</span>
                  <span className="font-medium text-green-800">
                    {generatedInterviewDetails?.type === 'presencial' ? 'Presencial' :
                     generatedInterviewDetails?.type === 'online' ? 'Online (Google Meet)' :
                     'Telefónica'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Ubicación/Enlace:</span>
                  <span className="font-medium text-green-800 break-all">
                    {generatedInterviewDetails?.generatedLink ? (
                      <span className="text-blue-600 underline">{generatedInterviewDetails.generatedLink}</span>
                    ) : (
                      generatedInterviewDetails?.location
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Aplicaciones:</span>
                  <span className="font-medium text-green-800">{generatedInterviewDetails?.applicationsCount}</span>
                </div>
              </div>
            </div>

            {generatedInterviewDetails?.generatedLink && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Enlace de Google Meet Generado</h4>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  Se ha generado automáticamente un enlace único de Google Meet para esta entrevista.
                </p>
                <div className="bg-white p-2 rounded border text-xs font-mono text-blue-800 break-all">
                  {generatedInterviewDetails.generatedLink}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Este enlace será enviado al candidato junto con los detalles de la entrevista.
                </p>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Confirmación</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Al confirmar, se programará la entrevista y se notificará al candidato con todos estos detalles.
                ¿Deseas continuar?
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleFinalConfirmInterview}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar y Programar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirmationModal(false)}
              >
                Revisar Detalles
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
