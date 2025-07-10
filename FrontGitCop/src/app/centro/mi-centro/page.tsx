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

interface CenterInfo {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  director: string;
  studentsCount: number;
  tutorsCount: number;
  departmentsCount: number;
  foundedYear: number;
}

export default function MiCentroPage() {
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<CenterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Simulando datos del centro
    const mockCenterInfo: CenterInfo = {
      id: 1,
      name: 'IES Francisco de Vitoria',
      description: 'Centro de Formación Profesional especializado en tecnología, administración y sanidad. Comprometidos con la excelencia educativa y la inserción laboral de nuestros estudiantes.',
      address: 'Calle de la Educación, 123',
      city: 'Madrid',
      postalCode: '28001',
      phone: '+34 91 123 45 67',
      email: 'info@iesfvitoria.edu',
      website: 'https://www.iesfvitoria.edu',
      director: 'Dr. María González López',
      studentsCount: 245,
      tutorsCount: 18,
      departmentsCount: 5,
      foundedYear: 1995
    };

    setTimeout(() => {
      setCenterInfo(mockCenterInfo);
      setEditedInfo(mockCenterInfo);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedInfo(centerInfo);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simular guardado
    setTimeout(() => {
      setCenterInfo(editedInfo);
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  const handleInputChange = (field: keyof CenterInfo, value: string | number) => {
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

  if (!centerInfo || !editedInfo) {
    return <div>Error cargando la información del centro</div>;
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
                <p className="text-2xl font-bold text-blue-700">{centerInfo.studentsCount}</p>
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
                <p className="text-2xl font-bold text-green-700">{centerInfo.tutorsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold text-purple-700">{centerInfo.departmentsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <School className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Años de Historia</p>
                <p className="text-2xl font-bold text-orange-700">
                  {new Date().getFullYear() - centerInfo.foundedYear}
                </p>
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
                <p className="mt-1 text-lg font-semibold text-gray-900">{centerInfo.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editedInfo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <p className="mt-1 text-gray-700">{centerInfo.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="director">Director/a</Label>
              {isEditing ? (
                <Input
                  id="director"
                  value={editedInfo.director}
                  onChange={(e) => handleInputChange('director', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{centerInfo.director}</p>
              )}
            </div>

            <div>
              <Label htmlFor="foundedYear">Año de Fundación</Label>
              {isEditing ? (
                <Input
                  id="foundedYear"
                  type="number"
                  value={editedInfo.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{centerInfo.foundedYear}</p>
              )}
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
                  value={editedInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center space-x-2 text-gray-700">
                  <MapPin className="h-4 w-4" />
                  <span>{centerInfo.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editedInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{centerInfo.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Código Postal</Label>
                {isEditing ? (
                  <Input
                    id="postalCode"
                    value={editedInfo.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{centerInfo.postalCode}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center space-x-2 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{centerInfo.phone}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 flex items-center space-x-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>{centerInfo.email}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={editedInfo.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="mt-1"
                  placeholder="https://..."
                />
              ) : (
                centerInfo.website ? (
                  <div className="mt-1 flex items-center space-x-2 text-gray-700">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={centerInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {centerInfo.website}
                    </a>
                  </div>
                ) : (
                  <p className="mt-1 text-gray-500 italic">No especificado</p>
                )
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
              <span>Ver Empresas Colaboradoras</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
