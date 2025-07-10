'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { toast } from 'sonner';
import { authService } from '@/lib/services';
import { useAuthStore } from '@/stores/auth';
import { UserRole } from '@/types';
import { FpraxLogo } from '@/components/ui/logos/FpraxLogo';
import Link from 'next/link';

const registrationSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'company', 'scenter', 'tutor'] as const),
  name: z.string().min(2, 'El nombre es requerido'),
  surname: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegistrationForm) => {
    setIsLoading(true);
    try {
      console.log('📝 Datos de registro:', data);
      
      const registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        description: data.description,
      };

      console.log('📤 Enviando datos:', registrationData);
      
      const success = await registerUser(registrationData);
      if (success) {
        setMessage({ type: 'success', text: 'Registro exitoso! Redirigiendo al dashboard...' });
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const { error } = useAuthStore.getState();
        setMessage({ type: 'error', text: error || 'Error en el registro' });
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      setMessage({ type: 'error', text: error.message || 'Error en el registro' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'Estudiante buscando prácticas profesionales';
      case 'company':
        return 'Empresa ofreciendo oportunidades de prácticas';
      case 'scenter':
        return 'Centro de estudios gestionando estudiantes';
      case 'tutor':
        return 'Tutor supervisando prácticas';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <FpraxLogo size="lg" variant="negative" />
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Registro en FPRAX
            </CardTitle>
            <CardDescription>
              Crea tu cuenta para acceder a la plataforma
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tipo de usuario */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de usuario</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value: string) => register('role').onChange({ target: { value } })}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Estudiante</div>
                      <div className="text-sm text-gray-500">Buscar prácticas</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Empresa</div>
                      <div className="text-sm text-gray-500">Ofrecer prácticas</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="scenter" id="scenter" />
                  <Label htmlFor="scenter" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Centro de Estudios</div>
                      <div className="text-sm text-gray-500">Gestionar estudiantes</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="tutor" id="tutor" />
                  <Label htmlFor="tutor" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Tutor</div>
                      <div className="text-sm text-gray-500">Supervisar prácticas</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              {selectedRole && (
                <p className="text-sm text-gray-600 mt-2">
                  {getRoleDescription(selectedRole)}
                </p>
              )}
            </div>

            {/* Datos básicos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario *</Label>
                <Input
                  id="username"
                  {...register('username')}
                  placeholder="usuario123"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Información personal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Juan"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Apellido</Label>
                <Input
                  id="surname"
                  {...register('surname')}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+34 123 456 789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
              />
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-md ${
                message.type === 'success' 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-red-600 bg-red-50'
              }`}>
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Crear cuenta'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  O regístrate con
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = 'http://localhost:5000/auth/facebook'}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
