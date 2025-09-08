'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export function TokenGuard({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    // Función para verificar si el token está expirado
    const checkTokenExpiration = () => {
      try {
        // Decodificar el JWT (solo la parte del payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        // Si el token ha expirado
        if (payload.exp < currentTime) {
          console.log('🔥 Token expirado detectado en TokenGuard');
          logout();
          router.push('/login?expired=true');
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        logout();
        router.push('/login?error=invalid_token');
      }
    };

    // Verificar inmediatamente
    checkTokenExpiration();

    // Verificar cada 30 segundos
    const interval = setInterval(checkTokenExpiration, 30000);

    return () => clearInterval(interval);
  }, [token, logout, router]);

  return <>{children}</>;
}