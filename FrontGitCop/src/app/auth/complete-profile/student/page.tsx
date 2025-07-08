'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  program: string;
  studyCenter: string;
  studyYear: string;
  graduationDate: string;
  jobTypes: string[];
  preferredLocations: string[];
  industries: string[];
}

export default function StudentProfilePage() {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    program: '',
    studyCenter: '',
    studyYear: '',
    graduationDate: '',
    jobTypes: [],
    preferredLocations: [],
    industries: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const tempUser = localStorage.getItem('temp-social-user');
    const profileType = localStorage.getItem('selected-profile-type');
    
    if (tempUser && profileType === 'student') {
      const user = JSON.parse(tempUser);
      setSocialUser(user);
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
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
      console.log('🎓 Creando perfil de estudiante...', formData);
      
      // Crear el usuario completo
      const completeUser = {
        ...socialUser,
        profiles: [{
          id: 'student_1',
          type: 'student',
          name: formData.name,
          data: {
            phone: formData.phone,
            program: formData.program,
            studyCenter: formData.studyCenter,
            studyYear: formData.studyYear,
            graduationDate: formData.graduationDate,
            preferences: {
              jobTypes: formData.jobTypes,
              locations: formData.preferredLocations,
              industries: formData.industries
            }
          },
          isActive: true,
          createdAt: new Date().toISOString()
        }],
        activeProfileId: 'student_1',
        role: 'student', // Para compatibilidad con el sistema actual
        name: formData.name,
        createdAt: new Date().toISOString()
      };

      // Guardar en el store de autenticación
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: completeUser,
          activeRole: 'student',
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

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: checked 
        ? [...prev.jobTypes, jobType]
        : prev.jobTypes.filter(t => t !== jobType)
    }));
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: checked 
        ? [...prev.preferredLocations, location]
        : prev.preferredLocations.filter(l => l !== location)
    }));
  };

  const handleIndustryChange = (industry: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      industries: checked 
        ? [...prev.industries, industry]
        : prev.industries.filter(i => i !== industry)
    }));
  };

  if (!socialUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Icons.GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">👨‍🎓 Completa tu perfil de estudiante</CardTitle>
                <CardDescription>
                  Algunos datos ya están prellenados desde tu cuenta social
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
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
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+34 600 000 000"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información académica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información académica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program">Programa de estudios</Label>
                  <Select value={formData.program} onValueChange={(value) => setFormData(prev => ({ ...prev, program: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informatica">Ingeniería Informática</SelectItem>
                      <SelectItem value="electronica">Ingeniería Electrónica</SelectItem>
                      <SelectItem value="mecanica">Ingeniería Mecánica</SelectItem>
                      <SelectItem value="administracion">Administración de Empresas</SelectItem>
                      <SelectItem value="marketing">Marketing Digital</SelectItem>
                      <SelectItem value="diseno">Diseño Gráfico</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="studyCenter">Centro de estudios</Label>
                  <Input
                    id="studyCenter"
                    value={formData.studyCenter}
                    onChange={(e) => setFormData(prev => ({ ...prev, studyCenter: e.target.value }))}
                    placeholder="Universidad/Instituto"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studyYear">Año de estudio</Label>
                  <Select value={formData.studyYear} onValueChange={(value) => setFormData(prev => ({ ...prev, studyYear: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1er año</SelectItem>
                      <SelectItem value="2">2do año</SelectItem>
                      <SelectItem value="3">3er año</SelectItem>
                      <SelectItem value="4">4to año</SelectItem>
                      <SelectItem value="graduado">Graduado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="graduationDate">Fecha de graduación</Label>
                  <Input
                    id="graduationDate"
                    type="date"
                    value={formData.graduationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, graduationDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferencias laborales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferencias laborales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipos de empleo */}
              <div>
                <Label className="text-base font-medium">Tipos de empleo que te interesan</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'Prácticas profesionales',
                    'Tiempo parcial',
                    'Tiempo completo',
                    'Trabajo remoto',
                    'Proyecto freelance',
                    'Voluntariado'
                  ].map((jobType) => (
                    <div key={jobType} className="flex items-center space-x-2">
                      <Checkbox
                        id={jobType}
                        checked={formData.jobTypes.includes(jobType)}
                        onCheckedChange={(checked) => handleJobTypeChange(jobType, checked as boolean)}
                      />
                      <Label htmlFor={jobType} className="text-sm font-normal">
                        {jobType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ubicaciones */}
              <div>
                <Label className="text-base font-medium">Ubicaciones preferidas</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'Madrid',
                    'Barcelona',
                    'Valencia',
                    'Sevilla',
                    'Bilbao',
                    'Trabajo remoto'
                  ].map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={formData.preferredLocations.includes(location)}
                        onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                      />
                      <Label htmlFor={location} className="text-sm font-normal">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industrias */}
              <div>
                <Label className="text-base font-medium">Industrias de interés</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {[
                    'Tecnología',
                    'Finanzas',
                    'Salud',
                    'Educación',
                    'Marketing',
                    'Diseño',
                    'Consultoría',
                    'Startup'
                  ].map((industry) => (
                    <div key={industry} className="flex items-center space-x-2">
                      <Checkbox
                        id={industry}
                        checked={formData.industries.includes(industry)}
                        onCheckedChange={(checked) => handleIndustryChange(industry, checked as boolean)}
                      />
                      <Label htmlFor={industry} className="text-sm font-normal">
                        {industry}
                      </Label>
                    </div>
                  ))}
                </div>
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
