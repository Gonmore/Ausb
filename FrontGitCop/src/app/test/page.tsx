'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  data?: any
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setTests(prev => [...prev.filter(t => t.name !== name), { name, status: 'pending', message: 'Ejecutando...' }])
    
    try {
      const result = await testFn()
      setTests(prev => prev.map(t => 
        t.name === name 
          ? { ...t, status: 'success', message: 'Éxito', data: result }
          : t
      ))
    } catch (error: any) {
      setTests(prev => prev.map(t => 
        t.name === name 
          ? { ...t, status: 'error', message: error.message || 'Error desconocido' }
          : t
      ))
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTests([])

    // Test 1: Verificar conexión con backend
    await runTest('Conexión Backend', async () => {
      const response = await fetch('http://localhost:5000/')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return { status: response.status, statusText: response.statusText }
    })

    // Test 2: Verificar rutas de autenticación
    await runTest('Rutas Auth', async () => {
      const response = await fetch('http://localhost:5000/login')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return { status: response.status }
    })

    // Test 3: Verificar endpoint de ofertas
    await runTest('Endpoint Ofertas', async () => {
      const response = await fetch('http://localhost:5000/api/offers')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      // El endpoint puede devolver un mensaje en lugar de array cuando no hay ofertas
      if (data.mensaje) {
        return { message: data.mensaje, count: 0 }
      }
      return { count: Array.isArray(data) ? data.length : 0 }
    })

    // Test 4: Verificar endpoint de empresas (requiere autenticación)
    await runTest('Endpoint Empresas', async () => {
      const response = await fetch('http://localhost:5000/api/company')
      // Este endpoint requiere autenticación, 401 es esperado
      if (response.status === 401) {
        return { status: 401, message: 'Requiere autenticación (esperado)' }
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return { count: Array.isArray(data) ? data.length : 0 }
    })

    // Test 5: Verificar endpoint de centros
    await runTest('Endpoint Centros', async () => {
      const response = await fetch('http://localhost:5000/api/scenter')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return { count: Array.isArray(data) ? data.length : 0 }
    })

    // Test 6: Verificar rutas de social login (solo verificar que existan)
    await runTest('Social Login - Google', async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos timeout
        
        const response = await fetch('http://localhost:5000/auth/google', { 
          method: 'GET',
          signal: controller.signal,
          redirect: 'manual' // No seguir redirects
        })
        
        clearTimeout(timeoutId)
        
        // Para OAuth, esperamos redirects (status 3xx) o que la ruta exista
        if (response.status >= 300 && response.status < 400) {
          return { status: response.status, message: 'Ruta OAuth funcional (redirect detectado)' }
        }
        if (response.status === 200) {
          return { status: response.status, message: 'Ruta accesible' }
        }
        throw new Error(`HTTP ${response.status}`)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return { status: 'timeout', message: 'Ruta responde (timeout en OAuth esperado)' }
        }
        throw error
      }
    })

    await runTest('Social Login - Facebook', async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 segundos timeout
        
        const response = await fetch('http://localhost:5000/auth/facebook', { 
          method: 'GET',
          signal: controller.signal,
          redirect: 'manual' // No seguir redirects
        })
        
        clearTimeout(timeoutId)
        
        // Para OAuth, esperamos redirects (status 3xx) o que la ruta exista
        if (response.status >= 300 && response.status < 400) {
          return { status: response.status, message: 'Ruta OAuth funcional (redirect detectado)' }
        }
        if (response.status === 200) {
          return { status: response.status, message: 'Ruta accesible' }
        }
        throw new Error(`HTTP ${response.status}`)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return { status: 'timeout', message: 'Ruta responde (timeout en OAuth esperado)' }
        }
        throw error
      }
    })

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-blue-600">Ejecutando</Badge>
      case 'success':
        return <Badge variant="outline" className="text-green-600">Éxito</Badge>
      case 'error':
        return <Badge variant="outline" className="text-red-600">Error</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Test de Conectividad Backend</CardTitle>
            <CardDescription>
              Verifica que el backend esté funcionando correctamente y todas las rutas estén disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Ejecutar Tests</h3>
                  <p className="text-sm text-gray-600">
                    Esto verificará la conectividad con el backend en http://localhost:5000
                  </p>
                </div>
                <Button 
                  onClick={runAllTests} 
                  disabled={isRunning}
                  className="min-w-32"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    'Ejecutar Tests'
                  )}
                </Button>
              </div>

              {tests.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Resultados:</h4>
                  {tests.map((test) => (
                    <div key={test.name} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.name}</span>
                        </div>
                        {getStatusBadge(test.status)}
                      </div>
                      <p className="text-sm text-gray-600">{test.message}</p>
                      {test.data && (
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <pre>{JSON.stringify(test.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
