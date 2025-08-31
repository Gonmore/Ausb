'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { AuthGuard } from '@/components/auth/auth-guard';
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
import { offerService } from '@/lib/services';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    profamilyId: 1 // Valor por defecto
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
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching offers from backend...');
      
      const offersData = await offerService.getAllOffers();
      console.log('📋 Offers loaded:', offersData);
      
      setOffers(offersData);
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError('Error al cargar las ofertas');
    } finally {
      setLoading(false);
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
      setError('Error al eliminar la oferta');
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ofertas</h1>
          <p className="text-gray-600 mt-2">Administra las ofertas de trabajo de tu empresa</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Select 
                  value={newOffer.profamilyId.toString()} 
                  onValueChange={(value) => setNewOffer({ ...newOffer, profamilyId: parseInt(value) })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona la familia profesional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Informática y Comunicaciones</SelectItem>
                    <SelectItem value="2">Administración y Gestión</SelectItem>
                    <SelectItem value="3">Sanidad</SelectItem>
                    <SelectItem value="4">Servicios Socioculturales y a la Comunidad</SelectItem>
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
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOffer} disabled={submitting}>
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
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="text-red-600 hover:text-red-700"
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
    </div>
  );
}

export default function OfferManagementPage() {
  return (
    <AuthGuard>
      <OfferManagementContent />
    </AuthGuard>
  );
}
