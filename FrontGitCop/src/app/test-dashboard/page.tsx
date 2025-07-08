'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function TestDashboardPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loginData, setLoginData] = useState({ email: 'test@example.com', password: '123456' })
  const { user, token, isAuthenticated, login, logout, error, isLoading } = useAuthStore()
  const router = useRouter()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
  }

  useEffect(() => {
    addLog('🔍 TestDashboard component mounted')
    addLog(`🔐 isAuthenticated: ${isAuthenticated}`)
    addLog(`👤 User: ${user ? JSON.stringify(user) : 'null'}`)
    addLog(`🎯 Token: ${token ? `${token.substring(0, 20)}...` : 'null'}`)
    addLog(`❌ Error: ${error || 'none'}`)
    addLog(`⏳ Loading: ${isLoading}`)
  }, [user, token, isAuthenticated, error, isLoading])

  const handleTestLogin = async () => {
    addLog('🚀 Starting test login...')
    
    try {
      const loginPayload = {
        username: loginData.email,
        email: loginData.email,
        password: loginData.password
      }
      
      addLog(`📤 Sending login request: ${JSON.stringify({ ...loginPayload, password: '***' })}`)
      
      const success = await login(loginPayload)
      
      addLog(`📥 Login response: ${success ? 'SUCCESS' : 'FAILED'}`)
      
      if (success) {
        addLog('✅ Login successful, checking state...')
        addLog(`👤 User after login: ${user ? JSON.stringify(user) : 'null'}`)
        addLog(`🎯 Token after login: ${token ? `${token.substring(0, 20)}...` : 'null'}`)
        
        // Test redirect to dashboard
        addLog('🚀 Attempting redirect to dashboard...')
        router.push('/dashboard')
      } else {
        addLog(`❌ Login failed: ${error}`)
      }
    } catch (err) {
      addLog(`💥 Login error: ${err}`)
    }
  }

  const handleTestDashboard = () => {
    addLog('🏠 Attempting direct navigation to dashboard...')
    router.push('/dashboard')
  }

  const handleLogout = () => {
    addLog('🚪 Logging out...')
    logout()
    addLog('✅ Logout complete')
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Dashboard - Debug Login Flow</CardTitle>
          <CardDescription>
            Herramienta para debuggear el error de dashboard después del login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Estado de Autenticación</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
                <p><strong>Loading:</strong> {isLoading ? '⏳ Sí' : '✅ No'}</p>
                <p><strong>Token:</strong> {token ? `✅ ${token.substring(0, 30)}...` : '❌ No'}</p>
                <p><strong>Usuario:</strong> {user ? `✅ ${user.username} (${user.email})` : '❌ No'}</p>
                <p><strong>Error:</strong> {error || '✅ Ninguno'}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Datos de Login de Prueba</h3>
              <div className="space-y-2">
                <Input
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Botones de prueba */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleTestLogin} disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Test Login'}
            </Button>
            <Button onClick={handleTestDashboard} variant="outline">
              Go to Dashboard
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
            <Button onClick={clearLogs} variant="outline">
              Clear Logs
            </Button>
          </div>

          {/* Logs en tiempo real */}
          <div className="space-y-2">
            <h3 className="font-medium">Logs de Debug</h3>
            <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p>No hay logs...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium mb-2">Instrucciones de Debug</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Verificar que el backend esté corriendo en puerto 5000</li>
              <li>Hacer click en "Test Login" para probar el flujo completo</li>
              <li>Observar los logs para identificar dónde falla</li>
              <li>Si el login es exitoso, probar "Go to Dashboard"</li>
              <li>Revisar los mensajes de error en la consola del navegador</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
