'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';

export default function ConfirmationPage() {
  const [user, setUser] = useState<any>(null);
  const [profileType, setProfileType] = useState<string>('');
  const router = useRouter();
  const { setUser: setAuthUser, switchRole } = useAuthStore();

  useEffect(() => {
    // Obtener usuario del store de autenticación
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsedData = JSON.parse(authData);
      if (parsedData.state && parsedData.state.user) {
        setUser(parsedData.state.user);
        setAuthUser(parsedData.state.user);
        switchRole(parsedData.state.activeRole);
        
        // Determinar tipo de perfil
        if (parsedData.state.user.profiles && parsedData.state.user.profiles.length > 0) {
          setProfileType(parsedData.state.user.profiles[0].type);
        }
      } else {
        router.push('/auth');
      }
    } else {
      router.push('/auth');
    }
  }, [router, setAuthUser, switchRole]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleAddProfile = () => {
    // Simular agregar otro perfil
    router.push('/auth/profile-selection');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  const getProfileConfig = () => {
    switch (profileType) {
      case 'student':
        return {
          icon: '👨‍🎓',
          title: 'Estudiante',
          color: 'blue',
          nextSteps: [
            'Completa tu CV profesional',
            'Explora ofertas disponibles',
            'Configura alertas de trabajo',
            'Conecta con empresas'
          ]
        };
      case 'company':
        return {
          icon: '🏢',
          title: 'Empresa',
          color: 'green',
          nextSteps: [
            'Publica tu primera oferta',
            'Explora candidatos disponibles',
            'Configura filtros de búsqueda',
            'Gestiona tu plan de suscripción'
          ]
        };
      case 'center':
        return {
          icon: '🏫',
          title: 'Centro de Estudios',
          color: 'purple',
          nextSteps: [
            'Registra a tus estudiantes',
            'Configura programas formativos',
            'Conecta con empresas',
            'Gestiona prácticas profesionales'
          ]
        };
      default:
        return {
          icon: '👤',
          title: 'Usuario',
          color: 'gray',
          nextSteps: []
        };
    }
  };

  const config = getProfileConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Confirmación principal */}
        <Card className="mb-6 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Icons.CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">¡Perfil creado exitosamente!</CardTitle>
            <CardDescription className="text-lg">
              Tu cuenta está lista para usar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 p-4 bg-green-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.picture} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-xl font-semibold">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center mt-2">
                  <span className="text-2xl mr-2">{config.icon}</span>
                  <Badge variant="outline" className="text-sm">
                    {config.title}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos pasos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">🚀 Próximos pasos</CardTitle>
            <CardDescription>
              Estas son las acciones que puedes realizar ahora:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.nextSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funcionalidad multi-perfil */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Icons.Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">💡 ¿Sabías que puedes tener múltiples perfiles?</h3>
                <p className="text-blue-800 mt-1">
                  Si también tienes una empresa o trabajas en un centro de estudios, puedes agregar esos perfiles a tu cuenta. 
                  Podrás cambiar entre ellos fácilmente desde tu dashboard.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900">Ejemplos de combinaciones:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 👨‍🎓 Estudiante + 🏢 Empresa propia</li>
                    <li>• 🏫 Profesor + 🏢 Consultor independiente</li>
                    <li>• 👨‍🎓 Estudiante + 🏫 Tutor en academia</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoToDashboard}
            className="flex-1 md:flex-none px-8 py-3 text-lg"
            size="lg"
          >
            <Icons.ArrowRight className="mr-2 h-5 w-5" />
            Ir a mi dashboard
          </Button>
          <Button
            variant="outline"
            onClick={handleAddProfile}
            className="flex-1 md:flex-none px-8 py-3 text-lg"
            size="lg"
          >
            <Icons.Plus className="mr-2 h-5 w-5" />
            Agregar otro perfil
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            ¿Necesitas ayuda? Visita nuestro{' '}
            <a href="/ayuda" className="text-blue-600 hover:underline">
              centro de ayuda
            </a>{' '}
            o{' '}
            <a href="/contacto" className="text-blue-600 hover:underline">
              contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
