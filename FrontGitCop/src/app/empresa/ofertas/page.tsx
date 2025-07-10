'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { offerService, profamiliesService } from '@/lib/services';
import { Offer } from '@/types';

interface NewOfferForm {
  name: string;
  description: string;
  requisites: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'freelance';
  mode: string;
  period: string;
  schedule: string;
  min_hr: number;
  car: boolean;
  sector: string;
  tag: string;
  jobs: string;
  profamilyId: number;
}

function OfferManagementContent() {
  const { user, canAccessRole, token } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [profamilies, setProfamilies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [offerApplications, setOfferApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [newOffer, setNewOffer] = useState<NewOfferForm>({
    name: '',
    description: '',
    requisites: '',
    location: '',
    type: 'full-time' as const,
    mode: 'presencial',
    period: '6 meses',
    schedule: 'Mañana',
    min_hr: 200,
    car: false,
    sector: 'Tecnología',
    tag: 'programacion',
    jobs: '',
    profamilyId: 1 // Default to first profamily
  });

  // Verificar que el usuario puede acceder como empresa
  if (!canAccessRole('company')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder a la gestión de ofertas empresariales.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      fetchOffers();
      fetchProfamilies();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching company offers from backend...');
      
      if (!user) {
        throw new Error('No user authenticated');
      }
      
      // Mapeo temporal de usuarios a empresas basado en el email
      let companyId = 1; // Default
      if (user.email === 'company1@example.com') {
        companyId = 1; // TechSolutions España
      } else if (user.email === 'company2@example.com') {
        companyId = 2; // InnovateLab
      }
      
      console.log('👤 User email:', user.email);
      console.log('🏢 Using companyId:', companyId);
      
      const offersData = await offerService.getOffersByCompany(companyId);
      console.log('📋 Company offers loaded:', offersData);
      
      setOffers(offersData);
    } catch (err: any) {
      console.error('Error fetching company offers:', err);
      setError('Error al cargar las ofertas de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfamilies = async () => {
    try {
      console.log('🔍 Fetching profamilies...');
      const response = await profamiliesService.getAll();
      const profamiliesData = response.data;
      console.log('📋 Profamilies loaded:', profamiliesData);
      setProfamilies(profamiliesData);
    } catch (err: any) {
      console.error('Error fetching profamilies:', err);
      // No bloquear la interfaz si fallan las profamilies
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOffer = async () => {
    try {
      setSubmitting(true);
      console.log('📝 Creating new offer:', newOffer);
      
      // Crear la oferta usando el servicio
      const createdOffer = await offerService.createOffer(newOffer);
      console.log('✅ Offer created:', createdOffer);
      
      // Actualizar la lista
      await fetchOffers();
      
      // Resetear el formulario
      setNewOffer({
        name: '',
        description: '',
        requisites: '',
        location: '',
        type: 'full-time',
        mode: 'presencial',
        period: '6 meses',
        schedule: 'Mañana',
        min_hr: 200,
        car: false,
        sector: 'Tecnología',
        tag: 'programacion',
        jobs: '',
        profamilyId: 1
      });
      
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Error creating offer:', err);
      setError('Error al crear la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta?')) return;
    
    try {
      console.log('🗑️ Deleting offer:', id);
      await offerService.deleteOffer(id);
      console.log('✅ Offer deleted');
      
      // Actualizar la lista
      await fetchOffers();
    } catch (err: any) {
      console.error('Error deleting offer:', err);
      alert('Error al eliminar la oferta');
    }
  };

  const handleViewApplications = async (offer: Offer) => {
    try {
      setSelectedOffer(offer);
      setLoadingApplications(true);
      setShowApplicationsModal(true);

      const response = await fetch(`http://localhost:5000/api/applications/offer/${offer.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const applications = await response.json();
      setOfferApplications(applications);
    } catch (err: any) {
      console.error('Error fetching offer applications:', err);
      alert('Error al cargar las aplicaciones de esta oferta');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setNewOffer({
      name: offer.name,
      description: offer.description,
      requisites: offer.requisites || '',
      location: offer.location,
      type: offer.type as any,
      mode: offer.mode,
      period: offer.period,
      schedule: offer.schedule,
      min_hr: offer.min_hr,
      car: offer.car,
      sector: offer.sector,
      tag: offer.tag || '',
      jobs: offer.jobs || '',
      profamilyId: offer.profamilyId || 1
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateOffer = async () => {
    if (!selectedOffer) return;

    try {
      setSubmitting(true);
      setError(null);
      
      console.log('📝 Updating offer:', selectedOffer.id, newOffer);
      
      await offerService.updateOffer(selectedOffer.id, newOffer);
      console.log('✅ Offer updated successfully');
      
      // Refrescar la lista
      await fetchOffers();
      
      // Resetear el formulario
      setNewOffer({
        name: '',
        description: '',
        requisites: '',
        location: '',
        type: 'full-time',
        mode: 'presencial',
        period: '6 meses',
        schedule: 'Mañana',
        min_hr: 200,
        car: false,
        sector: 'Tecnología',
        tag: 'programacion',
        jobs: '',
        profamilyId: 1
      });
      
      setIsEditModalOpen(false);
      setSelectedOffer(null);
    } catch (err: any) {
      console.error('Error updating offer:', err);
      setError('Error al actualizar la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p>Cargando ofertas...</p>
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
          <Button 
            onClick={fetchOffers} 
            className="mt-4"
            variant="outline"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 fprax-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ 
            background: 'var(--fprax-gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'var(--fprax-font-primary)'
          }}>
            Gestión de Ofertas FPRAX
          </h1>
          <p className="mt-2" style={{ 
            color: 'var(--fprax-medium-gray)',
            fontFamily: 'var(--fprax-font-primary)'
          }}>
            Administra las ofertas de trabajo de tu empresa
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="btn-fprax-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Oferta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Título</Label>
                <Input
                  id="name"
                  value={newOffer.name}
                  onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Ej: Desarrollador Frontend React"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Ubicación</Label>
                <Input
                  id="location"
                  value={newOffer.location}
                  onChange={(e) => setNewOffer({ ...newOffer, location: e.target.value })}
                  className="col-span-3"
                  placeholder="Ej: Madrid, España"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tipo</Label>
                <Select value={newOffer.type} onValueChange={(value: any) => setNewOffer({ ...newOffer, type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona el tipo de empleo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tiempo Completo</SelectItem>
                    <SelectItem value="part-time">Tiempo Parcial</SelectItem>
                    <SelectItem value="internship">Prácticas</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sector" className="text-right">Sector</Label>
                <Input
                  id="sector"
                  value={newOffer.sector}
                  onChange={(e) => setNewOffer({ ...newOffer, sector: e.target.value })}
                  className="col-span-3"
                  placeholder="Ej: Tecnología"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profamily" className="text-right">Familia Profesional</Label>
                <Select value={newOffer.profamilyId.toString()} onValueChange={(value) => setNewOffer({ ...newOffer, profamilyId: parseInt(value) })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona la familia profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profamilies.map((profamily) => (
                      <SelectItem key={profamily.id} value={profamily.id.toString()}>
                        {profamily.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <Textarea
                  id="description"
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Describe la oferta de trabajo..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requisites" className="text-right">Requisitos</Label>
                <Textarea
                  id="requisites"
                  value={newOffer.requisites}
                  onChange={(e) => setNewOffer({ ...newOffer, requisites: e.target.value })}
                  className="col-span-3"
                  placeholder="Lista los requisitos necesarios..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jobs" className="text-right">Funciones</Label>
                <Textarea
                  id="jobs"
                  value={newOffer.jobs}
                  onChange={(e) => setNewOffer({ ...newOffer, jobs: e.target.value })}
                  className="col-span-3"
                  placeholder="Describe las funciones del puesto..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="btn-fprax-outline">
                Cancelar
              </Button>
              <Button onClick={handleCreateOffer} disabled={submitting} className="btn-fprax-primary">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Oferta'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar ofertas por título o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de ofertas */}
      <div className="space-y-4">
        {filteredOffers.map((offer) => (
          <Card key={offer.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold">{offer.name}</h3>
                    <Badge 
                      variant={offer.type === 'full-time' ? 'default' : 'secondary'}
                    >
                      {offer.type === 'full-time' ? 'Tiempo Completo' : 
                       offer.type === 'part-time' ? 'Tiempo Parcial' :
                       offer.type === 'internship' ? 'Prácticas' : 'Freelance'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {offer.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {offer.sector}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewApplications(offer)}
                    title="Ver candidatos"
                    className="btn-fprax-outline"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditOffer(offer)}
                    title="Editar oferta"
                    className="btn-fprax-secondary"
                    style={{ 
                      backgroundColor: 'var(--fprax-purple)', 
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteOffer(offer.id)}
                    title="Eliminar oferta"
                    style={{
                      color: '#F44336',
                      borderColor: '#F44336'
                    }}
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron ofertas</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera oferta para empezar'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Oferta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Aplicaciones */}
      <Dialog open={showApplicationsModal} onOpenChange={setShowApplicationsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aplicaciones para: {selectedOffer?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingApplications ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {offerApplications.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay aplicaciones para esta oferta aún.</p>
                ) : (
                  offerApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {application.Student?.User?.name} {application.Student?.User?.surname}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {application.Student?.grade} - {application.Student?.course}
                          </p>
                          {application.Student?.Profamily && (
                            <p className="text-xs text-blue-600">
                              {application.Student.Profamily.name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status === 'pending' ? 'Pendiente' :
                             application.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <strong>Aptitud:</strong>
                          <div className="mt-1">
                            <span className="inline-flex items-center text-xs">
                              🚗 Coche: {application.Student?.car ? '✅ Sí' : '❌ No'}
                            </span>
                          </div>
                          {application.Student?.tag && (
                            <div className="mt-1">
                              <strong>Skills:</strong> 
                              <span className="text-blue-600 ml-1">{application.Student.tag}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <strong>Aplicado:</strong> {new Date(application.appliedAt).toLocaleDateString()}
                          {application.message && (
                            <div className="mt-1">
                              <strong>Mensaje:</strong>
                              <p className="text-gray-600 text-xs mt-1">{application.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            📞 Contacto y CV requieren créditos
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            💳 Ver Contacto (1 crédito)
                          </Button>
                          <Button size="sm" variant="outline">
                            📄 Ver CV (2 créditos)
                          </Button>
                          {application.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                ✅ Aceptar
                              </Button>
                              <Button size="sm" variant="destructive">
                                ❌ Rechazar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApplicationsModal(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de editar oferta */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Oferta</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre del puesto *</Label>
                <Input
                  id="edit-name"
                  value={newOffer.name}
                  onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
                  placeholder="Ej: Desarrollador Frontend"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-location">Ubicación *</Label>
                <Input
                  id="edit-location"
                  value={newOffer.location}
                  onChange={(e) => setNewOffer({ ...newOffer, location: e.target.value })}
                  placeholder="Ej: Madrid, España"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descripción *</Label>
              <Textarea
                id="edit-description"
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                placeholder="Describe la oferta de trabajo..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-requisites">Requisitos</Label>
              <Textarea
                id="edit-requisites"
                value={newOffer.requisites}
                onChange={(e) => setNewOffer({ ...newOffer, requisites: e.target.value })}
                placeholder="Especifica los requisitos del puesto..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Tipo de contrato *</Label>
                <Select value={newOffer.type} onValueChange={(value: any) => setNewOffer({ ...newOffer, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tiempo Completo</SelectItem>
                    <SelectItem value="part-time">Tiempo Parcial</SelectItem>
                    <SelectItem value="internship">Prácticas</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-sector">Sector *</Label>
                <Input
                  id="edit-sector"
                  value={newOffer.sector}
                  onChange={(e) => setNewOffer({ ...newOffer, sector: e.target.value })}
                  placeholder="Ej: Tecnología"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-profamily">Familia Profesional</Label>
                <Select 
                  value={newOffer.profamilyId.toString()} 
                  onValueChange={(value) => setNewOffer({ ...newOffer, profamilyId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una familia" />
                  </SelectTrigger>
                  <SelectContent>
                    {profamilies.map((profamily) => (
                      <SelectItem key={profamily.id} value={profamily.id.toString()}>
                        {profamily.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-min_hr">Horas mínimas</Label>
                <Input
                  id="edit-min_hr"
                  type="number"
                  value={newOffer.min_hr}
                  onChange={(e) => setNewOffer({ ...newOffer, min_hr: parseInt(e.target.value) || 0 })}
                  placeholder="200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedOffer(null);
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateOffer}
                disabled={submitting || !newOffer.name || !newOffer.description || !newOffer.location}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Oferta'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OfferManagementPage() {
  return <OfferManagementContent />;
}
