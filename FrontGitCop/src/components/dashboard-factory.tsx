'use client';

import Link from 'next/link';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Building2, 
  School, 
  Users, 
  Shield,
  BarChart3,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react';

// Importar los dashboards específicos cuando los creemos
// import StudentDashboard from './dashboards/student-dashboard';
// import CompanyDashboard from './dashboards/company-dashboard';
// import StudyCenterDashboard from './dashboards/study-center-dashboard';
// import TutorDashboard from './dashboards/tutor-dashboard';
// import AdminDashboard from './dashboards/admin-dashboard';

interface DashboardFactoryProps {
  role: UserRole;
}

// Dashboard temporal para estudiantes (ya existente)
function StudentDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6 fprax-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 text-white rounded-lg" style={{ background: 'var(--fprax-gradient-primary)' }}>
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-fprax" style={{ color: 'var(--fprax-dark-gray)' }}>
            Dashboard Estudiante
          </h1>
          <p className="text-muted-foreground font-fprax">
            Bienvenido/a <span style={{ color: 'var(--fprax-blue)' }}>{user?.name || 'Estudiante'}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="fprax-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" 
                     style={{ background: 'var(--fprax-blue)', color: 'white', borderRadius: '12px 12px 0 0' }}>
            <CardTitle className="text-sm font-medium text-white">Aplicaciones</CardTitle>
            <Target className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-fprax" style={{ color: 'var(--fprax-blue)' }}>12</div>
            <p className="text-xs text-muted-foreground">+2 esta semana</p>
          </CardContent>
        </Card>

        <Card className="fprax-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"
                     style={{ background: 'var(--fprax-purple)', color: 'white', borderRadius: '12px 12px 0 0' }}>
            <CardTitle className="text-sm font-medium text-white">Ofertas Vistas</CardTitle>
            <BarChart3 className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-fprax" style={{ color: 'var(--fprax-purple)' }}>47</div>
            <p className="text-xs text-muted-foreground">+12 esta semana</p>
          </CardContent>
        </Card>

        <Card className="fprax-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"
                     style={{ background: 'var(--fprax-pink)', color: 'white', borderRadius: '12px 12px 0 0' }}>
            <CardTitle className="text-sm font-medium text-white">Perfil Completado</CardTitle>
            <TrendingUp className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-fprax" style={{ color: 'var(--fprax-pink)' }}>85%</div>
            <p className="text-xs text-muted-foreground">Muy bueno</p>
          </CardContent>
        </Card>

        <Card className="fprax-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"
                     style={{ background: 'var(--fprax-orange)', color: 'white', borderRadius: '12px 12px 0 0' }}>
            <CardTitle className="text-sm font-medium text-white">Última Actividad</CardTitle>
            <Clock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold font-fprax" style={{ color: 'var(--fprax-orange)' }}>2h</div>
            <p className="text-xs text-muted-foreground">Hace 2 horas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard temporal para empresas
function CompanyDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 text-white rounded-lg" style={{ background: 'var(--fprax-gradient-primary)' }}>
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-fprax" style={{ color: 'var(--fprax-dark-gray)' }}>
            Dashboard Empresa
          </h1>
          <p className="text-muted-foreground font-fprax">
            Bienvenido/a <span style={{ color: 'var(--fprax-blue)' }}>{user?.name || 'Empresa'}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">+1 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aplicaciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground">+15 esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CVs Revelados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">€240 gastados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Buena respuesta</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/empresa/ofertas" className="block">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <span className="font-medium">Crear Nueva Oferta</span>
                <Target className="w-5 h-5 text-blue-600" />
              </div>
            </Link>
            <Link href="/empresa/buscador-alumnos" className="block">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <span className="font-medium">Buscar Estudiantes</span>
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </Link>
            <Link href="/empresa/aplicaciones" className="block">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <span className="font-medium">Ver Aplicaciones</span>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ofertas Más Populares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Desarrollador Web</p>
                <p className="text-sm text-muted-foreground">15 aplicaciones</p>
              </div>
              <Badge variant="secondary">Activa</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Diseñador UX/UI</p>
                <p className="text-sm text-muted-foreground">12 aplicaciones</p>
              </div>
              <Badge variant="secondary">Activa</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Digital</p>
                <p className="text-sm text-muted-foreground">8 aplicaciones</p>
              </div>
              <Badge variant="secondary">Activa</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard temporal para centros de estudios
function StudyCenterDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-500 text-white rounded-lg">
          <School className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard Centro de Estudios</h1>
          <p className="text-muted-foreground">
            Bienvenido/a {user?.name || 'Centro'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colocaciones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">57% tasa de éxito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tutores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Formativos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard temporal para tutores
function TutorDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-500 text-white rounded-lg">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard Tutor</h1>
          <p className="text-muted-foreground">
            Bienvenido/a {user?.name || 'Tutor'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Prácticas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Activamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidencias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dashboard temporal para administradores
function AdminDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-500 text-white rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard Administrador</h1>
          <p className="text-muted-foreground">
            Bienvenido/a {user?.name || 'Administrador'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+5 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€2,450</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardFactory({ role }: DashboardFactoryProps) {
  const { activeRole, user } = useAuthStore();
  
  const currentRole = role || activeRole || user?.role || 'student';

  switch (currentRole) {
    case 'student':
      return <StudentDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'scenter':
      return <StudyCenterDashboard />;
    case 'tutor':
      return <TutorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
}
