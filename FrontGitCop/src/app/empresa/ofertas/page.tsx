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
  TrendingUp
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

  const { token } = useAuthStore();

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

  const handleViewCVWithTokens = (studentId: number) => {
    // Redirigir al buscador inteligente con los datos precargados
    window.location.href = `/empresa/buscador-inteligente?action=view_cv&studentId=${studentId}`;
  };

  const handleContactWithTokens = (studentId: number) => {
    // Redirigir al buscador inteligente con los datos precargados
    window.location.href = `/empresa/buscador-inteligente?action=contact&studentId=${studentId}`;
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
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver CV (Gratis)
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Mail className="w-4 h-4 mr-1" />
                          Contactar (Gratis)
                        </Button>
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
                              {(student.affinity?.level || 'bajo').toUpperCase()}
                            </Badge>
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
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver CV (2 tokens)
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleContactWithTokens(student.id)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Contactar (3 tokens)
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
    </div>
  );
}

export default function CompanyOffersPage() {
  return (
    <AuthGuard allowedRoles={['company']}>
      <CompanyOffersContent />
    </AuthGuard>
  );
}
