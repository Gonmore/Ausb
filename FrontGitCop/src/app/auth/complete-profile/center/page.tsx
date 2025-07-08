'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SocialUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: string;
}

interface CenterFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  position: string;
  centerName: string;
  centerCode: string;
  centerType: string;
  address: string;
  website: string;
  description: string;
  programs: string[];
  customPrograms: string[];
}

export default function CenterProfilePage() {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [formData, setFormData] = useState<CenterFormData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    position: '',
    centerName: '',
    centerCode: '',
    centerType: '',
    address: '',
    website: '',
    description: '',
    programs: [],
    customPrograms: []
  });
  const [customProgram, setCustomProgram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const tempUser = localStorage.getItem('temp-social-user');
    const profileType = localStorage.getItem('selected-profile-type');
    
    if (tempUser && profileType === 'center') {
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
      console.log('🏫 Creando perfil de centro de estudios...', formData);
      
      // Crear el usuario completo
      const completeUser = {
        ...socialUser,
        profiles: [{
          id: 'center_1',
          type: 'center',
          name: formData.contactName,
          data: {
            contactPhone: formData.contactPhone,
            position: formData.position,
            centerName: formData.centerName,
            centerCode: formData.centerCode,
            centerType: formData.centerType,
            address: formData.address,
            website: formData.website,
            description: formData.description,
            programs: [...formData.programs, ...formData.customPrograms]
          },
          isActive: true,
          createdAt: new Date().toISOString()
        }],
        activeProfileId: 'center_1',
        role: 'center', // Para compatibilidad con el sistema actual
        name: formData.contactName,
        createdAt: new Date().toISOString()
      };

      // Guardar en el store de autenticación
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: completeUser,
          activeRole: 'center',
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

  const handleProgramChange = (program: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      programs: checked 
        ? [...prev.programs, program]
        : prev.programs.filter(p => p !== program)
    }));
  };

  const addCustomProgram = () => {
    if (customProgram.trim() && !formData.customPrograms.includes(customProgram.trim())) {
      setFormData(prev => ({
        ...prev,
        customPrograms: [...prev.customPrograms, customProgram.trim()]
      }));
      setCustomProgram('');
    }
  };

  const removeCustomProgram = (program: string) => {
    setFormData(prev => ({
      ...prev,
      customPrograms: prev.customPrograms.filter(p => p !== program)
    }));
  };

  if (!socialUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Icons.School className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">🏫 Completa tu perfil de centro de estudios</CardTitle>
                <CardDescription>
                  Información institucional y programas que ofrece tu centro
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
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
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
                <Label htmlFor="position">Cargo en el centro</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="director">Director/a</SelectItem>
                    <SelectItem value="coordinador">Coordinador/a</SelectItem>
                    <SelectItem value="jefe-estudios">Jefe/a de Estudios</SelectItem>
                    <SelectItem value="secretario">Secretario/a</SelectItem>
                    <SelectItem value="orientador">Orientador/a</SelectItem>
                    <SelectItem value="profesor">Profesor/a</SelectItem>
                    <SelectItem value="administrativo">Administrativo/a</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información del centro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del centro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="centerName">Nombre del centro</Label>
                  <Input
                    id="centerName"
                    value={formData.centerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, centerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="centerCode">Código de centro</Label>
                  <Input
                    id="centerCode"
                    value={formData.centerCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, centerCode: e.target.value }))}
                    placeholder="Código oficial del centro"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="centerType">Tipo de centro</Label>
                <Select value={formData.centerType} onValueChange={(value) => setFormData(prev => ({ ...prev, centerType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universidad">Universidad</SelectItem>
                    <SelectItem value="universidad-privada">Universidad Privada</SelectItem>
                    <SelectItem value="fp">Centro de Formación Profesional</SelectItem>
                    <SelectItem value="instituto">Instituto de Educación Secundaria</SelectItem>
                    <SelectItem value="escuela-negocio">Escuela de Negocios</SelectItem>
                    <SelectItem value="centro-privado">Centro Privado</SelectItem>
                    <SelectItem value="academia">Academia</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Dirección del centro</Label>
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
                  placeholder="https://www.centro.edu"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción del centro</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu centro educativo, su misión y valores..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Programas formativos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Programas formativos</CardTitle>
              <CardDescription>
                Selecciona los programas que ofrece tu centro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Ingeniería Informática',
                  'Ingeniería Industrial',
                  'Administración de Empresas',
                  'Marketing Digital',
                  'Diseño Gráfico',
                  'Desarrollo Web',
                  'Mecatrónica',
                  'Electricidad y Electrónica',
                  'Hostelería y Turismo',
                  'Comercio Internacional',
                  'Recursos Humanos',
                  'Contabilidad y Finanzas'
                ].map((program) => (
                  <div key={program} className="flex items-center space-x-2">
                    <Checkbox
                      id={program}
                      checked={formData.programs.includes(program)}
                      onCheckedChange={(checked) => handleProgramChange(program, checked as boolean)}
                    />
                    <Label htmlFor={program} className="text-sm font-normal">
                      {program}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Programas personalizados */}
              <div className="mt-6">
                <Label className="text-base font-medium">Agregar programa personalizado</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={customProgram}
                    onChange={(e) => setCustomProgram(e.target.value)}
                    placeholder="Nombre del programa"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomProgram())}
                  />
                  <Button
                    type="button"
                    onClick={addCustomProgram}
                    disabled={!customProgram.trim()}
                  >
                    <Icons.Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lista de programas personalizados */}
              {formData.customPrograms.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Programas personalizados:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.customPrograms.map((program) => (
                      <div key={program} className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                        <span>{program}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomProgram(program)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <Icons.X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
