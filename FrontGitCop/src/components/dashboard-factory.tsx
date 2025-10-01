'use client';

import { useAuthStore } from '@/stores/auth';
import { useApplications } from '@/hooks/useApplications';
import { useCV } from '@/hooks/useCV';
import { RecommendedOffers } from '@/components/onboarding/RecommendedOffers';
import { StudentOnboardingWizard } from '@/components/onboarding/StudentOnboardingWizard';
import StudentSkillsManager from '@/components/StudentSkillsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Clock, TrendingUp, FileText, Users, Building, Loader2, User, MapPin, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { apiClient } from '@/lib/api';

interface DashboardFactoryProps {
  role?: UserRole;
}

function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { applications, total, pending, accepted, rejected, loading: applicationsLoading, hasApplications } = useApplications();
  const { completionPercentage, isComplete, hasPersonalInfo, hasContactInfo, hasEducation, hasSkills, missingFields, loading: cvLoading, hasPhoto, hasSummary, hasLocation, hasCar, hasProfamily, refresh } = useCV();

  if (cvLoading) {
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header mejorado con gradiente profesional */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido, {user?.name}! 👋
            </h1>
            <p className="text-slate-200 text-lg">
              {isComplete
                ? "Tu perfil está completo y listo para encontrar oportunidades"
                : `Completa tu perfil para acceder a mejores oportunidades (${Math.round(completionPercentage)}% completado)`
              }
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-4xl font-bold mb-1">{Math.round(completionPercentage)}%</div>
            <div className="text-slate-300">Perfil completado</div>
          </div>
        </div>

        {/* Barra de progreso integrada */}
        <div className="mt-6">
          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado del perfil - Solo si no está completo */}
          {!isComplete && (
            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-5 h-5" />
                  Completa tu perfil
                  <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800">
                    {Math.round(completionPercentage)}%
                  </Badge>
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Solo faltan {missingFields.length} campos para tener un perfil completo
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasPersonalInfo ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Info básica</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasLocation ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Ubicación</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasCar ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <Car className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Vehículo</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasProfamily ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Orientación</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasEducation ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Académico</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasSkills ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Habilidades</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasPhoto ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Foto</p>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                        hasSummary ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-700'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-2 font-medium">Resumen</p>
                    </div>
                  </div>                {/* Botón de acción principal */}
                <Button
                  size="lg"
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={() => router.push('/mi-cv')}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Completar perfil ahora
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Onboarding Wizard - Show if profamily not selected */}
          {!hasProfamily && (
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <User className="w-5 h-5" />
                  Completa tu perfil profesional
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Para acceder a las mejores oportunidades, necesitamos saber tu área de especialización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentOnboardingWizard
                  onComplete={() => {
                    // Refresh CV data after onboarding completion
                    refresh();
                  }}
                  className="max-w-none"
                />
              </CardContent>
            </Card>
          )}

          {/* Ofertas recomendadas - Solo si perfil está avanzado y tiene profamily */}
          {completionPercentage >= 60 && hasProfamily && (
            <RecommendedOffers />
          )}

          {/* Mis aplicaciones - Simplificado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Mis Aplicaciones
                {total > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                    {total}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Cargando aplicaciones...</p>
                </div>
              ) : hasApplications ? (
                <div className="space-y-4">
                  {/* Estadísticas compactas */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-blue-600">{total}</div>
                      <div className="text-xs text-blue-600 font-medium">Total</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-lg font-bold text-yellow-600">{pending}</div>
                      <div className="text-xs text-yellow-600 font-medium">Pendientes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-600">{accepted}</div>
                      <div className="text-xs text-green-600 font-medium">Aceptadas</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-lg font-bold text-red-600">{rejected}</div>
                      <div className="text-xs text-red-600 font-medium">Rechazadas</div>
                    </div>
                  </div>

                  {/* Aplicaciones recientes - Más compacto */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Aplicaciones recientes:</h4>
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{app.offer?.name || 'Oferta sin nombre'}</p>
                          <p className="text-xs text-gray-600 truncate">{app.offer?.location} • {app.offer?.sector}</p>
                        </div>
                        <Badge variant={
                          app.status === 'accepted' ? 'default' :
                          app.status === 'rejected' ? 'destructive' :
                          app.status === 'reviewed' ? 'secondary' : 'outline'
                        } className="ml-3">
                          {app.status || 'Pendiente'}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    onClick={() => router.push('/aplicaciones')}
                  >
                    Ver todas las aplicaciones
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium">No has aplicado a ninguna oferta aún</p>
                  <p className="text-xs mt-1">¡Explora las ofertas disponibles!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-gray-300 hover:bg-gray-50"
                    onClick={() => router.push('/ofertas')}
                    disabled={completionPercentage < 30}
                  >
                    {completionPercentage < 30 ? 'Completa tu perfil primero' : 'Ver ofertas disponibles'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gestión de Skills - Solo si hay skills o perfil avanzado */}
          {user?.role === 'student' && user?.studentId && (hasSkills || completionPercentage >= 40) && (
            <StudentSkillsManager
              studentId={user.studentId}
              readonly={false}
            />
          )}
        </div>

        {/* Sidebar - Simplificado */}
        <div className="space-y-6">
          {/* Acciones principales */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Acciones principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                size="sm"
                className={`w-full justify-start font-medium ${
                  isComplete
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
                onClick={() => router.push('/mi-cv')}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isComplete ? 'Ver mi CV' : `Completar CV (${Math.round(completionPercentage)}%)`}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-300 hover:bg-slate-50"
                onClick={() => router.push('/ofertas')}
                disabled={completionPercentage < 30}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {completionPercentage < 30 ? 'Completa tu perfil primero' : 'Buscar ofertas'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-300 hover:bg-slate-50"
                onClick={() => router.push('/aplicaciones')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Mis aplicaciones {hasApplications && `(${total})`}
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Perfil completado</span>
                <span className={`text-sm font-bold ${
                  isComplete ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {Math.round(completionPercentage)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aplicaciones</span>
                <span className="text-sm font-bold text-gray-900">{total}</span>
              </div>
              {!isComplete && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Campos faltantes</span>
                  <span className="text-sm font-bold text-orange-600">{missingFields.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mensaje motivacional solo si perfil está casi completo */}
          {completionPercentage >= 80 && !isComplete && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800">¡Casi listo!</h4>
                    <p className="text-sm text-green-700">
                      Solo faltan {missingFields.length} detalles para completar tu perfil al 100%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// CompanyDashboard, CenterDashboard y DefaultDashboard mantienen el mismo código...
import { useEffect, useState } from 'react';
import { companyService, profamiliesService, userCompanyService } from '@/lib/services';

function CompanyDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [profamilies, setProfamilies] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalApplications: 0,
    pendingApplications: 0
  });

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
          loadCompanyData(userCompanies[0].companyId);
          setShowModal(false);
        } else {
          setCompany(null);
          setShowModal(true);
        }
      });
    }
    profamiliesService.getAll().then(res => setProfamilies(res.data));
  }, [user]);

  const loadCompanyData = async (companyId: number) => {
    try {
      setLoading(true);
      // Cargar ofertas de la empresa
      const offersResponse = await apiClient.get(`/api/offers/company/${companyId}`);
      const offersData = offersResponse.data;
      setOffers(offersData || []);

      // Calcular estadísticas
      const totalOffers = offersData?.length || 0;
      const activeOffers = offersData?.filter((o: any) => o.status === 'active').length || 0;

      // Cargar aplicaciones para todas las ofertas
      let totalApplications = 0;
      let pendingApplications = 0;

      for (const offer of offersData || []) {
        try {
          const appsResponse = await apiClient.get(`/api/offers/${offer.id}/applications`);
          const appsData = appsResponse.data;
          totalApplications += appsData.applications?.length || 0;
          pendingApplications += appsData.applications?.filter((a: any) => a.status === 'pending').length || 0;
        } catch (error) {
          console.error(`Error loading applications for offer ${offer.id}:`, error);
        }
      }

      setStats({
        totalOffers,
        activeOffers,
        totalApplications,
        pendingApplications
      });
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Empresa</h1>
              <p className="text-gray-600 mt-2">Gestiona tus ofertas de empleo y revisa las aplicaciones</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Ofertas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Ofertas Activas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeOffers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Aplicaciones</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Aplicaciones Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                  <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => router.push('/offers/create')}
                      className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-200 transition-colors"
                    >
                      <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-blue-700 font-medium">Crear Nueva Oferta</span>
                    </button>

                    <button
                      onClick={() => router.push('/offers')}
                      className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-dashed border-green-200 transition-colors"
                    >
                      <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-green-700 font-medium">Ver Todas las Ofertas</span>
                    </button>

                    <button
                      onClick={() => router.push('/applications')}
                      className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-dashed border-purple-200 transition-colors"
                    >
                      <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-purple-700 font-medium">Revisar Aplicaciones</span>
                    </button>
                  </div>
                </div>

                {/* Ofertas recientes */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Ofertas Recientes</h2>
                    <button
                      onClick={() => router.push('/offers')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver todas →
                    </button>
                  </div>

                  {offers.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">No tienes ofertas publicadas aún</p>
                      <button
                        onClick={() => router.push('/offers/create')}
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Crear tu primera oferta
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {offers.slice(0, 5).map((offer: any) => (
                        <div key={offer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{offer.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{offer.description?.substring(0, 100)}...</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>📍 {offer.location}</span>
                                <span>💼 {offer.contractType}</span>
                                <span>💰 {offer.salary ? `$${offer.salary}` : 'No especificado'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                offer.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {offer.status === 'active' ? 'Activa' : 'Inactiva'}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(offer.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
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