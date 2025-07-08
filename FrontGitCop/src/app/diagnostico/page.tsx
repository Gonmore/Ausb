'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DiagnosticPage() {
  const [logs, setLogs] = useState<string[]>([])
  const { user, token, isAuthenticated, error } = useAuthStore()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Página de diagnóstico cargada')
    addLog(`Estado autenticado: ${isAuthenticated}`)
    addLog(`Token presente: ${token ? 'Sí' : 'No'}`)
    addLog(`Usuario: ${user ? user.username : 'No'}`)
    addLog(`Error: ${error || 'Ninguno'}`)
  }, [isAuthenticated, token, user, error])

  const testSocialLogin = (provider: 'google' | 'facebook') => {
    addLog(`Probando ${provider} login...`)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const url = `${baseUrl}/auth/${provider}`
      addLog(`Redirigiendo a: ${url}`)
      window.location.href = url
    } catch (err) {
      addLog(`Error: ${err}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnóstico de Autenticación</CardTitle>
          <CardDescription>
            Página para diagnosticar problemas con el login y social login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Estado de Autenticación</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sí' : '❌ No'}</p>
                <p><strong>Token:</strong> {token ? `✅ Presente (${token.substring(0, 20)}...)` : '❌ No'}</p>
                <p><strong>Usuario:</strong> {user ? `✅ ${user.username} (${user.email})` : '❌ No'}</p>
                <p><strong>Error:</strong> {error || '✅ Ninguno'}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Configuración</h3>
              <div className="space-y-1 text-sm">
                <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}</p>
                <p><strong>Entorno:</strong> {process.env.NODE_ENV || 'development'}</p>
                <p><strong>Puerto:</strong> {typeof window !== 'undefined' ? window.location.port : 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Botones de prueba */}
          <div className="space-y-4">
            <h3 className="font-medium">Pruebas de Social Login</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => testSocialLogin('google')}>
                Probar Google Login
              </Button>
              <Button onClick={() => testSocialLogin('facebook')}>
                Probar Facebook Login
              </Button>
            </div>
          </div>

          {/* Logs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Logs de Diagnóstico</h3>
              <Button onClick={clearLogs} variant="outline" size="sm">
                Limpiar Logs
              </Button>
            </div>
            <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p>No hay logs...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
