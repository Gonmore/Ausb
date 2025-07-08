'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { 
  GraduationCap, 
  Building2, 
  School, 
  Users, 
  Shield,
  ChevronDown,
  User,
  Home,
  Search,
  BookOpen,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Estudiante',
    color: 'bg-blue-500',
  },
  company: {
    icon: Building2,
    title: 'Empresa',
    color: 'bg-green-500',
  },
  scenter: {
    icon: School,
    title: 'Centro de Estudios',
    color: 'bg-purple-500',
  },
  tutor: {
    icon: Users,
    title: 'Tutor',
    color: 'bg-orange-500',
  },
  admin: {
    icon: Shield,
    title: 'Administrador',
    color: 'bg-red-500',
  },
};

export function ConditionalHeader() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, activeRole, switchRole, getAvailableRoles } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    router.push('/'); // Redirigir al home después del logout
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    router.push('/dashboard'); // Redirigir al dashboard después de cambiar rol
  };

  if (!mounted) {
    return null;
  }

  const getNavigationItems = () => {
    if (!user) {
      // Navegación para usuarios no logueados
      return [
        { href: '/ofertas', label: 'Ver Ofertas', icon: Search },
        { href: '/login', label: 'Iniciar Sesión', icon: User },
        { href: '/registro', label: 'Registrarse', icon: Users },
      ];
    }

    const commonItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/ofertas', label: 'Ofertas', icon: Search },
    ];

    switch (currentRole) {
      case 'student':
        return [
          ...commonItems,
          { href: '/mi-cv', label: 'Mi CV', icon: User },
          { href: '/aplicaciones', label: 'Aplicaciones', icon: BookOpen },
        ];
      case 'company':
        return [
          ...commonItems,
          { href: '/empresa/ofertas', label: 'Mis Ofertas', icon: Building2 },
          { href: '/empresa/buscador-alumnos', label: 'Candidatos', icon: Users },
          { href: '/empresa/mis-alumnos', label: 'Mis Alumnos', icon: GraduationCap },
        ];
      case 'scenter':
        return [
          ...commonItems,
          { href: '/centro/tablon-alumnos', label: 'Tablón de Alumnos', icon: Users },
          { href: '/centro/tutores', label: 'Tutores', icon: User },
          { href: '/centro/mi-centro', label: 'Mi Centro', icon: School },
        ];
      case 'tutor':
        return [
          ...commonItems,
          { href: '/centro/tutores', label: 'Mis Estudiantes', icon: Users },
          { href: '/centro/tutores', label: 'Evaluaciones', icon: BookOpen },
        ];
      default:
        return commonItems;
    }
  };

  const currentRole = activeRole || user?.role || 'student';
  const availableRoles = getAvailableRoles();
  const currentRoleConfig = roleConfig[currentRole];
  const CurrentRoleIcon = currentRoleConfig.icon;
  const navigationItems = getNavigationItems();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <h1 className="text-xl font-bold text-gray-900">Ausbildung</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
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
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {user ? (
              // Usuario logueado - mostrar selector de rol y logout
              <div className="flex items-center space-x-4">
                {/* Selector de rol si hay múltiples roles */}
                {availableRoles.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <div className={`p-1 rounded ${currentRoleConfig.color} text-white`}>
                          <CurrentRoleIcon className="w-3 h-3" />
                        </div>
                        <span className="hidden lg:inline">{currentRoleConfig.title}</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Cambiar Rol</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableRoles.map((role) => {
                        const config = roleConfig[role];
                        const Icon = config.icon;
                        const isActive = role === currentRole;
                        
                        return (
                          <DropdownMenuItem 
                            key={role} 
                            onClick={() => handleRoleSwitch(role)}
                            className="flex items-center gap-2"
                          >
                            <div className={`p-1 rounded ${config.color} text-white`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span>{config.title}</span>
                            {isActive && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                Activo
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* Mostrar rol actual si solo hay uno */}
                {availableRoles.length === 1 && (
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${currentRoleConfig.color} text-white`}>
                      <CurrentRoleIcon className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-600 hidden lg:inline">
                      {currentRoleConfig.title}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Hola, {user.username || user.name || 'Usuario'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            ) : (
              // Usuario no logueado - mostrar login y registro
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu */}
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
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
              
              {user && (
                <div className="px-3 py-2 border-t border-gray-200 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hola, {user.username || user.name || 'Usuario'}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Selector de rol en móvil */}
                  {availableRoles.length > 1 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-2">Cambiar Rol:</div>
                      <div className="space-y-1">
                        {availableRoles.map((role) => {
                          const config = roleConfig[role];
                          const Icon = config.icon;
                          const isActive = role === currentRole;
                          
                          return (
                            <Button
                              key={role}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                handleRoleSwitch(role);
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full justify-start"
                            >
                              <div className={`p-1 rounded ${config.color} text-white mr-2`}>
                                <Icon className="w-3 h-3" />
                              </div>
                              <span>{config.title}</span>
                              {isActive && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Activo
                                </Badge>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
