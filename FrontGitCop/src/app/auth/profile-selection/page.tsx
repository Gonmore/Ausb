'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SocialUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  provider: string;
}

export default function ProfileSelectionPage() {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const tempUser = localStorage.getItem('temp-social-user');
    if (tempUser) {
      setSocialUser(JSON.parse(tempUser));
    } else {
      router.push('/auth');
    }
  }, [router]);

  const handleProfileSelection = (profileType: string) => {
    if (!socialUser) return;
    
    // Guardar el tipo de perfil seleccionado
    localStorage.setItem('selected-profile-type', profileType);
    
    // Redirigir al formulario específico
    router.push(`/auth/complete-profile/${profileType}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header con info del usuario */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={socialUser.picture} alt={socialUser.name} />
                <AvatarFallback>{socialUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">¡Hola {socialUser.name}! 👋</CardTitle>
                <CardDescription className="text-lg">
                  Para completar tu registro, selecciona el tipo de perfil que quieres crear
                </CardDescription>
                <Badge variant="outline" className="mt-2">
                  {socialUser.provider === 'google' ? '🔵 Google' : 
                   socialUser.provider === 'facebook' ? '📘 Facebook' : 
                   '✉️ Email'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Opciones de perfil */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Estudiante */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProfile === 'student' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedProfile('student')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Icons.GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">👨‍🎓 SOY ESTUDIANTE</CardTitle>
              <CardDescription>
                Busco oportunidades laborales y quiero desarrollar mi carrera profesional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Buscar ofertas de trabajo
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Crear y gestionar mi CV
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Conectar con empresas
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Acceder a prácticas profesionales
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProfile === 'company' ? 'ring-2 ring-green-500 bg-green-50' : ''
            }`}
            onClick={() => setSelectedProfile('company')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Icons.Building className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">🏢 REPRESENTO UNA EMPRESA</CardTitle>
              <CardDescription>
                Busco talento joven y quiero publicar ofertas de empleo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Publicar ofertas de trabajo
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Buscar talento especializado
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Gestionar candidatos
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Acceder a CVs exclusivos
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Centro de Estudios */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedProfile === 'center' ? 'ring-2 ring-purple-500 bg-purple-50' : ''
            }`}
            onClick={() => setSelectedProfile('center')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Icons.School className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">🏫 SOY DE UN CENTRO DE ESTUDIOS</CardTitle>
              <CardDescription>
                Gestiono estudiantes y programas formativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Gestionar estudiantes
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Supervisar programas
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Conectar con empresas
                </li>
                <li className="flex items-center">
                  <Icons.Check className="h-4 w-4 text-green-500 mr-2" />
                  Facilitar prácticas
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/auth')}
          >
            ← Volver
          </Button>
          <Button
            onClick={() => selectedProfile && handleProfileSelection(selectedProfile)}
            disabled={!selectedProfile}
            className="px-8"
          >
            Continuar
            <Icons.ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Nota sobre múltiples perfiles */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-blue-800">
              <Icons.Info className="h-5 w-5" />
              <span className="font-medium">💡 ¿Sabías que puedes tener múltiples perfiles?</span>
            </div>
            <p className="text-blue-700 mt-2 ml-7">
              Después de crear tu primer perfil, podrás agregar otros tipos (por ejemplo, si eres estudiante y también trabajas en una empresa). Podrás cambiar entre ellos fácilmente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
