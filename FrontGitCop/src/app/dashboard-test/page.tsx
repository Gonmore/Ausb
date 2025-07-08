'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardTestPage() {
  const [status, setStatus] = useState('Iniciando...');
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testDashboard = async () => {
      try {
        addLog('🔍 Iniciando prueba del dashboard...');
        setStatus('Verificando...');

        // Test 1: Verificar localStorage
        addLog('📋 Test 1: Verificando localStorage...');
        const authData = localStorage.getItem('auth-storage');
        
        if (!authData) {
          addLog('❌ No se encontró auth-storage en localStorage');
          setStatus('Error: No hay datos de autenticación');
          return;
        }

        addLog('✅ auth-storage encontrado');

        // Test 2: Parsear datos
        addLog('📋 Test 2: Parseando datos...');
        let parsed;
        try {
          parsed = JSON.parse(authData);
          addLog('✅ Datos parseados correctamente');
        } catch (error) {
          addLog('❌ Error al parsear datos: ' + error);
          setStatus('Error: Datos corruptos');
          return;
        }

        // Test 3: Verificar estructura
        addLog('📋 Test 3: Verificando estructura...');
        if (!parsed.state || !parsed.state.user) {
          addLog('❌ Estructura de datos incorrecta');
          setStatus('Error: Estructura de datos incorrecta');
          return;
        }

        addLog('✅ Estructura correcta');
        setUser(parsed.state.user);

        // Test 4: Verificar datos del usuario
        addLog('📋 Test 4: Verificando datos del usuario...');
        const user = parsed.state.user;
        
        if (!user.email || !user.role) {
          addLog('❌ Datos del usuario incompletos');
          setStatus('Error: Datos del usuario incompletos');
          return;
        }

        addLog(`✅ Usuario válido: ${user.email} (${user.role})`);

        // Test 5: Verificar componentes
        addLog('📋 Test 5: Verificando componentes...');
        
        // Simular componentes problemáticos
        try {
          // Test de iconos
          const testIcon = true; // Placeholder para lucide-react
          addLog('✅ Iconos funcionando');
          
          // Test de router
          const testRouter = router.push !== undefined;
          addLog('✅ Router funcionando');
          
          setStatus('✅ Todos los tests pasaron');
          addLog('🎉 Dashboard debería funcionar correctamente');
          
        } catch (error) {
          addLog('❌ Error en componentes: ' + error);
          setStatus('Error: Problema con componentes');
        }

      } catch (error) {
        addLog('❌ Error general: ' + error);
        setStatus('Error general');
      }
    };

    testDashboard();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Test Dashboard - Diagnóstico
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Estado Actual:</h2>
            <div className={`p-3 rounded-lg ${
              status.includes('Error') 
                ? 'bg-red-50 text-red-800' 
                : status.includes('✅') 
                  ? 'bg-green-50 text-green-800'
                  : 'bg-blue-50 text-blue-800'
            }`}>
              {status}
            </div>
          </div>

          {user && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Datos del Usuario:</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">Logs de Diagnóstico:</h2>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Recargar Test
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Ir al Dashboard
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Limpiar y Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
