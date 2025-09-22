import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';

interface Notification {
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
}

interface NotificationPreferences {
  new_application: boolean;
  application_accepted: boolean;
  application_rejected: boolean;
  interview_request: boolean;
  company_contact: boolean;
  relevant_offer: boolean;
  offer_expiring: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export const useNotifications = () => {
  const { token, user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // 🚀 Conectar WebSocket
  const connectWebSocket = useCallback(() => {
    if (!token || !user) return;

    try {
      const wsUrl = `ws://localhost:5000/ws/notifications?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 WebSocket conectado');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Error procesando mensaje WebSocket:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Intentar reconexión automática
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Reintentando conexión en ${delay}ms (intento ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
        // No mostrar el objeto error completo ya que puede causar problemas de serialización
        console.log('WebSocket error event triggered');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
    }
  }, [token, user]);

  // 🚀 Manejar mensajes del WebSocket
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'connection_established':
        console.log('✅ Conexión WebSocket establecida:', data.data);
        break;

      case 'notification':
        addNotification(data.data);
        break;

      case 'queued_notifications':
        data.data.forEach((notification: Notification) => {
          addNotification(notification);
        });
        break;

      case 'notification_marked_read':
        if (data.data.success) {
          markAsRead(data.data.notificationId);
        }
        break;

      case 'preferences_updated':
        console.log('⚙️ Preferencias actualizadas:', data.data);
        break;

      case 'pong':
        // Respuesta al ping - mantener conexión viva
        break;

      default:
        console.log('📨 Mensaje WebSocket no reconocido:', data.type);
    }
  };

  // 🚀 Agregar nueva notificación
  const addNotification = (notification: Notification) => {
    setNotifications(prev => {
      // Evitar duplicados
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      
      const newNotifications = [notification, ...prev];
      
      // Mantener solo las últimas 50 notificaciones
      return newNotifications.slice(0, 50);
    });

    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }

    // Mostrar notificación del navegador si está permitido
    if (Notification.permission === 'granted' && preferences?.push_notifications) {
      showBrowserNotification(notification);
    }
  };

  // 🚀 Mostrar notificación del navegador
  const showBrowserNotification = (notification: Notification) => {
    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.action?.url) {
          window.location.href = notification.action.url;
        }
        browserNotif.close();
      };

      // Auto-cerrar después de 5 segundos para prioridad baja/media
      if (notification.priority !== 'high') {
        setTimeout(() => browserNotif.close(), 5000);
      }
    } catch (error) {
      console.error('❌ Error mostrando notificación del navegador:', error);
    }
  };

  // 🚀 Marcar notificación como leída
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));

    // Enviar al servidor
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_notification_read',
        notificationId
      }));
    }
  }, []);

  // 🚀 Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marcando todas las notificaciones:', error);
    }
  }, [token]);

  // 🚀 Obtener historial de notificaciones
  const fetchNotificationHistory = useCallback(async (limit = 20, offset = 0) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/history?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('❌ Error obteniendo historial de notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🚀 Obtener preferencias
  const fetchPreferences = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('❌ Error obteniendo preferencias:', error);
    }
  }, [token]);

  // 🚀 Actualizar preferencias
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        setPreferences(prev => prev ? { ...prev, ...newPreferences } as NotificationPreferences : null);
        
        // Enviar al WebSocket también
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'update_preferences',
            preferences: newPreferences
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando preferencias:', error);
    }
  }, [token]);

  // 🚀 Solicitar permisos de notificación del navegador
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // 🚀 Enviar notificación de prueba
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:5000/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🧪 Notificación de Prueba',
          message: 'Esta es una notificación de prueba del sistema.',
          type: 'test',
          priority: 'medium'
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
      return false;
    }
  }, [token]);

  // 🚀 Efectos
  useEffect(() => {
    if (token && user) {
      connectWebSocket();
      fetchNotificationHistory();
      fetchPreferences();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [token, user, connectWebSocket, fetchNotificationHistory, fetchPreferences]);

  // 🚀 Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Estado
    notifications,
    unreadCount,
    isConnected,
    preferences,
    loading,

    // Acciones
    markAsRead,
    markAllAsRead,
    fetchNotificationHistory,
    updatePreferences,
    requestNotificationPermission,
    sendTestNotification,

    // Utilidades
    hasUnread: unreadCount > 0,
    recentNotifications: notifications.slice(0, 5),
    priorityNotifications: notifications.filter(n => n.priority === 'high' && !n.read)
  };
};