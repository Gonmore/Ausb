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

  // Cargar empresas al montar el componente
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
    fetchCompanies();
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
    companyRole: 'manager' // Rol para empresa existente
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

            <Card className="w-full max-w-md p-6 rounded-lg shadow-lg bg-blue-100">
          <CardHeader>
                {/* ...existing code... */}
          </CardHeader>
          <CardContent>

            {!showCompanyModal ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ...existing code... */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded shadow-sm">
                    {error}
                  </div>
                )}

                {/* Rol */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-blue-700">Tipo de cuenta *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Estudiante</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                      <SelectItem value="scenter">Centro de Estudios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Empresa y rol solo si rol es company */}
                {formData.role === 'company' && (
                  <div className="space-y-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <Label htmlFor="company" className="text-blue-700">Empresa *</Label>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona empresa existente o crea nueva" className="text-blue-800" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Crear nueva empresa</SelectItem>
                        {companyOptions.map(opt => (
                          <SelectItem key={opt.id} value={String(opt.id)}>{opt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.isNewCompany && (
                      <Input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Nombre de la nueva empresa"
                        required
                        className="border-blue-300 focus:border-blue-500 bg-white/80"
                      />
                    )}
                    {/* Dropdown para elegir rol si selecciona empresa existente */}
                    {!formData.isNewCompany && formData.companyId && (
                      <div className="space-y-2 mt-2">
                        <Label htmlFor="companyRole" className="text-blue-700">Rol en la empresa *</Label>
                        <Select
                          value={formData.companyRole}
                          onValueChange={value => setFormData(prev => ({ ...prev, companyRole: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu rol" className="text-blue-800" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="hr">Recursos Humanos</SelectItem>
                            <SelectItem value="viewer">Solo Visualización</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-blue-700">Nombre de usuario *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="tu_usuario"
                    required
                  />
                </div>

                {/* Surname */}
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-blue-700">Apellido *</Label>
                  <Input
                    id="surname"
                    type="text"
                    value={formData.surname}
                    onChange={(e) => handleInputChange('surname', e.target.value)}
                    placeholder="Pérez"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-700">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                {/* Teléfono, país y ciudad */}
                <SmartPhoneInput
                  phone={formData.phone}
                  selectedCountryCode={formData.countryCode}
                  selectedCityId={formData.cityId}
                  onPhoneChange={handlePhoneChange}
                  onCountryChange={handleCountryChange}
                  onCityChange={handleCityChange}
                />

                {/* Contraseñas */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-700">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-blue-700">Confirmar contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Descripción opcional */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-blue-700">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
            </form>
            ) : (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Datos de la empresa</h3>
                  <form onSubmit={handleCompanySubmit} className="space-y-4 bg-blue-50 rounded-lg p-4">
                    <div>
                      <Label htmlFor="name" className="text-blue-700">Nombre *</Label>
                      <Input type="text" id="name" value={companyForm.name} readOnly className="bg-blue-50 text-blue-900 font-semibold" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-blue-700">Email *</Label>
                      <Input type="email" id="email" value={companyForm.email} readOnly className="bg-blue-50 text-blue-900 font-semibold" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-blue-700">Teléfono *</Label>
                      <Input type="text" id="phone" value={companyForm.phone} readOnly className="bg-blue-50 text-blue-900 font-semibold" />
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
