'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      // Simulación de autenticación social
      console.log(`🔐 Autenticando con ${provider}...`);
      
      // Simular datos de usuario de red social
      const mockSocialUser = {
        id: `${provider}_123456`,
        name: provider === 'google' ? 'María García' : 'Juan Pérez',
        email: provider === 'google' ? 'maria@gmail.com' : 'juan@facebook.com',
        picture: `https://ui-avatars.com/api/?name=${provider === 'google' ? 'María García' : 'Juan Pérez'}&background=random`,
        provider
      };

      // Guardar datos temporales en localStorage
      localStorage.setItem('temp-social-user', JSON.stringify(mockSocialUser));
      
      // Redirigir a selección de perfil
      router.push('/auth/profile-selection');
    } catch (error) {
      console.error('Error en autenticación social:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    // Por ahora redirigir a selección de perfil con datos de ejemplo
    const mockEmailUser = {
      id: 'email_123456',
      name: 'Usuario Email',
      email: 'usuario@email.com',
      picture: 'https://ui-avatars.com/api/?name=Usuario Email&background=random',
      provider: 'email'
    };
    
    localStorage.setItem('temp-social-user', JSON.stringify(mockEmailUser));
    router.push('/auth/profile-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Icons.GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">🎓 FPRAX</CardTitle>
          <CardDescription>
            Inicia sesión o regístrate para acceder a tu plataforma educativa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            <Icons.Google className="mr-2 h-4 w-4" />
            Continuar con Google
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
          >
            <Icons.Facebook className="mr-2 h-4 w-4" />
            Continuar con Facebook
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleEmailLogin}
            disabled={isLoading}
          >
            <Icons.Mail className="mr-2 h-4 w-4" />
            Continuar con Email
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Al continuar, aceptas nuestros{' '}
            <a href="/terminos-condiciones" className="underline underline-offset-4 hover:text-primary">
              Términos y Condiciones
            </a>{' '}
            y{' '}
            <a href="/politica-privacidad" className="underline underline-offset-4 hover:text-primary">
              Política de Privacidad
            </a>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
