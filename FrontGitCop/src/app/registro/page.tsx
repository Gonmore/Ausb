"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartPhoneInput } from '@/components/ui/smart-phone-input';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({
  name: '',
  city: '',
  email: '',
  phone: '',
  code: '',
  web: '',
  sector: '',
  address: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [sectorOptions, setSectorOptions] = useState([
    'Tecnología', 'Educación', 'Salud', 'Finanzas', 'Industria', 'Comercio', 'Servicios', 'Otro'
  ]);
  const [newSector, setNewSector] = useState('');
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [profamilyOptions, setProfamilyOptions] = useState<any[]>([]);
  const [scenterOptions, setScenterOptions] = useState<any[]>([]);

  // Cargar empresas, familias profesionales y centros educativos al montar el componente
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await import('@/lib/services');
        const response = await res.companyService.getAll();
        setCompanyOptions(response.data || []);
      } catch (err) {
        setCompanyOptions([]);
      }
    };

    const fetchProfamilies = async () => {
      try {
        const res = await import('@/lib/services');
        const response = await res.profamiliesService.getAll();
        setProfamilyOptions(response.data || []);
      } catch (err) {
        setProfamilyOptions([]);
      }
    };

    const fetchScenters = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenter/active`);
        const data = await response.json();
        setScenterOptions(data.success ? data.data : []);
      } catch (err) {
        setScenterOptions([]);
      }
    };

    fetchCompanies();
    fetchProfamilies();
    fetchScenters();
  }, []);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    name: '',
    surname: '',
    phone: '',
    description: '',
    countryCode: null as string | null,
    cityId: null as string | null,
    companyName: '', // Nuevo campo para empresa
    companyId: '',   // Si selecciona existente
    isNewCompany: false, // Si es nueva empresa
    companyRole: 'manager', // Rol para empresa existente
    // 🆕 CAMPOS ESPECÍFICOS PARA ESTUDIANTES
    hasCar: null as boolean | null, // Si tiene auto (null inicialmente)
    disp: '', // Disponibilidad para prácticas
    scenterId: '' // Centro educativo para usuarios de scenter
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔥 NUEVAS FUNCIONES CON TIPOS CORRECTOS
  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({
      ...prev,
      phone
    }));
  };

  const handleCountryChange = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      countryCode
    }));
  };

  const handleCityChange = (cityId: string) => {
    setFormData(prev => ({
      ...prev,
      cityId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (!formData.phone || !formData.countryCode) {
      setError('El teléfono y país son obligatorios');
      setIsLoading(false);
      return;
    }

    // 🆕 VALIDACIONES ESPECÍFICAS PARA ESTUDIANTES
    if (formData.role === 'student') {
      if (!formData.description.trim()) {
        setError('La descripción es obligatoria para estudiantes');
        setIsLoading(false);
        return;
      }
      if (formData.hasCar !== true && formData.hasCar !== false) {
        setError('Debes indicar si tienes vehículo');
        setIsLoading(false);
        return;
      }
    }

    // 🆕 VALIDACIONES ESPECÍFICAS PARA CENTROS EDUCATIVOS
    if (formData.role === 'scenter') {
      if (!formData.scenterId) {
        setError('Debes seleccionar un centro educativo');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Preparar datos del usuario
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        description: formData.description,
        countryCode: formData.countryCode,
        cityId: formData.cityId
      };

      // 🆕 AGREGAR SCENTERID PARA USUARIOS DE CENTRO EDUCATIVO
      if (formData.role === 'scenter') {
        (userData as any).scenterId = formData.scenterId;
      }

      // 🆕 AGREGAR DATOS DEL ESTUDIANTE SI ES ESTUDIANTE
      if (formData.role === 'student') {
        (userData as any).studentData = {
          car: formData.hasCar,
          description: formData.description,
          disp: formData.disp || new Date().toISOString().split('T')[0] // Hoy por defecto
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        setShowSuccess(true);
        setTimeout(async () => {
          setShowSuccess(false);
          if (formData.role === 'company') {
            if (formData.isNewCompany) {
              setCompanyForm(f => ({
                ...f,
                name: formData.companyName,
                phone: formData.phone,
                city: '', // Ocultar ciudad si es código
                email: formData.email
              }));
              setShowCompanyModal(true);
            } else if (formData.companyId) {
              // Asociar usuario con empresa existente
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-company`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({ userId: data.user.id, companyId: formData.companyId, role: formData.companyRole }),
              });
              // Nunca mostrar el modal, redirigir directo
              setShowCompanyModal(false);
              router.push('/dashboard');
            }
          } else if (formData.role === 'scenter' && formData.scenterId) {
            // Asociar usuario con centro educativo
            try {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-scenter`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({ userId: data.user.id, scenterId: formData.scenterId }),
              });
              router.push('/dashboard');
            } catch (err) {
              console.error('Error asociando usuario con centro:', err);
              router.push('/dashboard'); // Redirigir de todos modos
            }
          } else {
            router.push('/dashboard');
          }
        }, 1200);
      } else {
        setError(data.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para guardar empresa y asociar usuario
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Enviar todos los datos requeridos
      const payload = {
        ...companyForm,
        name: companyForm.name,
        city: companyForm.city,
        email: companyForm.email,
        code: companyForm.code,
        web: companyForm.web,
        sector: companyForm.sector,
        address: companyForm.address,
        type: 'default' // Si el backend requiere type
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });
      const companyData = await res.json();
      if (res.ok && companyData.id) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-company`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userId: companyData.userId, companyId: companyData.id, role: 'owner' }),
        });
        // Recargar empresas para que aparezca la nueva en el dropdown
        try {
          const res = await import('@/lib/services');
          const response = await res.companyService.getAll();
          setCompanyOptions(response.data || []);
        } catch (err) {
          setCompanyOptions([]);
        }
        setShowCompanyModal(false);
        router.push('/dashboard');
      } else {
        setError(companyData.message || 'Error al crear empresa');
      }
    } catch (err) {
      setError('Error de conexión al crear empresa.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ...existing code...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Crear cuenta
          </h1>
          <p className="text-lg text-gray-700">
            Únete a la plataforma de formación profesional
          </p>
          <p className="text-sm text-gray-600 mt-2">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-indigo-700 hover:text-indigo-600 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-center text-gray-900">
              Información de registro
            </CardTitle>
            <CardDescription className="text-center text-gray-700">
              Completa los datos para crear tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">

            {!showCompanyModal ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ...existing code... */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded shadow-sm">
                    {error}
                  </div>
                )}

                {/* Step 1: Account Type */}
                <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-indigo-950">
                      Tipo de cuenta
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      formData.role === 'student'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={formData.role === 'student'}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-950 mb-1">Estudiante</h4>
                        <p className="text-sm text-gray-700">Busco oportunidades de formación</p>
                      </div>
                    </label>

                    <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      formData.role === 'company'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="company"
                        checked={formData.role === 'company'}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-950 mb-1">Empresa</h4>
                        <p className="text-sm text-gray-700">Ofrezco oportunidades laborales</p>
                      </div>
                    </label>

                    <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      formData.role === 'scenter'
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="scenter"
                        checked={formData.role === 'scenter'}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-950 mb-1">Centro Educativo</h4>
                        <p className="text-sm text-gray-700">Gestiono formación profesional</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Company Selection - Only for company role */}
                {formData.role === 'company' && (
                  <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        1.1
                      </div>
                      <h3 className="text-lg font-semibold text-blue-950">
                        Información de la empresa
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-blue-800 font-medium">Empresa</Label>
                        <Select
                          value={formData.companyId}
                          onValueChange={(value) => {
                            if (value === 'new') {
                              setFormData(prev => ({ ...prev, isNewCompany: true, companyId: '', companyName: '' }));
                            } else {
                              setFormData(prev => ({ ...prev, isNewCompany: false, companyId: value, companyName: '' }));
                            }
                          }}
                        >
                          <SelectTrigger className="border-blue-300 focus:border-blue-500">
                            <SelectValue placeholder="Selecciona empresa existente o crea nueva" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">➕ Crear nueva empresa</SelectItem>
                            {companyOptions.map(opt => (
                              <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.isNewCompany && (
                        <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                          <Label className="text-blue-800 font-medium">Nombre de la nueva empresa</Label>
                          <Input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            placeholder="Mi Empresa S.A."
                            className="border-blue-300 focus:border-blue-500"
                            required
                          />
                        </div>
                      )}

                      {!formData.isNewCompany && formData.companyId && (
                        <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
                          <Label className="text-blue-800 font-medium">Rol en la empresa</Label>
                          <Select
                            value={formData.companyRole}
                            onValueChange={value => setFormData(prev => ({ ...prev, companyRole: value }))}
                          >
                            <SelectTrigger className="border-blue-300 focus:border-blue-500">
                              <SelectValue placeholder="Selecciona tu rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">👔 Manager</SelectItem>
                              <SelectItem value="hr">👥 Recursos Humanos</SelectItem>
                              <SelectItem value="viewer">👁️ Solo Visualización</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scenter Selection - Only for scenter role */}
                {formData.role === 'scenter' && (
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        1.1
                      </div>
                      <h3 className="text-lg font-semibold text-purple-950">
                        Centro Educativo
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-purple-800 font-medium">Selecciona tu centro educativo</Label>
                        <Select
                          value={formData.scenterId}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, scenterId: value }))}
                        >
                          <SelectTrigger className="border-purple-300 focus:border-purple-500">
                            <SelectValue placeholder="Selecciona el centro educativo al que perteneces" />
                          </SelectTrigger>
                          <SelectContent>
                            {scenterOptions.map((scenter: any) => (
                              <SelectItem key={scenter.id} value={String(scenter.id)}>
                                {scenter.name} - {scenter.city || 'Sin ciudad especificada'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-purple-700 mt-1">
                          Solo podrás gestionar estudiantes y datos de este centro educativo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Information */}
                <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-gray-950">
                      Información personal
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-700 font-medium">Nombre de usuario</Label>
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="tu_usuario_123"
                        className="border-gray-300 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium">Nombre</Label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Juan"
                        className="border-gray-300 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium">Apellido</Label>
                      <Input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => handleInputChange('surname', e.target.value)}
                        placeholder="Pérez"
                        className="border-gray-300 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 font-medium">Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="juan@email.com"
                        className="border-gray-300 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone, Country, City */}
                  <div className="mt-6">
                    <Label className="text-gray-800 font-medium block mb-3">Ubicación y contacto</Label>
                    <SmartPhoneInput
                      phone={formData.phone}
                      selectedCountryCode={formData.countryCode}
                      selectedCityId={formData.cityId}
                      onPhoneChange={handlePhoneChange}
                      onCountryChange={handleCountryChange}
                      onCityChange={handleCityChange}
                    />
                  </div>
                </div>

                {/* Step 3: Security */}
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-yellow-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-950">
                      Seguridad
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-yellow-900 font-medium">Contraseña</Label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        className="border-yellow-300 focus:border-yellow-500"
                        required
                      />
                      <p className="text-xs text-yellow-800 mt-1">
                        Mínimo 8 caracteres
                      </p>
                    </div>

                    <div>
                      <Label className="text-yellow-900 font-medium">Confirmar contraseña</Label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className="border-yellow-300 focus:border-yellow-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Role-specific information */}
                {formData.role === 'student' && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        4
                      </div>
                      <h3 className="text-lg font-semibold text-green-950">
                        Información adicional
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="text-green-900 font-medium">¿Tienes vehículo?</Label>
                        <div className="flex gap-6 mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="hasCar"
                              checked={formData.hasCar === true}
                              onChange={() => setFormData(prev => ({ ...prev, hasCar: true }))}
                              className="mr-2 text-green-600"
                            />
                            <span className="text-sm text-green-800">Sí</span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="hasCar"
                              checked={formData.hasCar === false}
                              onChange={() => setFormData(prev => ({ ...prev, hasCar: false }))}
                              className="mr-2 text-green-600"
                            />
                            <span className="text-sm text-green-800">No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label className="text-green-900 font-medium">Disponibilidad para prácticas</Label>
                        <Input
                          type="date"
                          value={formData.disp}
                          onChange={(e) => handleInputChange('disp', e.target.value)}
                          className="border-green-300 focus:border-green-500"
                          placeholder="Selecciona fecha de disponibilidad"
                        />
                        <p className="text-xs text-green-800 mt-1">
                          Deja vacío para disponibilidad inmediata (desde hoy)
                        </p>
                      </div>

                      <div>
                        <Label className="text-green-900 font-medium">Descripción personal</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Cuéntanos sobre ti, tus intereses, experiencia previa..."
                          rows={4}
                          className="border-green-300 focus:border-green-500"
                          required
                        />
                        <p className="text-xs text-green-800 mt-1">
                          Esta información ayudará a las empresas a conocerte mejor
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creando cuenta...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Crear cuenta
                      </div>
                    )}
                  </Button>
                </div>
            </form>
            ) : (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Datos de la empresa</h3>
                  <form onSubmit={handleCompanySubmit} className="space-y-4 bg-blue-100 rounded-lg p-4">
                    <div>
                      <Label htmlFor="name" className="text-blue-900">Nombre *</Label>
                      <Input type="text" id="name" value={companyForm.name} readOnly className="bg-blue-50 text-blue-950 font-semibold" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-blue-900">Email *</Label>
                      <Input type="email" id="email" value={companyForm.email} readOnly className="bg-blue-50 text-blue-950 font-semibold" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-blue-900">Teléfono *</Label>
                      <Input type="text" id="phone" value={companyForm.phone} readOnly className="bg-blue-50 text-blue-950 font-semibold" />
                    </div>
                    <div>
                      <Label htmlFor="code">Código *</Label>
                      <Input type="text" id="code" placeholder="Código de empresa" value={companyForm.code} onChange={e => setCompanyForm(f => ({ ...f, code: e.target.value }))} required />
                    </div>
                    <div>
                      <Label htmlFor="web">Web</Label>
                      <Input type="text" id="web" placeholder="Sitio web" value={companyForm.web} onChange={e => setCompanyForm(f => ({ ...f, web: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="sector">Sector *</Label>
                      <Select value={companyForm.sector} onValueChange={value => setCompanyForm(f => ({ ...f, sector: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectorOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex mt-2 gap-2">
                        <Input type="text" placeholder="Agregar sector nuevo" value={newSector} onChange={e => setNewSector(e.target.value)} />
                        <Button type="button" onClick={() => {
                          if (newSector && !sectorOptions.includes(newSector)) {
                            setSectorOptions([...sectorOptions, newSector]);
                            setCompanyForm(f => ({ ...f, sector: newSector }));
                            setNewSector('');
                          }
                        }}>Agregar</Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección *</Label>
                      <Input type="text" id="address" placeholder="Dirección" value={companyForm.address} onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))} required />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150" disabled={isLoading}>
                      {isLoading ? 'Guardando empresa...' : 'Guardar empresa'}
                    </Button>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-2">
                        {error}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}
            {showSuccess && (
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-4 text-center">
                ¡Usuario empresa creado correctamente!
              </div>
            )}
            {!showCompanyModal && !showSuccess && (
              <></>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
