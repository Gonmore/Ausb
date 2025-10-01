'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
// import { ConditionalHeader } from '@/components/conditional-header';
import { Search, MapPin, Calendar, Building, Users, Clock, Car, Tag, Check, X, Loader2 } from 'lucide-react';
import { offerService } from '@/lib/services';
import { applicationService } from '@/lib/application-service-v2';
import { useAuthStore } from '@/stores/auth';
import { Offer } from '@/types';

export default function OfertasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // 🔥 AGREGAR ESTADO PARA APLICACIONES
  const [userApplications, setUserApplications] = useState<{[key: string]: any}>({});
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [applyingToOffer, setApplyingToOffer] = useState<string | null>(null); // 🔥 NUEVO: ID de la oferta que se está aplicando
  
  // 🔥 ESTADOS PARA EL MODAL DE ENTREVISTA
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [interviewAction, setInterviewAction] = useState<'confirm' | 'reject' | null>(null);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingInterviewAction, setLoadingInterviewAction] = useState(false);
  
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();

  // Debug logging
  console.log('🔍 OfertasPage render - User:', user);
  console.log('🔍 User role:', user?.role);
  console.log('🔍 Is user a student?', user?.role === 'student');

  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['offers', user?.role],
    queryFn: async () => {
      console.log('🔍 Fetching offers...');
      
      // 🔥 Si es estudiante, usar endpoint con aptitud
      if (user?.role === 'student' && token) {
        try {
          console.log('👨‍🎓 Fetching offers with aptitude for student...');
          const response = await fetch('http://localhost:5000/api/offers/with-aptitude', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Offers with aptitude loaded:', data);
            return data;
          } else {
            console.log('⚠️ Aptitude endpoint failed, falling back to regular offers');
            return offerService.getAllOffers();
          }
        } catch (error) {
          console.log('⚠️ Aptitude endpoint error, falling back to regular offers:', error);
          return offerService.getAllOffers();
        }
      } else {
        // 🔥 Para otros roles o sin autenticación, usar endpoint regular
        return offerService.getAllOffers();
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // No fallar la query por errores de red o autenticación
    throwOnError: false,
  });

  useEffect(() => {
    console.log('🔄 Offers data changed:', offers);
    if (offers.length > 0) {
      console.log('📋 First offer structure:', offers[0]);
      const filtered = offers.filter((offer: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          offer.name?.toLowerCase().includes(searchLower) ||
          offer.description?.toLowerCase().includes(searchLower) ||
          offer.sector?.toLowerCase().includes(searchLower) ||
          offer.type?.toLowerCase().includes(searchLower) ||
          offer.location?.toLowerCase().includes(searchLower) ||
          offer.tag?.toLowerCase().includes(searchLower)
        );
      });
      console.log('🎯 Filtered offers:', filtered.length);
      setFilteredOffers(filtered);
    }
  }, [offers, searchTerm]);

  // 🔥 CARGAR APLICACIONES DEL USUARIO AL INICIO
  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!user || !token || user.role !== 'student') {
        setLoadingApplications(false);
        return;
      }

      try {
        console.log('🔄 Cargando aplicaciones del usuario...');
        
        const response = await fetch('http://localhost:5000/api/applications/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const applicationsData = await response.json();
          console.log('📋 Applications loaded:', applicationsData);
          
          // 🔥 VERIFICAR QUE SEA UN ARRAY ANTES DE PROCESAR  
          const applications = Array.isArray(applicationsData) 
            ? applicationsData 
            : applicationsData?.applications || [];
          
          // 🔥 CREAR MAPA DE APLICACIONES MÁS ROBUSTO
          const applicationsMap: {[key: string]: any} = {};
          
          applications.forEach((app: any) => {
            const offerId = app.offerId || app.offer?.id;
            if (offerId) {
              applicationsMap[offerId.toString()] = {
                id: app.id,
                status: app.status,
                appliedAt: app.appliedAt,
                reviewedAt: app.reviewedAt,
                cvViewed: app.cvViewed || false,
                cvViewedAt: app.cvViewedAt,
                message: app.message,
                companyNotes: app.companyNotes,
                rejectionReason: app.rejectionReason
              };
            }
          });
          
          setUserApplications(applicationsMap);
          console.log('🗺️ Applications map created:', applicationsMap);
          
        } else {
          console.error('❌ Error loading applications:', response.status);
        }
      } catch (error) {
        console.error('❌ Error loading applications:', error);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchUserApplications();
  }, [user, token]); // 🔥 DEPENDENCIAS CORRECTAS

  // 🔥 FUNCIÓN MEJORADA PARA APLICAR
  const handleApplyToOffer = async (offer: Offer) => {
    console.log('🚀 Applying to offer:', offer.id);
    
    if (!user || user.role !== 'student') {
      alert('Solo los estudiantes pueden aplicar a ofertas');
      return;
    }

    // 🔥 VERIFICAR SI YA APLICÓ (MÁS ROBUSTO)
    const existingApplication = userApplications[offer.id.toString()];
    if (existingApplication && existingApplication.status !== 'withdrawn') {
      alert(`Ya has aplicado a esta oferta.\nEstado: ${getStatusText(existingApplication.status)}\nFecha: ${new Date(existingApplication.appliedAt).toLocaleDateString()}`);
      return;
    }
    
    // 🔥 MARCAR QUE SE ESTÁ APLICANDO A ESTA OFERTA
    setApplyingToOffer(offer.id.toString());
    
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: offer.id,
          message: `Aplicación a ${offer.name}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Application created:', result);
        
        // 🔥 ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE CON EL ID REAL
        const newApplication = {
          id: result.application?.id || result.id || Date.now(),
          status: 'pending',
          appliedAt: new Date().toISOString(),
          message: `Aplicación a ${offer.name}`,
          reviewedAt: null,
          cvViewed: false,
          cvViewedAt: null,
          companyNotes: null,
          rejectionReason: null
        };
        
        setUserApplications(prev => ({
          ...prev,
          [offer.id.toString()]: newApplication
        }));

        // 🔥 REFRESCAR DATOS DE OFERTAS Y APLICACIONES
        queryClient.invalidateQueries({ queryKey: ['offers'] });
        queryClient.invalidateQueries({ queryKey: ['applications'] });
        
        // 🔥 RECARGAR APLICACIONES DEL USUARIO INMEDIATAMENTE PARA ASEGURAR CONSISTENCIA
        try {
          const updatedApplicationsResponse = await fetch('http://localhost:5000/api/applications/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (updatedApplicationsResponse.ok) {
            const updatedApplicationsData = await updatedApplicationsResponse.json();
            const updatedApplications = Array.isArray(updatedApplicationsData) ? updatedApplicationsData : updatedApplicationsData?.applications || [];
            
            const updatedApplicationsMap: {[key: string]: any} = {};
            updatedApplications.forEach((app: any) => {
              const offerId = app.offerId || app.offer?.id;
              if (offerId) {
                updatedApplicationsMap[offerId.toString()] = {
                  id: app.id,
                  status: app.status,
                  appliedAt: app.appliedAt,
                  reviewedAt: app.reviewedAt,
                  cvViewed: app.cvViewed || false,
                  cvViewedAt: app.cvViewedAt,
                  message: app.message,
                  companyNotes: app.companyNotes,
                  rejectionReason: app.rejectionReason
                };
              }
            });
            
            setUserApplications(updatedApplicationsMap);
            console.log('🔄 Applications refreshed after apply:', updatedApplicationsMap);
          }
        } catch (refreshError) {
          console.warn('⚠️ Could not refresh applications, using local state:', refreshError);
        }

        alert(`¡Aplicación enviada exitosamente!\n\nOferta: ${offer.name}\nEmpresa: ${offer.sector || 'N/A'}\n\nTe contactaremos pronto.`);
        
        // 🔥 CERRAR MODAL DESPUÉS DE APLICAR EXITOSAMENTE
        if (showDetailsModal) {
          closeDetailsModal();
        }
        
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.mensaje || 'No se pudo enviar la aplicación'}`);
      }
      
    } catch (error: any) {
      console.error('❌ Application failed:', error);
      alert(`Error al aplicar: ${error.message || 'Error desconocido'}`);
    } finally {
      // 🔥 LIMPIAR ESTADO DE CARGA
      setApplyingToOffer(null);
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER TEXTO DEL ESTADO
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewed': return 'Revisada';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'withdrawn': return 'Retirada';
      default: return status;
    }
  };

  // 🔥 FUNCIÓN PARA OBTENER COLOR DEL ESTADO
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (offer: Offer) => {
    console.log('📋 Ver detalles de la oferta:', offer);
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOffer(null);
  };

  // 🔥 FUNCIONES PARA MANEJAR ENTREVISTAS
  const handleViewInterview = (application: any) => {
    setSelectedApplication(application);
    setShowInterviewModal(true);
    setInterviewAction(null);
    setInterviewNotes('');
    setRejectionReason('');
  };

  const handleConfirmInterview = async () => {
    if (!selectedApplication) return;

    setLoadingInterviewAction(true);
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApplication.id}/confirm-interview`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentNotes: interviewNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Interview confirmed:', result);

      // Actualizar estado local
      setUserApplications(prev => ({
        ...prev,
        [selectedApplication.id]: {
          ...prev[selectedApplication.id],
          status: 'interview_confirmed'
        }
      }));

      alert('Entrevista confirmada exitosamente');
      setShowInterviewModal(false);
      
    } catch (err: any) {
      console.error('❌ Error confirming interview:', err);
      alert(`Error al confirmar la entrevista: ${err.message}`);
    } finally {
      setLoadingInterviewAction(false);
    }
  };

  const handleRejectInterview = async () => {
    if (!selectedApplication) return;

    setLoadingInterviewAction(true);
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${selectedApplication.id}/reject-interview`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason,
          studentNotes: interviewNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('❌ Interview rejected:', result);

      // Actualizar estado local
      setUserApplications(prev => ({
        ...prev,
        [selectedApplication.id]: {
          ...prev[selectedApplication.id],
          status: 'interview_rejected'
        }
      }));

      alert('Entrevista rechazada');
      setShowInterviewModal(false);
      
    } catch (err: any) {
      console.error('❌ Error rejecting interview:', err);
      alert(`Error al rechazar la entrevista: ${err.message}`);
    } finally {
      setLoadingInterviewAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  // Si no hay ofertas, mostrar mensaje informativo
  if (!isLoading && filteredOffers.length === 0 && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">Ofertas de Prácticas</h1>
              <p className="text-gray-600 mt-2">
                Explora las oportunidades de prácticas disponibles
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-12 w-12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0H6a2 2 0 00-2 2v6a2 2 0 002 2h2M8 6h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2h2" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ofertas disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              {!user ? 
                'Las ofertas se cargan automáticamente. Si no ves ninguna, puede que no haya ofertas publicadas en este momento.' :
                'Aún no se han publicado ofertas de prácticas. Vuelve pronto para ver las oportunidades disponibles.'
              }
            </p>
            {!user && (
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="btn-fprax-primary"
                >
                  Iniciar sesión para ver más detalles
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fprax-light-gray)' }}>
      {/* Header duplicado eliminado */}
      
      <div className="container mx-auto px-4 py-8">
        <div className="fprax-fade-in">
          {/* Header Section - Sin botón "Publicar Oferta" para NINGÚN rol */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ 
                background: 'var(--fprax-gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--fprax-font-primary)'
              }}>
                Ofertas de Prácticas FPRAX
              </h1>
              <p className="mt-2" style={{ 
                color: 'var(--fprax-medium-gray)',
                fontFamily: 'var(--fprax-font-primary)'
              }}>
                Descubre oportunidades de prácticas profesionales
              </p>
            </div>
            {/* Botón "Publicar Oferta" eliminado para TODOS los roles */}
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar ofertas por título, descripción, empresa, ubicación o skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="btn-fprax-outline">
                Filtros
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {filteredOffers.length} ofertas encontradas
              </p>
            </div>

            {filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron ofertas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Intenta con diferentes términos de búsqueda'
                      : 'Aún no hay ofertas disponibles'
                    }
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm('')}
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredOffers.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {offer.name}
                          </CardTitle>
                          <div className="text-base text-muted-foreground">
                            {offer.sector && (
                              <div className="flex items-center text-gray-600 mb-1">
                                <Building className="h-4 w-4 mr-1" />
                                {offer.sector}
                              </div>
                            )}
                            {offer.location && (
                              <div className="flex items-center text-gray-600 mb-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {offer.location}
                              </div>
                            )}
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Publicado: {formatDate(offer.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className="bg-green-100 text-green-800">
                            Disponible
                          </Badge>
                          {/* 🔥 MOSTRAR APTITUD PARA ESTUDIANTES */}
                          {user?.role === 'student' && offer.aptitudeDetails && offer.aptitudeDetails.level && (
                            <div className="text-sm font-medium">
                              <Badge
                                className={
                                  offer.aptitudeDetails.level === 'muy alto' ? 'bg-green-100 text-green-800' :
                                  offer.aptitudeDetails.level === 'alto' ? 'bg-yellow-100 text-yellow-800' :
                                  offer.aptitudeDetails.level === 'medio' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {offer.aptitudeDetails.level === 'muy alto' ? 'Muy Alta' :
                                 offer.aptitudeDetails.level === 'alto' ? 'Alta' :
                                 offer.aptitudeDetails.level === 'medio' ? 'Media' :
                                 offer.aptitudeDetails.level === 'bajo' ? 'Baja' :
                                 'Sin Datos'} compatibilidad
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                ({offer.aptitude}%)
                              </div>
                            </div>
                          )}
                          {offer.min_hr && (
                            <div className="text-sm font-medium text-gray-900">
                              {offer.min_hr} horas mínimas
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {offer.description}
                      </p>
                      
                      {/* Mostrar skills requeridos en lugar de tags */}
                      {(() => {
                        const skillsArray = offer.skills || offer.Skills || [];
                        return skillsArray.length > 0 ? (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Habilidades requeridas:</h4>
                            <div className="flex flex-wrap gap-1">
                              {skillsArray.slice(0, 3).map((skill: any, index: number) => (
                                <Badge key={skill.id} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {skill.name}
                                </Badge>
                              ))}
                              {skillsArray.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{skillsArray.length - 3} habilidades más
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : offer.tag ? (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                          <div className="flex flex-wrap gap-1">
                            {offer.tag.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag.trim()}
                              </Badge>
                            ))}
                            {offer.tag.split(',').length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{offer.tag.split(',').length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : null;
                      })()}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {offer.requisites && (
                            <Badge variant="outline">
                              Requisitos disponibles
                            </Badge>
                          )}
                          {offer.period && (
                            <Badge variant="outline">
                              Duración: {offer.period}
                            </Badge>
                          )}
                          {offer.mode && (
                            <Badge variant="outline">
                              Modalidad: {offer.mode}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* 🔥 MOSTRAR ESTADO DE APLICACIÓN SI EXISTE */}
                          {user?.role === 'student' && userApplications[offer.id] && (
                            <div className="flex flex-col items-end">
                              <Badge className={getStatusColor(userApplications[offer.id].status)}>
                                {getStatusText(userApplications[offer.id].status)}
                              </Badge>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(userApplications[offer.id].appliedAt).toLocaleDateString()}
                              </span>
                              {/* 🔥 MEJORAR INDICADOR DE CV REVISADO */}
                              {userApplications[offer.id].cvViewed && (
                                <span className="text-xs text-green-600 flex items-center">
                                  ✓ CV revisado
                                  {userApplications[offer.id].cvViewedAt && (
                                    <span className="ml-1 text-gray-500">
                                      ({new Date(userApplications[offer.id].cvViewedAt).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                              )}
                              {userApplications[offer.id].reviewedAt && !userApplications[offer.id].cvViewed && (
                                <span className="text-xs text-blue-600">
                                  📋 Aplicación revisada
                                </span>
                              )}
                              {/* 🔥 BOTÓN PARA VER ENTREVISTA */}
                              {userApplications[offer.id].status === 'interview_requested' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewInterview(userApplications[offer.id])}
                                  className="text-purple-600 hover:text-purple-700 border-purple-300 hover:bg-purple-50 mt-2"
                                >
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Ver Entrevista
                                </Button>
                              )}
                            </div>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(offer)}
                            className="btn-fprax-outline"
                          >
                            Ver detalles
                          </Button>
                          
                          {/* 🔥 BOTÓN CONDICIONAL SEGÚN ESTADO */}
                          {!user ? (
                            <Button 
                              size="sm"
                              onClick={() => window.location.href = '/login'}
                              className="btn-fprax-primary"
                            >
                              Iniciar sesión
                            </Button>
                          ) : user.role !== 'student' ? (
                            <Button 
                              size="sm"
                              disabled
                              className="btn-fprax-primary opacity-50"
                            >
                              Solo estudiantes
                            </Button>
                          ) : userApplications[offer.id] && userApplications[offer.id].status !== 'withdrawn' ? (
                            <Button 
                              size="sm"
                              disabled
                              className="bg-green-600 text-white opacity-75"
                            >
                              ✓ Aplicado
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleApplyToOffer(offer)}
                              className="btn-fprax-primary"
                              disabled={loadingApplications || applyingToOffer === offer.id.toString()}
                            >
                              {applyingToOffer === offer.id.toString() ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Aplicando...
                                </>
                              ) : loadingApplications ? (
                                'Cargando...'
                              ) : (
                                'Aplicar'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles de oferta */}
      {showDetailsModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedOffer.name}</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={closeDetailsModal}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {selectedOffer.sector}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedOffer.location}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedOffer.period}
                  </Badge>
                  <Badge variant="outline">
                    {selectedOffer.mode}
                  </Badge>
                  <Badge variant="outline">
                    {selectedOffer.min_hr} horas mín.
                  </Badge>
                  {selectedOffer.car && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      Vehículo requerido
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-700">{selectedOffer.description}</p>
                </div>

                {selectedOffer.jobs && (
                  <div>
                    <h3 className="font-semibold mb-2">Tareas a realizar</h3>
                    <p className="text-gray-700">{selectedOffer.jobs}</p>
                  </div>
                )}

                {selectedOffer.requisites && (
                  <div>
                    <h3 className="font-semibold mb-2">Requisitos</h3>
                    <p className="text-gray-700">{selectedOffer.requisites}</p>
                  </div>
                )}

                {/* Mostrar skills requeridos en el modal */}
                {(() => {
                  const skillsArray = selectedOffer.skills || selectedOffer.Skills || [];
                  return skillsArray.length > 0 ? (
                    <div>
                      <h3 className="font-semibold mb-2">Habilidades requeridas</h3>
                      <div className="flex flex-wrap gap-1">
                        {skillsArray.map((skill: any) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          <Tag className="h-3 w-3 mr-1" />
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : selectedOffer.tag ? (
                  <div>
                    <h3 className="font-semibold mb-2">Tecnologías/Habilidades (Tags)</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedOffer.tag.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null;
                })()}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Tipo:</strong> {selectedOffer.type}
                  </div>
                  <div>
                    <strong>Horario:</strong> {selectedOffer.schedule}
                  </div>
                  <div>
                    <strong>Publicado:</strong> {formatDate(selectedOffer.createdAt)}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={closeDetailsModal}>
                    Cerrar
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('🔥 Modal apply button clicked!');
                      handleApplyToOffer(selectedOffer);
                    }}
                    disabled={!!user && user.role !== 'student' || applyingToOffer === selectedOffer.id.toString()}
                  >
                    {!user ? 'Iniciar sesión' : 
                     user.role !== 'student' ? 'Solo estudiantes pueden aplicar' : 
                     applyingToOffer === selectedOffer.id.toString() ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                         Aplicando...
                       </>
                     ) :
                     userApplications[selectedOffer.id] && userApplications[selectedOffer.id].status !== 'withdrawn' ? 
                     'Ya aplicado' : 
                     'Aplicar a esta oferta'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entrevista */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Detalles de la Entrevista
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Información de la oferta */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedApplication?.offer?.name || selectedOffer?.name || 'Oferta'}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedApplication?.offer?.company?.name || selectedApplication?.offer?.sector || selectedOffer?.sector || 'Empresa'}</p>
                <p className="text-sm text-gray-700">{selectedApplication?.offer?.description || selectedOffer?.description || 'Descripción no disponible'}</p>
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

              {/* Detalles de la entrevista - solo si existen */}
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
                    La empresa aún no ha proporcionado los detalles específicos de la entrevista. 
                    Te notificaremos cuando estén disponibles.
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

              {/* Acciones del estudiante */}
              {interviewAction === null ? (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => setInterviewAction('confirm')}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    disabled={!selectedApplication.interviewDetails}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Entrevista
                  </Button>
                  <Button
                    onClick={() => setInterviewAction('reject')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rechazar Entrevista
                  </Button>
                </div>
              ) : interviewAction === 'confirm' ? (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="¿Algo que quieras comunicar a la empresa?"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirmInterview}
                      disabled={loadingInterviewAction}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loadingInterviewAction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Confirmar Entrevista
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setInterviewAction(null)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo de rechazo
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Selecciona un motivo</option>
                      <option value="fecha_inconveniente">Fecha u hora inconveniente</option>
                      <option value="tipo_entrevista">Tipo de entrevista no adecuado</option>
                      <option value="ubicacion_lejana">Ubicación muy lejana</option>
                      <option value="compromiso_previo">Tengo un compromiso previo</option>
                      <option value="cambio_opinion">He cambiado de opinión sobre la oferta</option>
                      <option value="otro">Otro motivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje adicional (opcional)
                    </label>
                    <textarea
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Explica brevemente el motivo..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRejectInterview}
                      disabled={loadingInterviewAction || !rejectionReason}
                      variant="destructive"
                    >
                      {loadingInterviewAction ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Rechazando...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Rechazar Entrevista
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setInterviewAction(null)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
