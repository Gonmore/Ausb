import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Settings, ExternalLink, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: 'low' | 'medium' | 'high';
    read: boolean;
    timestamp: string;
    metadata?: any;
    action?: {
      type: string;
      url?: string;
      message?: string;
    };
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'new_application':
      case 'application_accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'application_rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'interview_request':
      case 'company_contact':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'relevant_offer':
        return <Info className="w-5 h-5 text-purple-500" />;
      case 'offer_expiring':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    if (notification.action?.url) {
      window.open(notification.action.url, '_blank');
    }
  };

  return (
    <div
      className={`p-4 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        getPriorityColor()
      } ${!notification.read ? 'border-r-4 border-r-blue-400' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium truncate ${
              !notification.read ? 'text-gray-900' : 'text-gray-600'
            }`}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2 ml-2">
              {notification.action?.url && (
                <ExternalLink className="w-4 h-4 text-gray-400" />
              )}
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className={`text-sm mt-1 ${
            !notification.read ? 'text-gray-800' : 'text-gray-500'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
                locale: es
              })}
            </span>
            
            {notification.action?.message && (
              <span className="text-xs text-blue-600 font-medium">
                {notification.action.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: any;
  onUpdatePreferences: (preferences: any) => void;
  onRequestPermission: () => Promise<boolean>;
  onSendTest: () => Promise<boolean>;
}

const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onRequestPermission,
  onSendTest
}) => {
  const [localPreferences, setLocalPreferences] = useState(preferences || {});
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    await onUpdatePreferences(localPreferences);
    onClose();
  };

  const handleTestNotification = async () => {
    const success = await onSendTest();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const handleRequestPermission = async () => {
    await onRequestPermission();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Preferencias de Notificaciones
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notificaciones del Navegador */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Notificaciones del Navegador</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permitir notificaciones</span>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {Notification.permission === 'granted' ? 'Permitidas' : 'Permitir'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notificación de prueba</span>
              <button
                onClick={handleTestNotification}
                disabled={testSent}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
              >
                {testSent ? 'Enviada ✓' : 'Enviar Prueba'}
              </button>
            </div>
          </div>

          {/* Tipos de Notificaciones */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Tipos de Notificaciones</h4>
            
            {[
              { key: 'new_application', label: 'Nuevas postulaciones' },
              { key: 'application_accepted', label: 'Postulaciones aceptadas' },
              { key: 'application_rejected', label: 'Postulaciones rechazadas' },
              { key: 'interview_request', label: 'Solicitudes de entrevista' },
              { key: 'company_contact', label: 'Contacto de empresas' },
              { key: 'relevant_offer', label: 'Ofertas relevantes' },
              { key: 'offer_expiring', label: 'Ofertas por vencer' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localPreferences[key] || false}
                    onChange={(e) => setLocalPreferences((prev: any) => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          {/* Canales de Notificación */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Canales</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notificaciones por email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localPreferences.email_notifications || false}
                  onChange={(e) => setLocalPreferences((prev: any) => ({
                    ...prev,
                    email_notifications: e.target.checked
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Notificaciones push</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localPreferences.push_notifications || false}
                  onChange={(e) => setLocalPreferences((prev: any) => ({
                    ...prev,
                    push_notifications: e.target.checked
                  }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    preferences,
    loading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    requestNotificationPermission,
    sendTestNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        
        {/* Connection Status */}
        <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Configurar notificaciones"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center mt-2 text-xs">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.slice(0, 10).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        onRequestPermission={requestNotificationPermission}
        onSendTest={sendTestNotification}
      />
    </div>
  );
};