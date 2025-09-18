'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'react-toastify'

export default function TestSocialLoginPage() {
  const [isTestingGoogle, setIsTestingGoogle] = useState(false)
  const [isTestingFacebook, setIsTestingFacebook] = useState(false)
  const { user, token, isAuthenticated } = useAuthStore()

  const testGoogleLogin = async () => {
    setIsTestingGoogle(true)
    toast.info('Probando login con Google...')
    
    try {
      // Simular click en Google login
      window.location.href = 'http://localhost:5000/auth/google'
    } catch (err) {
      toast.error('Error al probar Google login')
      setIsTestingGoogle(false)
    }
  }

  const testFacebookLogin = async () => {
    setIsTestingFacebook(true)
    toast.info('Probando login con Facebook...')
    
    try {
      // Simular click en Facebook login
      window.location.href = 'http://localhost:5000/auth/facebook'
    } catch (err) {
      toast.error('Error al probar Facebook login')
      setIsTestingFacebook(false)
    }
  }

  const testToasts = () => {
    toast.success('¡Mensaje de éxito!')
    toast.error('Mensaje de error')
    toast.info('Mensaje informativo')
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prueba de Social Login</CardTitle>
          <CardDescription>
            Página para probar la implementación de social login y toasts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Estado de Autenticación</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Token:</strong> {token ? `✅ ${token.substring(0, 20)}...` : '❌ No'}</p>
              <p><strong>Usuario:</strong> {user ? `✅ ${user.username} (${user.email})` : '❌ No'}</p>
            </div>
          </div>

          {/* Botones de prueba */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={testGoogleLogin}
                disabled={isTestingGoogle}
                className="w-full"
              >
                {isTestingGoogle ? 'Probando...' : 'Probar Google Login'}
              </Button>
              <Button 
                onClick={testFacebookLogin}
                disabled={isTestingFacebook}
                className="w-full"
              >
                {isTestingFacebook ? 'Probando...' : 'Probar Facebook Login'}
              </Button>
            </div>
            
            <Button 
              onClick={testToasts}
              className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Probar Toasts
            </Button>
          </div>

          {/* Instrucciones */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">Instrucciones</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Asegúrate de que el backend esté ejecutándose en puerto 5000</li>
              <li>Haz click en "Probar Google Login" o "Probar Facebook Login"</li>
              <li>Si funciona, serás redirigido al proveedor de social login</li>
              <li>Después de autenticarte, deberías regresar a la aplicación</li>
              <li>Verifica que el estado de autenticación se actualice</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
