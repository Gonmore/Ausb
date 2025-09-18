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
  DollarSign
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
}

function OfferManagementContent() {
  const { user, canAccessRole } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
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
    requirements: '',
    salary: '',
    location: '',
    type: 'full-time' as const,
    expiresAt: ''
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
    // Simular carga de ofertas de la empresa
    const mockOffers: Offer[] = [
      {
        id: 1,
        title: 'Desarrollador Frontend React',
        description: 'Buscamos un desarrollador frontend con experiencia en React y TypeScript para unirse a nuestro equipo de desarrollo.',
        requirements: 'React, TypeScript, HTML5, CSS3, Git',
        salary: '€25,000 - €35,000',
        location: 'Madrid, España',
        type: 'full-time',
        status: 'active',
        applications: 24,
        createdAt: '2024-12-01',
        expiresAt: '2025-01-15'
      },
      {
        id: 2,
        title: 'Prácticas Marketing Digital',
        description: 'Oportunidad de prácticas en marketing digital con posibilidad de contratación posterior.',
        requirements: 'Estudios en Marketing, redes sociales, Google Analytics básico',
        salary: '€600/mes',
        location: 'Barcelona, España',
        type: 'internship',
        status: 'active',
        applications: 18,
        createdAt: '2024-11-15',
        expiresAt: '2025-01-30'
      },
      {
        id: 3,
        title: 'Diseñador UX/UI',
        description: 'Diseñador con experiencia en interfaces de usuario y experiencia de usuario para proyectos web.',
        requirements: 'Figma, Adobe XD, Photoshop, experiencia en diseño web',
        salary: '€22,000 - €28,000',
        location: 'Valencia, España',
        type: 'full-time',
        status: 'draft',
        applications: 0,
        createdAt: '2024-12-10',
        expiresAt: '2025-02-01'
      }
    ];
    setOffers(mockOffers);
  }, []);

  const filteredOffers = offers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOffer = () => {
    const offer: Offer = {
      id: Date.now(),
      ...newOffer,
      status: 'draft',
      applications: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOffers([...offers, offer]);
    setNewOffer({
      title: '',
      description: '',
      requirements: '',
      salary: '',
      location: '',
      type: 'full-time',
      expiresAt: ''
    });
    setIsCreateModalOpen(false);
  };

  const handleDeleteOffer = (id: number) => {
    setOffers(offers.filter(offer => offer.id !== id));
  };

  const handleStatusToggle = (id: number) => {
    setOffers(offers.map(offer => 
      offer.id === id 
        ? { ...offer, status: offer.status === 'active' ? 'inactive' : 'active' as const }
        : offer
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      case 'freelance': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 text-white rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestión de Ofertas</h1>
              <p className="text-muted-foreground">Administra las ofertas de trabajo de tu empresa</p>
            </div>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Oferta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Oferta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Puesto</Label>
                  <Input
                    id="title"
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                    placeholder="Ej: Desarrollador Frontend React"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo de Empleo</Label>
                    <Select value={newOffer.type} onValueChange={(value: string) => setNewOffer({...newOffer, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
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
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={newOffer.location}
                      onChange={(e) => setNewOffer({...newOffer, location: e.target.value})}
                      placeholder="Ej: Madrid, España"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="salary">Salario</Label>
                  <Input
                    id="salary"
                    value={newOffer.salary}
                    onChange={(e) => setNewOffer({...newOffer, salary: e.target.value})}
                    placeholder="Ej: €25,000 - €35,000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                    placeholder="Describe el puesto y responsabilidades..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="requirements">Requisitos</Label>
                  <Textarea
                    id="requirements"
                    value={newOffer.requirements}
                    onChange={(e) => setNewOffer({...newOffer, requirements: e.target.value})}
                    placeholder="Lista los requisitos técnicos y de experiencia..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiresAt">Fecha de Expiración</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newOffer.expiresAt}
                    onChange={(e) => setNewOffer({...newOffer, expiresAt: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateOffer}>
                    Crear Oferta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offers.filter(o => o.status === 'active').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aplicaciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offers.reduce((acc, o) => acc + o.applications, 0)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offers.filter(o => o.status === 'draft').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio Aplicaciones</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {offers.length > 0 ? Math.round(offers.reduce((acc, o) => acc + o.applications, 0) / offers.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar ofertas por título o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{offer.title}</h3>
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status === 'active' ? 'Activa' : 
                         offer.status === 'inactive' ? 'Inactiva' : 'Borrador'}
                      </Badge>
                      <Badge className={getTypeColor(offer.type)}>
                        {offer.type === 'full-time' ? 'Tiempo Completo' :
                         offer.type === 'part-time' ? 'Tiempo Parcial' :
                         offer.type === 'internship' ? 'Prácticas' : 'Freelance'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {offer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {offer.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {offer.applications} aplicaciones
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expira: {new Date(offer.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(offer.id)}
                    >
                      {offer.status === 'active' ? 'Desactivar' : 'Activar'}
                    </Button>
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
    </div>
  );
}

export default function OfferManagementPage() {
  return (
    <AuthGuard requireAuth>
      <OfferManagementContent />
    </AuthGuard>
  );
}
