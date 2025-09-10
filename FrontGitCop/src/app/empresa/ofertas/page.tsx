'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Mail, 
  Plus, 
  Users, 
  MapPin, 
  Clock, 
  Car,
  Star,
  Target,
  Brain,
  Search,
  ChevronRight,
  TrendingUp,
  CheckCircle,    // 🔥 AGREGAR
  Calendar,       // 🔥 AGREGAR
  XCircle         // 🔥 AGREGAR
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';

interface Candidate {
  id: number;
  status: string;
  appliedAt: string;
  message: string;
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
    profamily: {
      id: number;
      name: string;
    } | null;
  };
  affinity: {
    level: string;
    score: number;
    matches: number;
    coverage: number;
    explanation: string;
  };
}

interface Offer {
  id: number;
  name: string;
  location: string;
  mode: string;
  type: string;
  description: string;
  tag: string;
  createdAt: string;
  candidates: Candidate[];
  candidateStats: {
    total: number;
    byAffinity: {
      'muy alto': number;
      'alto': number;
      'medio': number;
      'bajo': number;
      'sin datos': number;
    };
  };
  offerSkills: {[key: string]: number};
}

function CompanyOffersContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showBetterCandidatesModal, setBetterCandidatesModal] = useState(false);
  const [betterCandidates, setBetterCandidates] = useState<any[]>([]);
  const [loadingBetterCandidates, setLoadingBetterCandidates] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<any>(null);
  const [cvData, setCvData] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  const [actionType, setActionType] = useState<'free' | 'paid'>('free');
  const [revealedCVs, setRevealedCVs] = useState<number[]>([]);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [acceptForm, setAcceptForm] = useState({ message: '' });
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    location: '',
    type: 'presencial',
    notes: ''
  });
  const [rejectForm, setRejectForm] = useState({
    reason: '',
    message: ''
  });
  const { token } = useAuthStore(); // 🔥 VERIFICAR QUE ESTÉ PRESENTE

  // Debug del token
  useEffect(() => {
    console.log('🔍 Token disponible:', !!token);
    console.log('🔍 Token value:', token ? 'EXISTS' : 'NULL');
  }, [token]);

  // Cargar ofertas con candidatos
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/offers/company-with-candidates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOffers(data);
          console.log('✅ Ofertas con candidatos cargadas:', data);
        }
      } catch (error) {
        console.error('❌ Error cargando ofertas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOffers();
    }
  }, [token]);

  // Cargar CVs revelados
  useEffect(() => {
    const fetchRevealedCVs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students/revealed-cvs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRevealedCVs(data.revealedStudentIds);
          console.log('✅ CVs revelados cargados:', data.revealedStudentIds);
        }
      } catch (error) {
        console.error('❌ Error cargando CVs revelados:', error);
      }
    };

    if (token) {
      fetchRevealedCVs();
    }
  }, [token]);

  const getAffinityColor = (level: string) => {
    switch (level) {
      case 'muy alto': return 'bg-green-100 text-green-800 border-green-300';
      case 'alto': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAffinityIcon = (level: string) => {
    switch (level) {
      case 'muy alto': return <Star className="w-4 h-4 text-green-600" />;
      case 'alto': return <Target className="w-4 h-4 text-blue-600" />;
      case 'medio': return <Brain className="w-4 h-4 text-yellow-600" />;
      default: return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleViewCandidates = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowCandidatesModal(true);
  };

  const handleSearchBetterCandidates = async (offer: Offer) => {
    setSelectedOffer(offer);
    setLoadingBetterCandidates(true);
    setBetterCandidatesModal(true);

    try {
      // Buscar mejores candidatos usando el algoritmo
      const response = await fetch('http://localhost:5000/api/students/search-intelligent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: offer.offerSkills,
          filters: {
            minAffinity: 'medio' // Solo candidatos con afinidad media o superior
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBetterCandidates(data.students);
        console.log('🔍 Mejores candidatos encontrados:', data.students.length);
      }
    } catch (error) {
      console.error('❌ Error buscando mejores candidatos:', error);
    } finally {
      setLoadingBetterCandidates(false);
    }
  };

  // 🔥 VER CV GRATUITO para candidatos que aplicaron
  const handleViewCVFree = async (student: any) => {
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
        throw new Error('Error al obtener el CV');
      }

      const cvData = await response.json();
      console.log('✅ CV obtenido gratuitamente:', cvData);
      
      // Mostrar modal elegante en lugar de alert
      setSelectedStudentForAction(student);
      setCvData(cvData);
      setActionType('free');
      setShowCVModal(true);
      
    } catch (error) {
      console.error('❌ Error obteniendo CV:', error);
      alert('Error al obtener el CV del estudiante');
    }
  };

  // 🔥 CONTACTAR GRATUITO para candidatos que aplicaron
  const handleContactFree = (student: any, offerName: string) => {
    // Mostrar modal elegante en lugar de alert
    setSelectedStudentForAction(student);
    setActionType('free');
    setContactForm({
      subject: `Interés en tu aplicación - ${offerName}`,
      message: `Estimado/a ${student.User.name},\n\nHemos revisado tu aplicación para la oferta "${offerName}" y nos gustaría conocerte mejor.\n\n¿Estarías disponible para una entrevista?\n\nSaludos cordiales.`
    });
    setShowContactModal(true);
  };

  // REEMPLAZAR la función handleViewCVWithTokens:

  const handleViewCVWithTokens = async (studentId: number) => {
    try {
      console.log('📄 Ver CV con tokens para estudiante:', studentId);
      
      const isAlreadyRevealed = revealedCVs.includes(studentId);
      
      if (isAlreadyRevealed) {
        console.log('✅ CV ya revelado previamente - Acceso gratuito');
      }
      
      const response = await fetch(`http://localhost:5000/api/students/${studentId}/view-cv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromIntelligentSearch: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'INSUFFICIENT_TOKENS') {
          alert(`❌ Tokens insuficientes.\nNecesitas ${errorData.required} tokens para ver este CV.\n\n¿Quieres recargar tokens?`);
          // 🔥 OPCIONAL: Redirigir a página de tokens
          // window.open('/empresa/tokens', '_blank');
          return;
        }
        throw new Error('Error al obtener el CV');
      }

      const cvData = await response.json();
      console.log('✅ CV obtenido:', cvData);
      
      // 🔥 ACTUALIZAR INMEDIATAMENTE EL STATE DE CVs REVELADOS
      if (!isAlreadyRevealed && !cvData.wasAlreadyRevealed) {
        setRevealedCVs(prev => [...prev, studentId]);
        console.log(`💾 CV del estudiante ${studentId} marcado como revelado`);
      }
      
      const student = betterCandidates.find(s => s.id === studentId);
      setSelectedStudentForAction(student);
      setCvData(cvData);
      setActionType('paid');
      setShowCVModal(true);
      
    } catch (error) {
      console.error('❌ Error obteniendo CV:', error);
      alert('Error al obtener el CV del estudiante');
    }
  };

  const handleContactWithTokens = (studentId: number) => {
    const student = betterCandidates.find(s => s.id === studentId);
    setSelectedStudentForAction(student);
    setActionType('paid');
    setContactForm({
      subject: `Interés en tu perfil - ${selectedOffer?.name}`,
      message: `Estimado/a ${student?.User?.name},\n\nHemos encontrado tu perfil y nos interesa conocerte para la oferta "${selectedOffer?.name}".\n\n¿Te gustaría conocer más sobre esta oportunidad?\n\nSaludos cordiales.`
    });
    setShowContactModal(true);
  };

  const handleSendContact = async () => {
    if (!selectedStudentForAction) return;

    try {
      const response = await fetch(`http://localhost:5000/api/students/${selectedStudentForAction.id}/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromIntelligentSearch: actionType === 'paid',
          subject: contactForm.subject,
          message: contactForm.message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === 'INSUFFICIENT_TOKENS') {
          alert(`❌ Tokens insuficientes.\nNecesitas ${errorData.required} tokens para contactar.`);
          return;
        }
        throw new Error('Error al contactar el estudiante');
      }

      const result = await response.json();
      console.log('✅ Contacto registrado:', result);

      // Abrir cliente de email
      const emailBody = encodeURIComponent(contactForm.message);
      const emailSubject = encodeURIComponent(contactForm.subject);
      const emailUrl = `mailto:${selectedStudentForAction.User.email}?subject=${emailSubject}&body=${emailBody}`;
      
      window.open(emailUrl);
      
      // Cerrar modal
      setShowContactModal(false);
      setContactForm({ subject: '', message: '' });
      
    } catch (error) {
      console.error('❌ Error contactando estudiante:', error);
      alert('Error al contactar el estudiante');
    }
  };

  const handleAcceptApplication = async (candidate: Candidate) => {
    console.log('✅ Aceptar candidato:', candidate.id);
    setSelectedStudentForAction(candidate);
    setAcceptForm({
      message: `¡Felicidades ${candidate.student.User.name}! Hemos decidido aceptar tu candidatura para la oferta: ${selectedOffer?.name}.\n\nNos pondremos en contacto contigo pronto para coordinar los próximos pasos.\n\n¡Bienvenido/a al equipo!`
    });
    setShowAcceptModal(true);
  };

  // REEMPLAZAR la función handleRequestInterviewSingle:

  const handleRequestInterviewSingle = async (candidate: Candidate) => {
    console.log('📅 Solicitar entrevista para candidato:', candidate.id);
    setSelectedStudentForAction(candidate);
    setInterviewForm({
      date: '',
      time: '',
      location: '',
      type: 'presencial',
      notes: `Entrevista para la oferta: ${selectedOffer?.name}`
    });
    setShowInterviewModal(true);
  };

  const handleRejectApplication = async (candidate: Candidate) => {
    console.log('❌ Rechazar candidato:', candidate.id);
    setSelectedStudentForAction(candidate);
    setRejectForm({
      reason: '',
      message: `Estimado/a ${candidate.student.User.name},\n\nTe agradecemos el interés mostrado en nuestra oferta "${selectedOffer?.name}".\n\nEn esta ocasión hemos decidido continuar con otros candidatos.\n\nSaludos cordiales.`
    });
    setShowRejectModal(true);
  };

  // 🔥 AGREGAR estas funciones de confirmación:

  const handleConfirmAccept = async () => {
    if (!selectedStudentForAction) return;

    try {
      console.log('✅ Confirmando aceptación para aplicación:', selectedStudentForAction.id);
      
      const response = await fetch(`http://localhost:5000/api/applications/${selectedStudentForAction.id}/status`, {
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
        throw new Error('Error al aceptar la aplicación');
      }

      alert('✅ Candidato aceptado exitosamente');
      
      // Cerrar modal y recargar
      setShowAcceptModal(false);
      setShowCandidatesModal(false);
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error aceptando candidato:', error);
      alert('Error al aceptar el candidato');
    } finally {
      setAcceptForm({ message: '' });
    }
  };

  const handleConfirmInterview = async () => {
    if (!selectedStudentForAction) return;

    try {
      console.log('📅 Confirmando entrevista para aplicación:', selectedStudentForAction.id);
      
      const response = await fetch(`http://localhost:5000/api/applications/${selectedStudentForAction.id}/interview`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewDetails: {
            date: interviewForm.date,
            time: interviewForm.time,
            location: interviewForm.location,
            type: interviewForm.type,
            notes: interviewForm.notes
          },
          companyNotes: `Entrevista programada para ${interviewForm.date} a las ${interviewForm.time}`
        })
      });

      if (!response.ok) {
        throw new Error('Error al programar entrevista');
      }

      alert('📅 Entrevista programada exitosamente');
      
      // Cerrar modal y recargar
      setShowInterviewModal(false);
      setShowCandidatesModal(false);
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error programando entrevista:', error);
      alert('Error al programar la entrevista');
    } finally {
      setInterviewForm({
        date: '',
        time: '',
        location: '',
        type: 'presencial',
        notes: ''
      });
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedStudentForAction) return;

    try {
      console.log('❌ Confirmando rechazo para aplicación:', selectedStudentForAction.id);
      
      const response = await fetch(`http://localhost:5000/api/applications/${selectedStudentForAction.id}/status`, {
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
        throw new Error('Error al rechazar aplicación');
      }

      alert('❌ Candidato rechazado');
      
      // Cerrar modal y recargar
      setShowRejectModal(false);
      setShowCandidatesModal(false);
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error rechazando candidato:', error);
      alert('Error al rechazar el candidato');
    } finally {
      setRejectForm({ reason: '', message: '' });
    }
  };

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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ofertas</h1>
        <p className="text-gray-600">Gestiona tus ofertas y revisa candidatos con valoración inteligente</p>
      </div>

      {/* Lista de ofertas */}
      <div className="grid gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header de la oferta */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">{offer.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {offer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {offer.mode}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {offer.candidateStats.total} candidatos
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{offer.description}</p>
                  </div>

                  {/* Estadísticas de candidatos */}
                  {offer.candidateStats.total > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Candidatos por Afinidad:</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(offer.candidateStats.byAffinity).map(([level, count]) => (
                          <div key={level} className="text-center">
                            <div className={`p-2 rounded-lg ${getAffinityColor(level)}`}>
                              <div className="font-bold">{count}</div>
                              <div className="text-xs capitalize">{level.replace('_', ' ')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills de la oferta */}
                  {offer.tag && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Habilidades requeridas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {offer.tag.split(',').map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">{tag.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col gap-2 ml-4">
                  {offer.candidateStats.total > 0 ? (
                    <>
                      <Button
                        onClick={() => handleViewCandidates(offer)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Ver Candidatos ({offer.candidateStats.total})
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSearchBetterCandidates(offer)}
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Mejores
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleSearchBetterCandidates(offer)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Buscar Candidatos
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {offers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes ofertas publicadas</h3>
            <p className="text-gray-600 mb-4">Crea tu primera oferta para empezar a recibir candidatos</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Oferta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de candidatos actuales */}
      <Dialog open={showCandidatesModal} onOpenChange={setShowCandidatesModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidatos para: {selectedOffer?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              {selectedOffer.candidates.map((candidate) => (
                <Card key={candidate.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {/* 🔥 CORRECCIÓN: Verificar que User existe */}
                            {candidate.student?.User?.name?.charAt(0) || 'N'}{candidate.student?.User?.surname?.charAt(0) || 'A'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {candidate.student?.User?.name || 'Nombre no disponible'} {candidate.student?.User?.surname || ''}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {candidate.student?.User?.email || 'Email no disponible'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getAffinityIcon(candidate.affinity?.level || 'bajo')}
                            <Badge className={getAffinityColor(candidate.affinity?.level || 'bajo')}>
                              {(candidate.affinity?.level || 'bajo').toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-blue-800">
                            {candidate.affinity?.explanation || 'Sin información de afinidad'}
                          </p>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-600 mb-3">
                          <span>
                            {candidate.student?.grade || 'Grado no especificado'} - {candidate.student?.course || 'Curso no especificado'}
                          </span>
                          <span>{candidate.student?.car ? 'Con vehículo' : 'Sin vehículo'}</span>
                        </div>

                        {candidate.message && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm italic">"{candidate.message}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCVFree(candidate.student)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver CV (Gratis)
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleContactFree(candidate.student, selectedOffer?.name || 'esta oferta')}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Contactar (Gratis)
                        </Button>
                        
                        {/* 🔥 NUEVOS BOTONES DE GESTIÓN */}
                        <div className="border-t pt-2 mt-2">
                          <div className="text-xs text-gray-500 mb-2">Gestionar:</div>
                          
                          <Button
                            size="sm"
                            onClick={() => handleAcceptApplication(candidate)}
                            className="bg-green-600 hover:bg-green-700 text-white w-full mb-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aceptar
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => handleRequestInterviewSingle(candidate)}
                            className="bg-purple-600 hover:bg-purple-700 text-white w-full mb-1"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Entrevista
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectApplication(candidate)}
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
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de mejores candidatos */}
      <Dialog open={showBetterCandidatesModal} onOpenChange={setBetterCandidatesModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Mejores Candidatos para: {selectedOffer?.name}
            </DialogTitle>
          </DialogHeader>
          
          {loadingBetterCandidates ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-purple-800">
                  💡 <strong>Candidatos inteligentes:</strong> Estos estudiantes no han aplicado aún, pero tienen alta afinidad con tu oferta.
                  Para ver CV completo o contactarlos necesitas tokens.
                </p>
              </div>

              {betterCandidates.map((student) => (
                <Card key={student.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {/* 🔥 CORRECCIÓN: Verificar que User existe antes de acceder a name */}
                            {student.User?.name?.charAt(0) || 'N'}{student.User?.surname?.charAt(0) || 'A'}
                          </div>
                          <div className="flex-1">
                            {/* 🔥 CORRECCIÓN: Verificar que User existe */}
                            <h4 className="font-semibold">
                              {student.User?.name || 'Nombre no disponible'} {student.User?.surname || ''}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {student.User?.email || 'Email no disponible'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                              Candidato Inteligente
                            </Badge>
                            {getAffinityIcon(student.affinity?.level || 'bajo')}
                            <Badge className={getAffinityColor(student.affinity?.level || 'bajo')}>
                              {(student.affinity?.level || 'bajo').toUpperCase()
                            }</Badge>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-purple-800">
                            {student.affinity?.explanation || 'Sin información de afinidad'}
                          </p>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{student.grade || 'Grado no especificado'} - {student.course || 'Curso no especificado'}</span>
                          <span>{student.car ? 'Con vehículo' : 'Sin vehículo'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewCVWithTokens(student.id)}
                          className={revealedCVs.includes(student.id) ? 'bg-green-50 border-green-300 text-green-700' : 'bg-purple-50 border-purple-300 text-purple-700'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {revealedCVs.includes(student.id) ? 'CV Revelado' : 'Revelar Perfil (2 tokens)'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {betterCandidates.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron mejores candidatos</h3>
                  <p className="text-gray-600">
                    No hay estudiantes disponibles con mayor afinidad a esta oferta.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal CV Elegante */}
      <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              CV de {selectedStudentForAction?.User?.name} {selectedStudentForAction?.User?.surname}
              <Badge className={actionType === 'free' ? 'bg-green-100 text-green-800 ml-2' : 'bg-purple-100 text-purple-800 ml-2'}>
                {actionType === 'free' ? 'Acceso Gratuito' : 'Con Tokens'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudentForAction && cvData && (
            <div className="space-y-6">
              {/* Información personal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Información Personal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="font-medium">{selectedStudentForAction.User.name} {selectedStudentForAction.User.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedStudentForAction.User.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{selectedStudentForAction.User.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehículo propio</p>
                    <p className="font-medium">{selectedStudentForAction.car ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Formación académica */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Grado</p>
                    <p className="font-medium">{selectedStudentForAction.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Curso</p>
                    <p className="font-medium">{selectedStudentForAction.course}</p>
                  </div>
                </div>
              </div>

              {/* Habilidades */}
              {selectedStudentForAction.tag && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudentForAction.tag.split(',').map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de acceso */}
              <div className={`p-4 rounded-lg border ${actionType === 'free' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-semibold ${actionType === 'free' ? 'text-green-800' : 'text-purple-800'}`}>
                    {actionType === 'free' ? 'Acceso Completo Gratuito' : 'Candidato Inteligente - 2 Tokens'}
                  </h4>
                </div>
                <p className="text-sm text-gray-700">
                  {actionType === 'free' 
                    ? 'Este estudiante aplicó a tu oferta, por lo que puedes ver su CV completo sin costo adicional.'
                    : 'Este candidato fue encontrado por nuestro algoritmo de IA y tiene alta afinidad con tu oferta.'
                  }
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setShowCVModal(false);
                    if (actionType === 'free') {
                      handleContactFree(selectedStudentForAction, selectedOffer?.name || 'la oferta');
                    } else {
                      handleContactWithTokens(selectedStudentForAction.id);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar {actionType === 'paid' ? '(Incluido)' : '(Gratis)'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCVModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Contacto Elegante */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contactar a {selectedStudentForAction?.User?.name} {selectedStudentForAction?.User?.surname}
              <Badge className="bg-green-100 text-green-800 ml-2">
                {actionType === 'free' ? 'Gratuito' : 'Sin Costo Adicional'}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Formulario de contacto */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto del mensaje
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSendContact}
                className="bg-green-600 hover:bg-green-700"
                disabled={!contactForm.subject.trim() || !contactForm.message.trim()}
              >
                <Mail className="w-4 h-4 mr-2" />
                {actionType === 'free' ? 'Enviar (Gratis)' : 'Enviar (Incluido)'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowContactModal(false)}
              >
                Cancelar
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
              Aceptar Candidato: {selectedStudentForAction?.student?.User?.name} {selectedStudentForAction?.student?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Candidato:</strong> {selectedStudentForAction?.student?.User?.name} {selectedStudentForAction?.student?.User?.surname}
              </p>
              <p className="text-sm text-green-800">
                <strong>Oferta:</strong> {selectedOffer?.name}
              </p>
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
              Solicitar Entrevista: {selectedStudentForAction?.student?.User?.name} {selectedStudentForAction?.student?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Candidato:</strong> {selectedStudentForAction?.student?.User?.name} {selectedStudentForAction?.student?.User?.surname}
              </p>
              <p className="text-sm text-purple-800">
                <strong>Oferta:</strong> {selectedOffer?.name}
              </p>
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
              <input
                type="text"
                value={interviewForm.location}
                onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder={
                  interviewForm.type === 'presencial' ? 'Dirección de la oficina' :
                  interviewForm.type === 'online' ? 'Enlace de videollamada' :
                  'Número de teléfono'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
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
                disabled={!interviewForm.date || !interviewForm.time || !interviewForm.location}
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
              Rechazar Candidato: {selectedStudentForAction?.student?.User?.name} {selectedStudentForAction?.student?.User?.surname}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Candidato:</strong> {selectedStudentForAction?.student?.User?.name} {selectedStudentForAction?.student?.User?.surname}
              </p>
              <p className="text-sm text-red-800">
                <strong>Oferta:</strong> {selectedOffer?.name}
              </p>
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
    </div>
  );
}
// 🔥 AGREGAR ESTA EXPORTACIÓN AL FINAL:
export default function CompanyOffersPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <CompanyOffersContent />
    </AuthGuard>
  );
}