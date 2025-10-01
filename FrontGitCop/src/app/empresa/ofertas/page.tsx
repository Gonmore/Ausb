'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle,
  Calendar,
  XCircle,
  Loader2,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth-guard';
import { useOffers } from '@/hooks/useOffers';
import { useRevealedCVs } from '@/hooks/useRevealedCVs';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import LoadingStats from '@/components/ui/LoadingStats';
import { useToast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';

// 🚀 OPTIMIZACIÓN: Componente memoizado para cada oferta
const OfferCard = memo(({ 
  offer, 
  onViewCandidates, 
  onSearchBetter, 
  onDelete, 
  onEdit,
  getAffinityColor,
  isDeleting = false
}: {
  offer: any;
  onViewCandidates: (offer: any) => void;
  onSearchBetter: (offer: any) => void;
  onDelete: (offerId: number) => Promise<void>;
  onEdit: (offerId: number) => void;
  getAffinityColor: (level: string) => string;
  isDeleting?: boolean;
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
                  {offer.candidateStats?.total || 0} candidatos
                </div>
              </div>
              <p className="text-gray-700 text-sm">{offer.description}</p>
            </div>

            {/* Estadísticas de candidatos */}
            {(offer.candidateStats?.total || 0) > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Candidatos por Afinidad:</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(offer.candidateStats?.byAffinity || {}).map(([level, count]) => (
                    <div key={level} className="text-center">
                      <div className={`p-2 rounded-lg ${getAffinityColor(level)}`}>
                        <div className="font-bold">{count as number}</div>
                        <div className="text-xs capitalize">{level.replace('_', ' ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills de la oferta */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Habilidades requeridas:</h4>
              <div className="flex flex-wrap gap-2">
                {(offer.skills && offer.skills.length > 0)
                  ? offer.skills.map((skill: any, index: number) => (
                      <Badge key={index} variant="outline">{skill.name}</Badge>
                    ))
                  : <span className="text-gray-400">Sin skills asignados</span>
                }
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-3 ml-4">
            {/* Botones principales */}
            <div className="flex flex-col gap-2">
              {(offer.candidateStats?.total || 0) > 0 ? (
                <>
                  <Button
                    onClick={() => onViewCandidates(offer)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ver Candidatos ({offer.candidateStats?.total || 0})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onSearchBetter(offer)}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Mejores
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onSearchBetter(offer)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Candidatos
                </Button>
              )}
            </div>
            
            {/* Separador visual */}
            <div className="border-t border-gray-200"></div>
            
            {/* Botones de gestión */}
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 h-8 w-8"
                onClick={() => onEdit(offer.id)}
                title="Editar oferta"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8"
                onClick={() => onDelete(offer.id)}
                disabled={isDeleting}
                title="Eliminar oferta"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OfferCard.displayName = 'OfferCard';

// 🚀 OPTIMIZACIÓN: Componente de loading memoizado
const LoadingSpinner = memo(() => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 text-lg">Cargando ofertas...</p>
      </div>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

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
  skills?: { id: number; name: string }[];
  profamily?: {
    id: number;
    name: string;
    description?: string;
  };
  profamilys?: {
    id: number;
    name: string;
    description?: string;
  }[];
}

function CompanyOffersContent() {
  const router = useRouter();
  const { token } = useAuthStore();
  
  // 🚀 OPTIMIZACIÓN: Usar hooks customizados
  const { offers, loading, error, deleteOffer } = useOffers();
  const { revealedCVs, addRevealedCV, isRevealed } = useRevealedCVs();
  const queryClient = useQueryClient();
  
  // 🎯 UX: Sistema de toasts mejorado
  const { addToast, success, error: showError, warning, info } = useToast();
  
  // Estados para modales y formularios
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
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [generatedInterviewDetails, setGeneratedInterviewDetails] = useState<any>(null);
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

  // 🎯 UX: Estados de loading para acciones específicas
  const [loadingStates, setLoadingStates] = useState({
    viewingCV: false,
    contacting: false,
    accepting: false,
    interviewing: false,
    rejecting: false,
    deletingOffer: null as number | null
  });

  // 🎯 UX: Estados de confirmación
  const [confirmations, setConfirmations] = useState({
    deleteOffer: { isOpen: false, offerId: null as number | null },
    acceptCandidate: { isOpen: false },
    rejectCandidate: { isOpen: false },
    scheduleInterview: { isOpen: false }
  });

  // 🎯 UX MEJORADA: Funciones para resaltar coincidencias con la oferta
  const getMatchingSkills = useCallback((studentSkills: any[], offerSkills: any) => {
    if (!studentSkills || !offerSkills) return [];
    
    const offerSkillNames = Object.keys(offerSkills).map(name => name.toLowerCase().trim());
    return studentSkills.filter(skill => 
      offerSkillNames.includes(skill.name.toLowerCase().trim())
    );
  }, []);

  const isMatchingProFamily = useCallback((studentProFamily: any, offerProfamilies: any) => {
    if (!studentProFamily || !offerProfamilies) return false;
    
    // Handle both single profamily and array of profamilies
    const profamilyArray = Array.isArray(offerProfamilies) ? offerProfamilies : [offerProfamilies];
    
    return profamilyArray.some((profamily: any) => 
      studentProFamily.id === profamily.id || 
      studentProFamily.name?.toLowerCase().trim() === profamily.name?.toLowerCase().trim()
    );
  }, []);

  const isSimilarProFamily = useCallback((studentProFamily: any, offerProfamilies: any) => {
    if (!studentProFamily || !offerProfamilies) return false;
    
    // Handle both single profamily and array of profamilies
    const profamilyArray = Array.isArray(offerProfamilies) ? offerProfamilies : [offerProfamilies];
    
    // If already matching any profamily, not similar
    if (isMatchingProFamily(studentProFamily, offerProfamilies)) return false;
    
    // Check if similar to any profamily in the offer
    return profamilyArray.some((profamily: any) => {
      const studentDesc = studentProFamily.description?.toLowerCase() || '';
      const offerDesc = profamily.description?.toLowerCase() || '';
      
      // Palabras clave comunes que indican similitud
      const techKeywords = ['informática', 'tecnología', 'desarrollo', 'programación', 'software', 'it', 'computación'];
      const hasTechMatch = techKeywords.some(keyword => 
        studentDesc.includes(keyword) && offerDesc.includes(keyword)
      );
      
      return hasTechMatch;
    });
  }, [isMatchingProFamily]);

  const getAffinityIcon = useCallback((level: string) => {
    switch (level) {
      case 'muy alto': return <Star className="w-4 h-4 text-green-600" />;
      case 'alto': return <Target className="w-4 h-4 text-blue-600" />;
      case 'medio': return <Brain className="w-4 h-4 text-yellow-600" />;
      default: return <Brain className="w-4 h-4 text-gray-600" />;
    }
  }, []);

  // � OPTIMIZACIÓN: Memoizar funciones que no cambian
  const getAffinityColor = useCallback((level: string) => {
    switch (level) {
      case 'muy alto': return 'bg-green-100 text-green-800 border-green-300';
      case 'alto': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }, []);

  // 🚀 OPTIMIZACIÓN: Memoizar contadores calculados
  const offerStats = useMemo(() => {
    return offers.map(offer => ({
      ...offer,
      totalCandidates: offer.candidateStats?.total || 0,
      hasHighAffinityCandidates: (offer.candidateStats?.byAffinity?.['muy alto'] || 0) + 
                                   (offer.candidateStats?.byAffinity?.['alto'] || 0) > 0
    }));
  }, [offers]);

  // 🚀 OPTIMIZACIÓN: Funciones de UI memoizadas
  const handleViewCandidates = useCallback((offer: Offer) => {
    setSelectedOffer(offer);
    setShowCandidatesModal(true);
  }, []);

  const handleSearchBetterCandidates = useCallback(async (offer: Offer) => {
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
      } else {
        console.error('❌ Error buscando candidatos:', response.status);
      }
    } catch (error) {
      console.error('❌ Error buscando mejores candidatos:', error);
    } finally {
      setLoadingBetterCandidates(false);
    }
  }, [token]);

  // 🔥 VER CV GRATUITO para candidatos que aplicaron
  const handleViewCVFree = useCallback(async (student: any) => {
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
        console.error('❌ Error en respuesta del servidor:', errorData);
        throw new Error(errorData.mensaje || 'Error al obtener el CV');
      }

      const cvData = await response.json();
      console.log('✅ CV obtenido gratuitamente:', cvData);
      console.log('📊 Estructura de cvData:', {
        hasStudent: !!cvData.student,
        studentGrade: cvData.student?.grade,
        studentCourse: cvData.student?.course,
        studentSkills: cvData.student?.skills?.length || 0
      });
      
      // Mostrar modal elegante en lugar de alert
      setSelectedStudentForAction(student);
      setCvData(cvData);
      setActionType('free');
      setShowCVModal(true);
      
    } catch (error) {
      console.error('❌ Error obteniendo CV:', error);
      alert(`Error al obtener el CV del estudiante: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [token]);

  // 🔥 CONTACTAR GRATUITO para candidatos que aplicaron
  const handleContactFree = useCallback((student: any, offerName: string) => {
    // Mostrar modal elegante en lugar de alert
    setActionType('free');
    setContactForm({
      subject: `Interés en tu aplicación - ${offerName}`,
      message: `Estimado/a ${student.User.name},\n\nHemos revisado tu aplicación para la oferta "${offerName}" y nos gustaría conocerte mejor.\n\n¿Estarías disponible para una entrevista?\n\nSaludos cordiales.`
    });
    setShowContactModal(true);
  }, []);

  // 🎯 UX MEJORADA: Eliminar oferta con confirmación
  const handleDeleteOffer = useCallback(async (offerId: number) => {
    setConfirmations(prev => ({
      ...prev,
      deleteOffer: { isOpen: true, offerId }
    }));
  }, []);

  const confirmDeleteOffer = useCallback(async () => {
    const offerId = confirmations.deleteOffer.offerId;
    if (!offerId) return;

    // Activar loading state específico
    setLoadingStates(prev => ({ ...prev, deletingOffer: offerId }));

    try {
      const result = await deleteOffer(offerId);
      if (result) {
        success('Oferta eliminada exitosamente');
      } else {
        showError('Error al eliminar la oferta');
      }
    } catch (error) {
      showError('Error al eliminar la oferta');
    } finally {
      // Cerrar confirmación y limpiar loading
      setConfirmations(prev => ({
        ...prev,
        deleteOffer: { isOpen: false, offerId: null }
      }));
      setLoadingStates(prev => ({ ...prev, deletingOffer: null }));
    }
  }, [confirmations.deleteOffer.offerId, deleteOffer, success, showError]);

  const handleEditOffer = useCallback((offerId: number) => {
    router.push(`/empresa/ofertas/edit/${offerId}`);
  }, [router]);

  // 🎯 UX MEJORADA: Ver CV con tokens con feedback visual
  const handleViewCVWithTokens = async (studentId: number) => {
    // Activar loading state específico
    setLoadingStates(prev => ({ ...prev, viewingCV: true }));
    
    try {
      console.log('📄 Ver CV con tokens para estudiante:', studentId);
      
      const isAlreadyRevealed = isRevealed(studentId);
      
      if (isAlreadyRevealed) {
        console.log('✅ CV ya revelado previamente - Acceso gratuito');
        info('CV ya revelado previamente - Acceso gratuito');
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
          warning(`Tokens insuficientes. Necesitas ${errorData.required} tokens para ver este CV.`);
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
        addRevealedCV(studentId);
        console.log(`💾 CV del estudiante ${studentId} marcado como revelado`);
        success('CV desbloqueado correctamente');
      }
      
      const student = betterCandidates.find(s => s.id === studentId);
      setSelectedStudentForAction(student);
      setCvData(cvData);
      setActionType('paid');
      setShowCVModal(true);
      
    } catch (error) {
      console.error('❌ Error obteniendo CV:', error);
      showError('Error al obtener el CV del estudiante');
    } finally {
      // Desactivar loading state
      setLoadingStates(prev => ({ ...prev, viewingCV: false }));
    }
  };

  const handleContactWithTokens = (studentId: number) => {
    const student = betterCandidates.find(s => s.id === studentId);
    setSelectedStudentForAction(student);
    setActionType('paid');
    setContactForm({
      subject: `Interés en tu perfil - ${selectedOffer?.name}`,
      message: `Estimado/a ${cvData?.student?.User?.name},\n\nHemos encontrado tu perfil y nos interesa conocerte para la oferta "${selectedOffer?.name}".\n\n¿Te gustaría conocer más sobre esta oportunidad?\n\nSaludos cordiales.`
    });
    setShowContactModal(true);
  };

  // 🎯 UX MEJORADA: Contactar estudiante con feedback visual
  const handleSendContact = async () => {
    if (!cvData?.student) return;

    // Activar loading state específico
    setLoadingStates(prev => ({ ...prev, contacting: true }));

    try {
      const response = await fetch(`http://localhost:5000/api/students/${cvData.student.id}/contact`, {
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
          warning(`Tokens insuficientes. Necesitas ${errorData.required} tokens para contactar.`);
          return;
        }
        throw new Error('Error al contactar el estudiante');
      }

      const result = await response.json();
      console.log('✅ Contacto registrado:', result);

      // Abrir cliente de email
      const emailBody = encodeURIComponent(contactForm.message);
      const emailSubject = encodeURIComponent(contactForm.subject);
      const emailUrl = `mailto:${cvData.student.User.email}?subject=${emailSubject}&body=${emailBody}`;
      
      window.open(emailUrl);
      
      // Cerrar modal y mostrar éxito
      setShowContactModal(false);
      setContactForm({ subject: '', message: '' });
      success(`Contacto enviado a ${cvData.student.User?.name}`);
      
    } catch (error) {
      console.error('❌ Error contactando estudiante:', error);
      showError('Error al contactar el estudiante');
    } finally {
      // Desactivar loading state
      setLoadingStates(prev => ({ ...prev, contacting: false }));
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

  // 🎯 UX MEJORADA: Programar entrevista con feedback visual
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
          status: 'interview_requested',
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

      const result = await response.json();
      
      // � MOSTRAR MODAL DE CONFIRMACIÓN CON DETALLES GENERADOS
      setGeneratedInterviewDetails(result.application.interviewDetails);
      setShowConfirmationModal(true);
      
      // Cerrar modal de solicitud y refrescar datos
      setShowInterviewModal(false);
      setShowCandidatesModal(false);
      
      // 🔥 REFRESCAR LOS DATOS DE LAS OFERTAS PARA ACTUALIZAR EL ESTADO
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      
      // Limpiar formulario
      setInterviewForm({
        date: '',
        time: '',
        location: '',
        type: 'presencial',
        notes: ''
      });
      
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
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ofertas</h1>
            <p className="text-gray-600">Gestiona tus ofertas y revisa candidatos con valoración inteligente</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" 
            onClick={() => router.push('/empresa/ofertas/new')}
          >
            <Plus className="w-4 h-4" />
            Nueva Oferta
          </Button>
        </div>
      </div>

      {/* 🎯 UX MEJORADA: Estadísticas con loading visual */}
      <LoadingStats 
        isLoading={loading}
        stats={{
          totalApplications: offerStats.reduce((acc, offer) => acc + offer.totalCandidates, 0),
          viewedCVs: revealedCVs.length,
          interviews: 0, // TODO: Implementar contador de entrevistas
          accepted: 0,   // TODO: Implementar contador de aceptados
          pending: offerStats.reduce((acc, offer) => acc + offer.totalCandidates, 0),
          contacted: 0   // TODO: Implementar contador de contactados
        }}
      />

      {/* Lista de ofertas optimizada */}
      <div className="grid gap-6">
        {offerStats.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onViewCandidates={handleViewCandidates}
            onSearchBetter={handleSearchBetterCandidates}
            onDelete={handleDeleteOffer}
            onEdit={handleEditOffer}
            getAffinityColor={getAffinityColor}
            isDeleting={loadingStates.deletingOffer === offer.id}
          />
        ))}
      </div>

      {offers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes ofertas publicadas</h3>
            <p className="text-gray-600 mb-4">Crea tu primera oferta para empezar a recibir candidatos</p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/empresa/ofertas/new')}>
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
                              •••••••••••@•••••••••••
                            </p>
                            <p className="text-sm text-gray-500">
                              •••••••••••
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
                          disabled={loadingStates.viewingCV}
                        >
                          {loadingStates.viewingCV ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Cargando...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Ver CV (Gratis)
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleContactFree(candidate.student, selectedOffer?.name || 'esta oferta')}
                          disabled={loadingStates.contacting}
                        >
                          {loadingStates.contacting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Contactando...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-1" />
                              Contactar (Gratis)
                            </>
                          )}
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
                              •••••••••••@•••••••••••
                            </p>
                            <p className="text-sm text-gray-500">
                              •••••••••••
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
                          className={isRevealed(student.id) ? 'bg-green-50 border-green-300 text-green-700' : 'bg-purple-50 border-purple-300 text-purple-700'}
                          disabled={loadingStates.viewingCV}
                        >
                          {loadingStates.viewingCV ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Revelando...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              {isRevealed(student.id) ? 'CV Revelado' : 'Revelar Perfil (2 tokens)'}
                            </>
                          )}
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
              CV de {cvData?.student?.User?.name} {cvData?.student?.User?.surname}
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
                    <p className="font-medium">{cvData?.student?.User?.name || 'No disponible'} {cvData?.student?.User?.surname || ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{cvData?.student?.User?.email || 'No disponible'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{cvData?.student?.User?.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehículo propio</p>
                    <p className="font-medium">{cvData?.student?.car ? 'Sí' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Formación académica */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Formación Académica</h3>
                {cvData.student.academicInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Centro de Estudios</p>
                      <p className="font-medium">{cvData.student.academicInfo.scenter?.name || 'No especificado'}</p>
                      {cvData.student.academicInfo.scenter?.code && (
                        <p className="text-xs text-gray-500">Código: {cvData.student.academicInfo.scenter.code}</p>
                      )}
                      {cvData.student.academicInfo.scenter?.city && (
                        <p className="text-xs text-gray-500">Ciudad: {cvData.student.academicInfo.scenter.city}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-gray-600">Familia Profesional</p>
                        {selectedOffer && (
                          <>
                            {isMatchingProFamily(cvData.student.academicInfo.profamily, selectedOffer.profamilys || selectedOffer.profamily) && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Coincide con oferta
                              </Badge>
                            )}
                            {isSimilarProFamily(cvData.student.academicInfo.profamily, selectedOffer.profamilys || selectedOffer.profamily) && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Similar a oferta
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <p className="font-medium">
                        {selectedOffer && selectedOffer.profamilys && selectedOffer.profamilys.length > 0 
                          ? selectedOffer.profamilys.map((p: any) => p.name).join(', ')
                          : selectedOffer?.profamily?.name || 'No especificado'
                        }
                      </p>
                      {selectedOffer && (
                        (selectedOffer.profamilys && selectedOffer.profamilys.length > 0 
                          ? selectedOffer.profamilys[0] 
                          : selectedOffer.profamily
                        )?.description && (
                          <p className="text-xs text-gray-500">
                            {(selectedOffer.profamilys && selectedOffer.profamilys.length > 0 
                              ? selectedOffer.profamilys[0] 
                              : selectedOffer.profamily
                            )?.description}
                          </p>
                        )
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Estado Académico</p>
                      <p className="font-medium">{cvData.student.academicInfo.status || 'No especificado'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Información académica no disponible</p>
                )}
              </div>

              {/* Habilidades */}
              {cvData?.student?.skills && cvData.student.skills.length > 0 ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-lg">Habilidades y Tecnologías</h3>
                    {selectedOffer && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        ⭐ Habilidades destacadas según oferta
                      </Badge>
                    )}
                  </div>
                  <div className="grid gap-3">
                    {cvData.student.skills.map((skill: any, index: number) => {
                      const isMatching = selectedOffer ? getMatchingSkills([skill], selectedOffer.offerSkills).length > 0 : false;
                      return (
                        <div key={index} className={`p-3 rounded border ${isMatching ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-medium ${isMatching ? 'text-yellow-800' : ''}`}>{skill.name}</span>
                                {isMatching && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Coincide con oferta
                                  </Badge>
                                )}
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
                            {isMatching && (
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Habilidades y Tecnologías</h3>
                  <p className="text-gray-600">No hay habilidades registradas</p>
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
                      handleContactFree(cvData.student, selectedOffer?.name || 'la oferta');
                    } else {
                      handleContactWithTokens(cvData.student.id);
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
              Contactar a {cvData?.student?.User?.name} {cvData?.student?.User?.surname}
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
                <strong>Candidato:</strong> {cvData?.student?.User?.name} {cvData?.student?.User?.surname}
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
                  interviewForm.type === 'online' ? 'Plataforma de videollamada (ej: Google Meet)' :
                  'Número de teléfono'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {interviewForm.type === 'online' && (
                <p className="text-xs text-purple-600 mt-1">
                  💡 El enlace de Google Meet se generará automáticamente al enviar la solicitud.
                </p>
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

      {/* 🎯 UX MEJORADA: Diálogos de confirmación */}
      <ConfirmationDialog
        isOpen={confirmations.deleteOffer.isOpen}
        onClose={() => setConfirmations(prev => ({
          ...prev,
          deleteOffer: { isOpen: false, offerId: null }
        }))}
        onConfirm={confirmDeleteOffer}
        title="Eliminar Oferta"
        message={`¿Estás seguro de que quieres eliminar esta oferta?\n\nEsta acción no se puede deshacer y se perderán todos los datos asociados.`}
        type="danger"
        confirmText="Eliminar"
        isLoading={loadingStates.deletingOffer === confirmations.deleteOffer.offerId}
        loadingText="Eliminando..."
      />

      {/* Modal de confirmación de entrevista solicitada */}
      {showConfirmationModal && generatedInterviewDetails && selectedStudentForAction && (
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
                    setSelectedStudentForAction(null);
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
                    {selectedStudentForAction.student?.User?.name} {selectedStudentForAction.student?.User?.surname}
                  </p>
                  <p className="text-green-600 text-sm">
                    Oferta: {selectedOffer?.name}
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
                    {generatedInterviewDetails.type === 'online' && (
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
                      setSelectedStudentForAction(null);
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
// 🔥 AGREGAR ESTA EXPORTACIÓN AL FINAL:
export default function CompanyOffersPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <CompanyOffersContent />
    </AuthGuard>
  );
}