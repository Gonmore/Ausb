'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = require login, false = require no login
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: AuthGuardProps) {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('auth-storage');
        const hasValidAuth = authData && JSON.parse(authData).state?.user && JSON.parse(authData).state?.token;
        
        if (requireAuth && !hasValidAuth) {
          // Requiere autenticación pero no está logueado - cerrar sesión y redirigir
          console.log('🔐 AuthGuard: No hay autenticación válida, cerrando sesión...');
          logout();
          router.push(redirectTo || '/login');
          return;
        }
        
        if (!requireAuth && hasValidAuth) {
          // No requiere autenticación pero está logueado
          router.push(redirectTo || '/dashboard');
          return;
        }
        
        // Todo está bien
        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ AuthGuard: Error checking auth:', error);
        if (requireAuth) {
          // Error al verificar autenticación - cerrar sesión y redirigir
          logout();
          router.push(redirectTo || '/login');
        } else {
          setIsAuthorized(true);
        }
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, router, logout]);

  if (!mounted) {
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
