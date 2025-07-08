'use client';

import { useState, useEffect } from 'react';
import { applicationService } from '@/lib/application-service-v2';
import { config, getEnvironmentConfig } from '@/lib/config';

interface BackendManagerProps {
  onClose?: () => void;
}

export default function BackendManager({ onClose }: BackendManagerProps) {
  const [backendInfo, setBackendInfo] = useState<{ type: string; available: boolean } | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [envConfig, setEnvConfig] = useState<any>(null);

  useEffect(() => {
    loadBackendInfo();
    setEnvConfig(getEnvironmentConfig());
  }, []);

  const loadBackendInfo = async () => {
    try {
      const info = applicationService.getBackendInfo();
      setBackendInfo(info);
    } catch (error) {
      console.error('Error loading backend info:', error);
    }
  };

  const handleSwitchBackend = async (type: 'api' | 'localStorage') => {
    setIsLoading(true);
    try {
      const success = await applicationService.switchBackend(type);
      if (success) {
        setMigrationStatus(`✅ Cambiado a ${type === 'api' ? 'API' : 'localStorage'} exitosamente`);
        await loadBackendInfo();
      } else {
        setMigrationStatus(`❌ Error: ${type === 'api' ? 'API' : 'localStorage'} no disponible`);
      }
    } catch (error) {
      setMigrationStatus('❌ Error al cambiar backend');
      console.error('Switch backend error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationStatus('🔄 Iniciando migración...');
    
    try {
      const result = await applicationService.migrateToAPI();
      
      if (result.success) {
        setMigrationStatus(`✅ ${result.message}`);
        
        // Cambiar automáticamente a API tras migración exitosa
        setTimeout(async () => {
          await handleSwitchBackend('api');
        }, 2000);
      } else {
        setMigrationStatus(`❌ ${result.message}`);
        if (result.details) {
          console.log('Migration details:', result.details);
        }
      }
    } catch (error) {
      setMigrationStatus('❌ Error crítico durante la migración');
      console.error('Migration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMigrationStatus = () => {
    setMigrationStatus('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">⚙️ Administrador de Backend</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Información del entorno */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">🌍 Configuración del Entorno</h3>
            {envConfig && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Entorno:</strong> {envConfig.environment}</div>
                <div><strong>URL API:</strong> {envConfig.apiURL}</div>
                <div><strong>Usar API:</strong> {envConfig.useAPI ? '✅' : '❌'}</div>
                <div><strong>Datos Mock:</strong> {envConfig.mockData ? '✅' : '❌'}</div>
              </div>
            )}
          </div>

          {/* Estado actual del backend */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Backend Actual</h3>
            {backendInfo ? (
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  backendInfo.type === 'API' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {backendInfo.type === 'API' ? '🌐 API REST' : '💾 localStorage'}
                </span>
                <span className={`text-sm ${
                  backendInfo.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {backendInfo.available ? '✅ Disponible' : '❌ No disponible'}
                </span>
              </div>
            ) : (
              <div className="text-gray-500">Cargando información...</div>
            )}
          </div>

          {/* Controles de cambio de backend */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">🔄 Cambiar Backend</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSwitchBackend('localStorage')}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                💾 Usar localStorage
              </button>
              <button
                onClick={() => handleSwitchBackend('api')}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                🌐 Usar API
              </button>
            </div>
          </div>

          {/* Migración de datos */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">📤 Migración de Datos</h3>
            <p className="text-sm text-gray-600 mb-3">
              Migrar aplicaciones desde localStorage hacia la API. Esto es útil cuando 
              cambias de desarrollo a producción.
            </p>
            <button
              onClick={handleMigration}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '🔄 Migrando...' : '📤 Migrar a API'}
            </button>
          </div>

          {/* Estado de la migración */}
          {migrationStatus && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">{migrationStatus}</div>
                <button
                  onClick={clearMigrationStatus}
                  className="text-gray-500 hover:text-gray-700 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Consejos</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• <strong>localStorage:</strong> Ideal para desarrollo y pruebas</li>
              <li>• <strong>API:</strong> Necesario para producción y datos compartidos</li>
              <li>• <strong>Migración:</strong> Transfiere datos de localStorage a la API</li>
              <li>• <strong>Fallback automático:</strong> Se activa si la API falla</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
