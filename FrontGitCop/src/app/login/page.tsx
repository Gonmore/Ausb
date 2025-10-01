'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { SimpleSocialButton } from '@/components/auth/simple-social-button'
import { AuthGuard } from '@/components/auth/auth-guard'
import { FpraxLogo } from '@/components/ui/logos/FpraxLogo'

function LoginForm({ socialError }: { socialError: string | null }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  
  const { login, isLoading, error } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 Login form submitted');
    
    // Enviar el email como username para compatibilidad con el backend
    const loginData = {
      username: formData.email, // El backend puede buscar por email
      email: formData.email,
      password: formData.password,
    }
    
    console.log('📝 Login data:', { ...loginData, password: '***' });
    
    const success = await login(loginData)
    console.log('🎯 Login result:', success);
    
    if (success) {
      console.log('✅ Login successful, redirecting to dashboard...');
      router.push('/dashboard')
    } else {
      console.log('❌ Login failed, staying on login page');
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <FpraxLogo size="lg" variant="negative" />
          </Link>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">
              Accede a tu cuenta para gestionar prácticas profesionales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              
              {socialError && (
                <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
                  {socialError}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <SimpleSocialButton provider="google" className="w-full" />
              <SimpleSocialButton provider="facebook" className="w-full" />
            </div>
          </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-700">¿No tienes cuenta? </span>
              <Link href="/registro" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente separado que usa useSearchParams
function LoginFormWithParams() {
  const [socialError, setSocialError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Check for social login errors in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'social_login_failed':
          setSocialError('Error en el inicio de sesión con redes sociales')
          break
        case 'missing_data':
          setSocialError('Faltan datos en la respuesta del proveedor')
          break
        case 'callback_error':
          setSocialError('Error procesando la autenticación')
          break
        default:
          setSocialError('Error desconocido en el inicio de sesión')
      }
    }
  }, [searchParams])

  return <LoginForm socialError={socialError} />
}

// Componente que maneja la lógica de sesión expirada
function LoginPageContent() {
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);
  const searchParams = useSearchParams();
  const { clearError } = useAuthStore();

  useEffect(() => {
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setShowExpiredMessage(true);
      // Limpiar mensaje después de 10 segundos
      setTimeout(() => setShowExpiredMessage(false), 10000);
    }
  }, [searchParams]);

  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <div className="login-container">
        {/* Mensaje de sesión expirada */}
        {showExpiredMessage && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Sesión Expirada
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <LoginFormWithParams />
      </div>
    </AuthGuard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="text-center">Cargando...</div></div>}>
      <LoginPageContent />
    </Suspense>
  )
}
