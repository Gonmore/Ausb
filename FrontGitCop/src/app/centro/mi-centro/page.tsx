'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  GraduationCap, 
  Building2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { scenterService } from '@/lib/services';

interface CenterInfo {
  id: number;
  name: string;
  code?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

interface CenterStats {
  students: number;
  pendingVerifications: number;
  totalVerifications: number;
  tutors: number;
  profamilys: number;
}

interface CenterData {
  scenter: CenterInfo;
  stats: CenterStats;
}

export default function MiCentroPage() {
  const [centerData, setCenterData] = useState<CenterData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<CenterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadCenterData();
  }, []);

  const loadCenterData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await scenterService.getUserScenterInfo();
      
      if (response.data.success) {
        setCenterData(response.data.data);
        setEditedInfo(response.data.data.scenter);
      } else {
        setError('Error al cargar la información del centro');
      }
    } catch (err: any) {
      console.error('Error loading center data:', err);
      setError(err.response?.data?.message || 'Error al cargar la información del centro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (centerData) {
      setEditedInfo(centerData.scenter);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedInfo) return;
    
    setIsSaving(true);
    try {
      // Aquí podríamos implementar la actualización si el backend lo soporta
      // Por ahora solo simulamos el guardado
      setTimeout(() => {
        if (centerData) {
          setCenterData({
            ...centerData,
            scenter: editedInfo
          });
        }
        setIsEditing(false);
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof CenterInfo, value: string | number | boolean) => {
    if (editedInfo) {
      setEditedInfo({ ...editedInfo, [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del centro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !centerData || !editedInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Error cargando la información del centro'}</p>
          <Button onClick={loadCenterData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <School className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mi Centro</h1>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Información
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </div>
        <p className="text-gray-600">
          Gestiona la información y configuración de tu centro educativo
        </p>
      </div>

      {/* Estadísticas del Centro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold text-blue-700">{centerData.stats.students}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tutores</p>
                <p className="text-2xl font-bold text-green-700">{centerData.stats.tutors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Familias Profesionales</p>
                <p className="text-2xl font-bold text-purple-700">{centerData.stats.profamilys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <School className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Verificaciones Pendientes</p>
                <p className="text-2xl font-bold text-orange-700">{centerData.stats.pendingVerifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Datos básicos del centro educativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Centro</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-lg font-semibold text-gray-900">{centerData.scenter.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="code">Código</Label>
              {isEditing ? (
                <Input
                  id="code"
                  value={editedInfo.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{centerData.scenter.code || 'No especificado'}</p>
              )}
            </div>

            <div>
              <Label>Estado</Label>
              <div className="mt-1">
                <Badge variant={centerData.scenter.active ? "default" : "secondary"}>
                  {centerData.scenter.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Datos de contacto y ubicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Dirección</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={editedInfo.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center space-x-2 text-gray-700">
                  <MapPin className="h-4 w-4" />
                  <span>{centerData.scenter.address || 'No especificada'}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="city">Ciudad</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={editedInfo.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{centerData.scenter.city || 'No especificada'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedInfo.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center space-x-2 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{centerData.scenter.phone || 'No especificado'}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedInfo.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center space-x-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>{centerData.scenter.email || 'No especificado'}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Gestión y administración del centro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Gestionar Estudiantes</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <School className="h-6 w-6" />
              <span>Administrar Tutores</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Building2 className="h-6 w-6" />
              <span>Ver Familias Profesionales</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
