'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// import { ConditionalHeader } from '@/components/conditional-header';
import { Search, MapPin, Calendar, Building, Users, Clock, Car, Tag } from 'lucide-react';
import { offerService } from '@/lib/services';
import { applicationService } from '@/lib/application-service-v2';
import { useAuthStore } from '@/stores/auth';
import { Offer } from '@/types';

export default function OfertasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuthStore();

  // Debug logging
  console.log('🔍 OfertasPage render - User:', user);
  console.log('🔍 User role:', user?.role);
  console.log('🔍 Is user a student?', user?.role === 'student');

  const { data: offers = [], isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: () => {
      console.log('🔍 Fetching offers...');
      return offerService.getAllOffers();
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
      const filtered = offers.filter(offer => {
        const searchLower = searchTerm.toLowerCase();
        return (
          offer.name?.toLowerCase().includes(searchLower) ||
          offer.description?.toLowerCase().includes(searchLower) ||
          offer.sector?.toLowerCase().includes(searchLower) ||
          offer.type?.toLowerCase().includes(searchLower) ||
          offer.location?.toLowerCase().includes(searchLower)
        );
      });
      console.log('🎯 Filtered offers:', filtered.length);
      setFilteredOffers(filtered);
    }
  }, [offers, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'closed':
        return 'Cerrada';
      case 'draft':
        return 'Borrador';
      default:
        return 'Desconocido';
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

  const handleApplyToOffer = async (offer: Offer) => {
    console.log('� handleApplyToOffer called with:', offer);
    console.log('👤 Current user:', user);
    console.log('🔐 User role:', user?.role);
    
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    if (user.role !== 'student') {
      console.log('❌ User is not a student, role:', user.role);
      alert('Solo los estudiantes pueden aplicar a ofertas');
      return;
    }
    
    console.log('✅ Validation passed, attempting to apply...');
    
    try {
      // Crear objeto de oferta compatible con el servicio
      const offerData = {
        id: offer.id,
        title: offer.name,
        company: offer.sector,
        description: offer.description,
        requirements: offer.requirements || [],
        benefits: offer.benefits || [],
        salary: offer.salary,
        location: offer.location,
        type: offer.type,
        postedDate: offer.postedDate,
        deadline: offer.deadline,
        contactEmail: offer.contactEmail
      };
      
      const result = await applicationService.applyToOffer(offerData, user);
      console.log('✅ Application result:', result);
      
      if (result.success) {
        alert(`¡Aplicación enviada exitosamente!\n\nOferta: ${offer.name}\nEmpresa: ${offer.sector}\n\nTe contactaremos pronto.`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Application failed:', error);
      alert(`Error al aplicar a la oferta: ${error.message || 'Error desconocido'}`);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOffer(null);
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
      {/* <ConditionalHeader /> */}
      {/* Header */}
      <div className="fprax-nav bg-white shadow-lg border-b-4" style={{ borderBottomColor: 'var(--fprax-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
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
              {user?.role === 'company' && (
                <Button className="btn-fprax-secondary">
                  <Users className="h-4 w-4 mr-2" />
                  Publicar Oferta
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ofertas por título, descripción o empresa..."
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
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(offer)}
                          className="btn-fprax-outline"
                        >
                          Ver detalles
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            console.log('🔥 Apply button clicked!');
                            handleApplyToOffer(offer);
                          }}
                          disabled={!!user && user.role !== 'student'}
                          className="btn-fprax-primary"
                        >
                          {!user ? 'Iniciar sesión' : 
                           user.role !== 'student' ? 'Solo estudiantes' : 
                           'Aplicar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

                {selectedOffer.tag && (
                  <div>
                    <h3 className="font-semibold mb-2">Tecnologías/Habilidades</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedOffer.tag.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
                    disabled={!!user && user.role !== 'student'}
                  >
                    {!user ? 'Iniciar sesión' : 
                     user.role !== 'student' ? 'Solo estudiantes pueden aplicar' : 
                     'Aplicar a esta oferta'}
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
