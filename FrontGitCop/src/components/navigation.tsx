'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Building, 
  Users, 
  BookOpen, 
  User, 
  LogOut, 
  Menu,
  X,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const getNavigationItems = () => {
    if (!user) return [];

    const commonItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/ofertas', label: 'Ofertas', icon: Search },
    ];

    switch (user.role) {
      case 'student':
        return [
          ...commonItems,
          { href: '/mi-cv', label: 'Mi CV', icon: User },
          { href: '/aplicaciones', label: 'Aplicaciones', icon: BookOpen },
        ];
      case 'company':
        return [
          ...commonItems,
          { href: '/empresa/ofertas', label: 'Mis Ofertas', icon: Building },
          { href: '/empresa/aplicaciones', label: 'Aplicaciones', icon: Users },
          { href: '/empresa/buscador-alumnos', label: 'Buscar Alumnos', icon: Search },
        ];
      case 'scenter':
        return [
          ...commonItems,
          { href: '/estudiantes', label: 'Estudiantes', icon: Users },
          { href: '/tutores', label: 'Tutores', icon: User },
        ];
      case 'tutor':
        return [
          ...commonItems,
          { href: '/mis-estudiantes', label: 'Mis Estudiantes', icon: Users },
          { href: '/evaluaciones', label: 'Evaluaciones', icon: BookOpen },
        ];
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                Ausbildung
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-sm text-gray-600">
                Hola, {user.name}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push('/'); // Redirigir al home después del logout
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="px-3 py-2 border-t border-gray-200 mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hola, {user.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      router.push('/'); // Redirigir al home después del logout
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
