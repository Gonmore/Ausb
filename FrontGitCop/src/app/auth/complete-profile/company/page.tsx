'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface SocialUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: string;
}

interface CompanyFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  position: string;
  companyName: string;
  cif: string;
  sector: string;
  companySize: string;
  address: string;
  website: string;
  description: string;
  subscription: 'basic' | 'premium';
}

export default function CompanyProfilePage() {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    position: '',
    companyName: '',
    cif: '',
    sector: '',
    companySize: '',
    address: '',
    website: '',
    description: '',
    subscription: 'basic'
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const tempUser = localStorage.getItem('temp-social-user');
    const profileType = localStorage.getItem('selected-profile-type');
    
    if (tempUser && profileType === 'company') {
      const user = JSON.parse(tempUser);
      setSocialUser(user);
      setFormData(prev => ({
        ...prev,
        contactName: user.name,
        contactEmail: user.email
      }));
    } else {
      router.push('/auth/profile-selection');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simular creación del perfil
      console.log('🏢 Creando perfil de empresa...', formData);
      
      // Crear el usuario completo
      const completeUser = {
        ...socialUser,
        profiles: [{
          id: 'company_1',
          type: 'company',
          name: formData.contactName,
          data: {
            contactPhone: formData.contactPhone,
            position: formData.position,
            companyName: formData.companyName,
            cif: formData.cif,
            sector: formData.sector,
            companySize: formData.companySize,
            address: formData.address,
            website: formData.website,
            description: formData.description,
            subscription: formData.subscription,
            credits: formData.subscription === 'premium' ? 100 : 10
          },
          isActive: true,
          createdAt: new Date().toISOString()
        }],
        activeProfileId: 'company_1',
        role: 'company', // Para compatibilidad con el sistema actual
        name: formData.contactName,
        createdAt: new Date().toISOString()
      };

      // Guardar en el store de autenticación
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: completeUser,
          activeRole: 'company',
          isAuthenticated: true
        }
      }));

      // Limpiar datos temporales
      localStorage.removeItem('temp-social-user');
      localStorage.removeItem('selected-profile-type');

      // Redirigir a confirmación
      router.push('/auth/confirmation');
    } catch (error) {
      console.error('Error creando perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!socialUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Icons.Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">🏢 Completa tu perfil de empresa</CardTitle>
                <CardDescription>
                  Información de contacto y detalles de tu empresa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={socialUser.picture} alt={socialUser.name} />
                  <AvatarFallback>{socialUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{socialUser.name}</p>
                  <p className="text-sm text-muted-foreground">{socialUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Nombre completo</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Teléfono</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+34 900 000 000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="position">Cargo en la empresa</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="cto">CTO</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información de la empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nombre de la empresa</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cif">CIF/NIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                    placeholder="A12345678"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Select value={formData.sector} onValueChange={(value) => setFormData(prev => ({ ...prev, sector: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnologia">Tecnología</SelectItem>
                      <SelectItem value="finanzas">Finanzas</SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="consultoria">Consultoría</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufactura">Manufactura</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="companySize">Tamaño de la empresa</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Número de empleados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-200">51-200 empleados</SelectItem>
                      <SelectItem value="201-500">201-500 empleados</SelectItem>
                      <SelectItem value="500+">500+ empleados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle, número, ciudad, código postal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="website">Sitio web (opcional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción de la empresa</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe brevemente tu empresa, su misión y valores..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Plan de suscripción */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan de suscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plan Básico */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.subscription === 'basic' ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, subscription: 'basic' }))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">🆓 Plan Básico</CardTitle>
                      <Badge variant="outline">Gratis</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        2 ofertas activas
                      </li>
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        10 créditos para CVs
                      </li>
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        Soporte por email
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Plan Premium */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    formData.subscription === 'premium' ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, subscription: 'premium' }))}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">💎 Plan Premium</CardTitle>
                      <Badge>€49/mes</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        Ofertas ilimitadas
                      </li>
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        100 créditos para CVs
                      </li>
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        Estadísticas avanzadas
                      </li>
                      <li className="flex items-center">
                        <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                        Soporte prioritario
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                💡 Puedes cambiar de plan en cualquier momento desde tu dashboard
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/auth/profile-selection')}
            >
              ← Volver
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Creando perfil...
                </>
              ) : (
                'Crear mi perfil'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
