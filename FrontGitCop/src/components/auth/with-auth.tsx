'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}

export function withRole(allowedRoles: string[]) {
  return function <T extends {}>(Component: React.ComponentType<T>) {
    return function RoleProtectedComponent(props: T) {
      const { user } = useAuthStore();
      const router = useRouter();

      useEffect(() => {
        if (user && !allowedRoles.includes(user.role)) {
          router.push('/dashboard');
        }
      }, [user, router]);

      if (user && !allowedRoles.includes(user.role)) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Acceso Denegado
              </h2>
              <p className="text-gray-600 mb-4">
                No tienes permisos para acceder a esta página
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:underline"
              >
                Volver al dashboard
              </button>
            </div>
          </div>
        );
      }

      return <Component {...props} />;
    };
  };
}
