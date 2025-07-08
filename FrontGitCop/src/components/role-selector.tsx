'use client';

import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Building2, 
  School, 
  Users, 
  Shield,
  ChevronRight 
} from 'lucide-react';

interface RoleSelectorProps {
  onRoleSelected?: (role: UserRole) => void;
  showCurrent?: boolean;
}

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Estudiante',
    description: 'Busca ofertas de trabajo y gestiona tu CV',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  company: {
    icon: Building2,
    title: 'Empresa',
    description: 'Publica ofertas y busca talento',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  scenter: {
    icon: School,
    title: 'Centro de Estudios',
    description: 'Gestiona estudiantes y programas formativos',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  tutor: {
    icon: Users,
    title: 'Tutor',
    description: 'Supervisa y apoya a los estudiantes',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  admin: {
    icon: Shield,
    title: 'Administrador',
    description: 'Gestiona la plataforma y usuarios',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export default function RoleSelector({ onRoleSelected, showCurrent = true }: RoleSelectorProps) {
  const { user, activeRole, switchRole, getAvailableRoles } = useAuthStore();

  if (!user) return null;

  const availableRoles = getAvailableRoles();
  const currentRole = activeRole || user.role;

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    onRoleSelected?.(role);
  };

  if (availableRoles.length <= 1) {
    // Si solo hay un rol disponible, mostrar solo el actual
    if (!showCurrent) return null;
    
    const config = roleConfig[currentRole];
    const Icon = config.icon;
    
    return (
      <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                Rol Actual
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {showCurrent ? 'Cambiar Rol' : 'Seleccionar Rol'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Tienes acceso a múltiples roles. Selecciona el que deseas usar.
        </p>
      </div>

      <div className="grid gap-3">
        {availableRoles.map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const isActive = role === currentRole;

          return (
            <Card
              key={role}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isActive 
                  ? `${config.bgColor} ${config.borderColor} border-2`
                  : 'border hover:border-gray-300'
              }`}
              onClick={() => handleRoleSelect(role)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {config.title}
                        {isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showCurrent && (
        <div className="text-center text-sm text-muted-foreground">
          Rol actual: <span className="font-semibold">{roleConfig[currentRole].title}</span>
        </div>
      )}
    </div>
  );
}
