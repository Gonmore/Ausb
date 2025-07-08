'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { SimpleSocialButton } from '@/components/auth/simple-social-button'
import { AuthGuard } from '@/components/auth/auth-guard'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [socialError, setSocialError] = useState<string | null>(null)
  
  const { login, isLoading, error } = useAuthStore()
  const router = useRouter()
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
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="text-2xl font-bold text-gray-900">Ausbildung</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Accede a tu cuenta para gestionar prácticas profesionales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              {socialError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {socialError}
                </div>
              )}            <Button
              type="submit"
              className="w-full"
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
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <Link href="/registro" className="text-blue-600 hover:underline font-medium">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/dashboard">
      <LoginForm />
    </AuthGuard>
  )
}
