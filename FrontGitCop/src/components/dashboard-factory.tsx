'use client';

import { useAuthStore } from '@/stores/auth';
// import { useOnboarding } from '@/hooks/useOnboarding'; // 🗑️ YA NO NECESARIO
import { useApplications } from '@/hooks/useApplications';
import { useCV } from '@/hooks/useCV';
// import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide'; // 🗑️ ELIMINAR
import { RecommendedOffers } from '@/components/onboarding/RecommendedOffers';
import StudentSkillsManager from '@/components/StudentSkillsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp, FileText, Users, Building, Loader2, User, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

interface DashboardFactoryProps {
  role?: UserRole;
}

function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  // const { status, loading: onboardingLoading, shouldShowGuide } = useOnboarding(); // 🗑️ ELIMINAR
  const { applications, total, pending, accepted, rejected, loading: applicationsLoading, hasApplications } = useApplications();
  const { completionPercentage, isComplete, hasPersonalInfo, hasContactInfo, hasEducation, hasSkills, hasExperience, missingFields, loading: cvLoading } = useCV();

  // if (onboardingLoading || cvLoading) { // 🗑️ CAMBIAR
  if (cvLoading) { // ✅ SOLO ESPERAR CV
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header limpio */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Hola {user?.name || 'Estudiante'}! 👋
          </h1>
          <p className="text-gray-600">
            {!isComplete 
              ? `Completa tu perfil (${Math.round(completionPercentage)}%) para acceder a mejores oportunidades` 
              : 'Explora oportunidades de prácticas profesionales'
            }
          </p>
        </div>
        
        <Badge variant={isComplete ? 'default' : 'secondary'} className="text-sm">
          {isComplete ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Perfil completo
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-1" />
              Perfil al {Math.round(completionPercentage)}%
            </>
          )}
        </Badge>
      </div>

      {/* 🗑️ ELIMINAR COMPLETAMENTE ESTA SECCIÓN */}
      {/* {shouldShowGuide && !isComplete && (
        <OnboardingGuide />
      )} */}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Estado del perfil REAL basado en CV */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                Estado del Perfil
                <Badge variant={isComplete ? "default" : "secondary"} className="ml-2">
                  {Math.round(completionPercentage)}%
                </Badge>
              </CardTitle>
              <CardDescription>
                Tu progreso real en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Barra de progreso visual */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completitud del perfil</span>
                  <span className="font-medium">{Math.round(completionPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      completionPercentage >= 80 ? 'bg-green-500' :
                      completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Grid de estado de secciones */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    hasPersonalInfo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <p className="text-xs mt-2 text-gray-600">Info básica</p>
                  <p className="text-xs text-gray-500">{hasPersonalInfo ? 'Completa' : 'Incompleta'}</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    hasContactInfo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <p className="text-xs mt-2 text-gray-600">Contacto</p>
                  <p className="text-xs text-gray-500">{hasContactInfo ? 'Completo' : 'Incompleto'}</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    hasEducation ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs mt-2 text-gray-600">Educación</p>
                  <p className="text-xs text-gray-500">{hasEducation ? 'Completa' : 'Vacía'}</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    hasSkills ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-xs mt-2 text-gray-600">Skills</p>
                  <p className="text-xs text-gray-500">{hasSkills ? 'Agregadas' : 'Sin skills'}</p>
                </div>
              </div>

              {/* Campos faltantes */}
              {missingFields.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    Para completar tu perfil, agrega:
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {missingFields.slice(0, 5).map((field, index) => (
                      <Badge key={index} variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                        {field}
                      </Badge>
                    ))}
                    {missingFields.length > 5 && (
                      <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                        +{missingFields.length - 5} más
                      </Badge>
                    )}
                  </div>
                  
                  {/* 🔥 BOTÓN MEJORADO CON MÁS REALCE */}
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                    onClick={() => router.push('/mi-cv')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Completar ahora
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* Mensaje de éxito si está completo */}
              {isComplete && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ ¡Excelente! Tu perfil está completo y listo para recibir ofertas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🆕 OFERTAS RECOMENDADAS - Solo si perfil está razonablemente completo */}
          {completionPercentage >= 50 && (
            <RecommendedOffers />
          )}

          {/* Mis aplicaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Mis Aplicaciones
                {total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {total}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Estado de tus postulaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Cargando aplicaciones...</p>
                </div>
              ) : hasApplications ? (
                <div className="space-y-4">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">{total}</div>
                      <div className="text-xs text-blue-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-600">{pending}</div>
                      <div className="text-xs text-yellow-600">Pendientes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{accepted}</div>
                      <div className="text-xs text-green-600">Aceptadas</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-semibold text-red-600">{rejected}</div>
                      <div className="text-xs text-red-600">Rechazadas</div>
                    </div>
                  </div>

                  {/* Aplicaciones recientes */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Aplicaciones recientes:</h4>
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{app.offer?.name || 'Oferta sin nombre'}</p>
                          <p className="text-xs text-gray-600">{app.offer?.location} • {app.offer?.sector}</p>
                        </div>
                        <Badge variant={
                          app.status === 'accepted' ? 'default' :
                          app.status === 'rejected' ? 'destructive' :
                          app.status === 'reviewed' ? 'secondary' : 'outline'
                        }>
                          {app.status || 'Pendiente'}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push('/aplicaciones')}
                  >
                    Ver todas las aplicaciones
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">No has aplicado a ninguna oferta aún</p>
                  <p className="text-xs mt-1">¡Explora las ofertas disponibles!</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => router.push('/ofertas')}
                    disabled={completionPercentage < 30} // Deshabilitar si perfil muy incompleto
                  >
                    {completionPercentage < 30 ? 'Completa tu perfil primero' : 'Ver ofertas disponibles'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gestión de Skills */}
          {user?.role === 'student' && user?.studentId && (
            <StudentSkillsManager 
              studentId={user.studentId}
              readonly={false}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick stats REALES */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Perfil completado</span>
                <span className={`text-sm font-medium ${
                  isComplete ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Aplicaciones</span>
                <span className="text-sm font-medium">{total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Campos faltantes</span>
                <span className={`text-sm font-medium ${
                  missingFields.length === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {missingFields.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              
              {/* BOTÓN DE CV MEJORADO */}
              <Button 
                size="sm" 
                className={`w-full justify-start font-medium shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 ${
                  isComplete 
                    ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0'
                }`}
                onClick={() => router.push('/mi-cv')}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isComplete ? (
                  <>
                    Ver mi CV
                    <CheckCircle className="w-4 h-4 ml-auto" />
                  </>
                ) : (
                  <>
                    Completar CV ({Math.round(completionPercentage)}%)
                    <AlertCircle className="w-4 h-4 ml-auto" />
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start hover:shadow-md transition-shadow duration-200"
                onClick={() => router.push('/ofertas')}
                disabled={completionPercentage < 30}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {completionPercentage < 30 ? 'Completa tu perfil primero' : 'Buscar ofertas'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start hover:shadow-md transition-shadow duration-200"
                onClick={() => router.push('/aplicaciones')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Mis aplicaciones {hasApplications && `(${total})`}
              </Button>
            </CardContent>
          </Card>

          {/* 🗑️ ELIMINAR COMPLETAMENTE ESTA SECCIÓN */}
          {/* {!isComplete && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Consejo</h4>
                <p className="text-sm text-blue-700">
                  {completionPercentage < 30 && 'Completa tu información básica para empezar'}
                  {completionPercentage >= 30 && completionPercentage < 60 && 'Agrega tu educación y skills para destacar'}
                  {completionPercentage >= 60 && completionPercentage < 80 && 'Casi listo! Completa tu experiencia'}
                  {completionPercentage >= 80 && 'Solo faltan algunos detalles para el 100%'}
                </p>
                {missingFields.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-blue-600 mb-2">
                      Próximo: {missingFields[0]}
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-0"
                      onClick={() => router.push('/mi-cv')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Completar perfil
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )} */}
        </div>
      </div>
    </div>
  );
}

// CompanyDashboard, CenterDashboard y DefaultDashboard mantienen el mismo código...
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { companyService, profamiliesService, userCompanyService } from '@/lib/services';

function CompanyDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [profamilies, setProfamilies] = useState<any[]>([]);
  const [form, setForm] = useState<import("@/types").CreateCompanyData & { profamilyId: string }>({
    name: '', code: '', city: '', address: '', phone: '', email: '', sector: '', profamilyId: '',
  });

  useEffect(() => {
    if (user?.id) {
      // Consultar la relación UserCompany para el usuario actual
      userCompanyService.getByUserId(user.id).then(res => {
        const userCompanies = res.data || [];
        // Si el usuario tiene al menos una empresa asociada, no mostrar el modal
        if (userCompanies.length > 0 && userCompanies[0].companyId) {
          setCompany(userCompanies[0].companyId);
          setShowModal(false);
        } else {
          setCompany(null);
          setShowModal(true);
        }
      });
    }
    profamiliesService.getAll().then(res => setProfamilies(res.data));
  }, [user]);

  const handleChange = (field: keyof typeof form, value: string) => setForm(f => ({ ...f, [field]: value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // Crear empresa (usando los campos correctos)
    const { profamilyId, ...companyData } = form;
    const res = await companyService.create(companyData);
    const companyId = res.data?.id;
    // Asociar usuario a empresa en UserCompany
    if (companyId) {
      await userCompanyService.create({ userId: user.id, companyId, role: 'company' });
    }
    setShowModal(false);
    window.location.reload();
  };

  return (
    <>
      {/* Modal para completar datos de empresa */}
      <Dialog open={showModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completa los datos de tu empresa</DialogTitle>
            <DialogDescription>Para acceder al dashboard, primero ingresa los datos básicos de tu empresa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Nombre" value={form.name} onChange={e => handleChange('name', e.target.value)} required className="w-full border p-2 rounded" />
            <input type="text" placeholder="Código" value={form.code} onChange={e => handleChange('code', e.target.value)} required className="w-full border p-2 rounded" />
            <input type="text" placeholder="Ciudad" value={form.city} onChange={e => handleChange('city', e.target.value)} required className="w-full border p-2 rounded" />
            <input type="text" placeholder="Dirección" value={form.address} onChange={e => handleChange('address', e.target.value)} required className="w-full border p-2 rounded" />
            <input type="text" placeholder="Teléfono" value={form.phone} onChange={e => handleChange('phone', e.target.value)} required className="w-full border p-2 rounded" />
            <input type="email" placeholder="Email" value={form.email} onChange={e => handleChange('email', e.target.value)} className="w-full border p-2 rounded" />
            <input type="text" placeholder="Sector" value={form.sector} onChange={e => handleChange('sector', e.target.value)} className="w-full border p-2 rounded" />
            <select value={form.profamilyId} onChange={e => handleChange('profamilyId', e.target.value)} required className="w-full border p-2 rounded">
              <option value="">Selecciona familia profesional</option>
              {profamilies.map((f: any) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Guardar empresa</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dashboard normal si empresa existe */}
      {!showModal && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Empresa 🏢
              </h1>
              <p className="text-gray-600">
                Gestiona tus ofertas y encuentra los mejores candidatos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenido, {user?.name}</CardTitle>
                  <CardDescription>
                    Dashboard dinámico para empresas será implementado aquí
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button onClick={() => router.push('/empresa/ofertas')} className="w-full">
                      <Building className="w-4 h-4 mr-2" />
                      Gestionar Ofertas
                    </Button>
                    <Button onClick={() => router.push('/empresa/buscador-inteligente')} variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Buscador Inteligente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CenterDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel de Centro de Estudios 🎓
          </h1>
          <p className="text-gray-600">
            Gestiona tus estudiantes y programas académicos
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido, {user?.name}</CardTitle>
          <CardDescription>
            Dashboard dinámico para centros de estudios será implementado aquí
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function DefaultDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Panel de control general
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Contenido del dashboard por defecto</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardFactory({ role }: DashboardFactoryProps) {
  const { user } = useAuthStore();
  const currentRole = role || user?.role || 'student';

  switch (currentRole) {
    case 'student':
      return <StudentDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'scenter':
      return <CenterDashboard />;
    default:
      return <DefaultDashboard />;
  }
}

// Para compatibilidad con imports existentes
export { DashboardFactory };
