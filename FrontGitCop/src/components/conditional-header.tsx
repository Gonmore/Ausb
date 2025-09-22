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
import { FpraxLogo } from '@/components/ui/logos/FpraxLogo';
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
  LogOut,
  Star,
  Loader2,
  Briefcase,
  Brain,
  CreditCard,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/NotificationCenter';

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

// Componente de Tokens
function TokenDisplay() {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token, user, activeRole } = useAuthStore();
  const router = useRouter(); // 🔥 AGREGAR useRouter

  useEffect(() => {
    const fetchTokens = async () => {
      // Solo mostrar para empresas
      if (!token || (activeRole || user?.role) !== 'company') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/students/tokens/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTokens(data.balance);
        }
      } catch (error) {
        console.error('Error cargando tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, [token, user, activeRole]);

  // 🔥 FUNCIÓN PARA NAVEGAR A LA PÁGINA DE TOKENS
  const handleTokenClick = () => {
    router.push('/empresa/tokens');
  };

  // Solo mostrar para empresas
  if (!token || (activeRole || user?.role) !== 'company') return null;

  // 🔥 MEJORAR EL DISEÑO Y HACER CLICKEABLE
  return (
    <button 
      onClick={handleTokenClick}
      className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full border border-purple-200 shadow-sm hover:bg-purple-100 hover:shadow-md transition-all duration-200 cursor-pointer"
      title="Gestionar tokens" // Tooltip
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
      ) : (
        <Star className="w-4 h-4 text-purple-600" />
      )}
      <span className="text-sm font-medium text-purple-700">
        {loading ? 'Cargando...' : `${tokens} tokens`}
      </span>
      
      {/* 🔥 INDICADORES VISUALES PARA TOKENS BAJOS */}
      {!loading && tokens === 0 && (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      )}
      {!loading && tokens > 0 && tokens < 10 && (
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      )}
    </button>
  );
}

export function ConditionalHeader() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, activeRole, switchRole, getAvailableRoles, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Mostrar confirmación
      if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Ejecutar logout
        logout();
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Forzar limpieza y redirección en caso de error
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
    }
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
      // Navegación para usuarios no logueados - solo ofertas públicas
      return [
        { href: '/ofertas', label: 'Ver Ofertas', icon: Search },
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
          { href: '/dashboard', label: 'Dashboard', icon: Home },
          { href: '/ofertas', label: 'Ofertas', icon: Search },
          { href: '/empresa/ofertas', label: 'Mis Ofertas', icon: Building2 },
          { href: '/empresa/buscador-alumnos', label: 'Candidatos', icon: Users },
          // El Buscador Inteligente NO va en el menú principal
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
    <header className="fprax-nav shadow-lg border-b-4" style={{ backgroundColor: '#0092DB', borderBottomColor: '#851B87' }}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <FpraxLogo size="sm" variant="negative" />
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={cn(
                    'fprax-nav-link flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300',
                    pathname === item.href
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-white hover:bg-blue-700 hover:text-white'
                  )}
                  style={pathname === item.href ? { 
                    backgroundColor: 'var(--fprax-blue)',
                    boxShadow: 'var(--fprax-shadow-md)'
                  } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {user ? (
              // Usuario logueado - mostrar selector de rol, tokens y logout
              <div className="flex items-center space-x-4">
                {/* 🔥 DISPLAY DE TOKENS - Solo para empresas */}
                <TokenDisplay />
                
                {/* 🔥 CENTRO DE NOTIFICACIONES - Solo para usuarios logueados */}
                <NotificationCenter />
                
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
                  <span className="text-sm font-medium text-white">
                    Hola, <span className="text-orange-300">{user.username || user.name || 'Usuario'}</span>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="p-2 border-2 border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // Usuario no logueado - mostrar login y registro
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
              style={{ color: 'var(--fprax-blue)' }}
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
          <div className="md:hidden fprax-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t" style={{ backgroundColor: 'var(--fprax-light-gray)', borderColor: 'var(--fprax-blue)' }}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'fprax-nav-link flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-all duration-300',
                      pathname === item.href
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    )}
                    style={pathname === item.href ? { 
                      backgroundColor: 'var(--fprax-blue)',
                      boxShadow: 'var(--fprax-shadow-md)'
                    } : {}}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {user ? (
                <div className="px-3 py-2 border-t mt-3" style={{ borderColor: 'var(--fprax-blue)' }}>
                  {/* 🔥 TOKENS EN MÓVIL - Solo para empresas */}
                  {(activeRole || user?.role) === 'company' && (
                    <div className="mb-3">
                      <TokenDisplay />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium" style={{ color: 'var(--fprax-dark-gray)' }}>
                      Hola, <span style={{ color: 'var(--fprax-blue)' }}>{user.username || user.name || 'Usuario'}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-fprax-outline p-2 border-2"
                      style={{ 
                        color: 'var(--fprax-blue)',
                        borderColor: 'var(--fprax-blue)'
                      }}
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
              ) : (
                // Usuario no autenticado en móvil - mostrar botones de login y registro
                <div className="px-3 py-2 border-t mt-3 space-y-2" style={{ borderColor: 'var(--fprax-blue)' }}>
                  <Link href="/login" className="block">
                    <Button variant="outline" size="sm" className="w-full btn-fprax-outline border-2" style={{ 
                      color: 'var(--fprax-blue)',
                      borderColor: 'var(--fprax-blue)'
                    }} onClick={() => setIsMobileMenuOpen(false)}>
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/registro" className="block">
                    <Button size="sm" className="w-full btn-fprax-primary" style={{ 
                      backgroundColor: 'var(--fprax-blue)',
                      color: 'white'
                    }} onClick={() => setIsMobileMenuOpen(false)}>
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
