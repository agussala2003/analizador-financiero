// src/hooks/useNotifications.js
import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { logger } from '../lib/logger';
import { NotificationContext } from '../context/notificationContext';

/**
 * Hook para gestión de notificaciones globales
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const timeouts = useRef({});
  const notificationId = useRef(0);

  // ✅ SOLUCIÓN: Declaramos `dismissNotification` primero.
  // Ahora, cuando `addNotification` la necesite, ya estará inicializada.
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }

    logger.info('NOTIFICATION_DISMISSED', 'Notificación descartada', { id });
  }, []);


  // Agregar notificación
  const addNotification = useCallback((notification) => {
    const id = ++notificationId.current;
    const {
      type = 'info',
      title,
      message,
      duration = 5000,
      persistent = false,
      action = null,
      data = {}
    } = notification;

    const newNotification = {
      id,
      type,
      title,
      message,
      duration,
      persistent,
      action,
      data,
      timestamp: new Date(),
      dismissed: false
    };

    setNotifications(prev => [...prev, newNotification]);

    logger.info('NOTIFICATION_ADDED', 'Notificación agregada', {
      id,
      type,
      title,
      persistent,
      duration
    });

    // Auto-dismiss si no es persistente
    if (!persistent && duration > 0) {
      timeouts.current[id] = setTimeout(() => {
        dismissNotification(id); // <-- Ahora esto funciona sin problemas
      }, duration);
    }

    return id;
  }, [dismissNotification]); // 👈 Añadimos dismissNotification como dependencia


  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    Object.values(timeouts.current).forEach(timeout => clearTimeout(timeout));
    timeouts.current = {};
    setNotifications([]);
    
    logger.info('NOTIFICATIONS_CLEARED', 'Todas las notificaciones limpiadas');
  }, []);

  // Notificaciones de conveniencia
  const success = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 8000,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((title, message, options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  // Notificación de loading
  const loading = useCallback((title, message = 'Procesando...') => {
    return addNotification({
      type: 'loading',
      title,
      message,
      persistent: true
    });
  }, [addNotification]);

  // Actualizar notificación existente
  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  // Notificaciones financieras específicas
  const financial = {
    priceAlert: useCallback((symbol, price, targetPrice) => {
      return addNotification({
        type: 'info',
        title: `Alerta de Precio - ${symbol}`,
        message: `${symbol} alcanzó $${price} (objetivo: $${targetPrice})`,
        duration: 10000,
        data: { symbol, price, targetPrice, type: 'price-alert' }
      });
    }, [addNotification]),

    dividendAlert: useCallback((symbol, amount, exDate) => {
      return addNotification({
        type: 'success',
        title: `Dividendo Anunciado - ${symbol}`,
        message: `$${amount} por acción, fecha ex-dividendo: ${exDate}`,
        duration: 8000,
        data: { symbol, amount, exDate, type: 'dividend-alert' }
      });
    }, [addNotification]),

    newsAlert: useCallback((title, summary, importance = 'medium') => {
      return addNotification({
        type: importance === 'high' ? 'warning' : 'info',
        title: 'Noticia Importante',
        message: `${title} - ${summary}`,
        duration: importance === 'high' ? 10000 : 6000,
        data: { title, summary, importance, type: 'news-alert' }
      });
    }, [addNotification]),

    portfolioChange: useCallback((change, percentage) => {
      const isPositive = change >= 0;
      return addNotification({
        type: isPositive ? 'success' : 'warning',
        title: 'Cambio en Portafolio',
        message: `${isPositive ? '+' : ''}$${change.toFixed(2)} (${isPositive ? '+' : ''}${percentage.toFixed(2)}%)`,
        duration: 6000,
        data: { change, percentage, type: 'portfolio-change' }
      });
    }, [addNotification])
  };

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    updateNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    loading,
    financial,
    count: notifications.length,
    hasNotifications: notifications.length > 0
  };
}

export function useGlobalNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useGlobalNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
}

/**
 * Hook para notificaciones de formularios
 */
export function useFormNotifications() {
  const { success, error, warning, loading, dismissNotification } = useGlobalNotifications();

  const notifySuccess = useCallback((action = 'guardado') => {
    return success(
      'Éxito',
      `Los datos han sido ${action} correctamente`
    );
  }, [success]);

  const notifyError = useCallback((message = 'Ocurrió un error inesperado') => {
    return error(
      'Error',
      message
    );
  }, [error]);

  const notifyValidationError = useCallback((fieldCount = 0) => {
    return warning(
      'Datos incompletos',
      `Por favor revise ${fieldCount > 0 ? `los ${fieldCount} campos` : 'los campos'} marcados en rojo`
    );
  }, [warning]);

  const notifyLoading = useCallback((action = 'Guardando') => {
    return loading(action, 'Por favor espere...');
  }, [loading]);

  return {
    notifySuccess,
    notifyError,
    notifyValidationError,
    notifyLoading,
    dismissNotification
  };
}

/**
 * Hook para notificaciones financieras específicas
 */
export function useFinancialNotifications() {
  const { financial, success, warning, info } = useGlobalNotifications();

  const notifyTradeExecuted = useCallback((symbol, quantity, price, type) => {
    return success(
      `${type === 'buy' ? 'Compra' : 'Venta'} Ejecutada`,
      `${quantity} acciones de ${symbol} a $${price}`
    );
  }, [success]);

  const notifyLimitReached = useCallback((symbol, limit, current) => {
    return warning(
      'Límite Alcanzado',
      `${symbol} alcanzó ${limit}. Precio actual: $${current}`
    );
  }, [warning]);

  const notifyMarketHours = useCallback((status) => {
    const messages = {
      open: 'El mercado está abierto',
      closed: 'El mercado está cerrado',
      premarket: 'Trading pre-mercado activo',
      afterhours: 'Trading post-mercado activo'
    };

    return info(
      'Estado del Mercado',
      messages[status] || 'Estado desconocido'
    );
  }, [info]);

  return {
    ...financial,
    notifyTradeExecuted,
    notifyLimitReached,
    notifyMarketHours
  };
}

export default useNotifications;