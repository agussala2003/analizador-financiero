import { useState, useEffect } from 'react';
import { ErrorContext } from '../context/errorContext';
import ErrorIcon from '../components/svg/error';
import SuccessIcon from '../components/svg/success';
import InfoIcon from '../components/dashboard/InfoIcon';

// --- Iconos para cada tipo de Toast ---
const ICONS = {
  success: <SuccessIcon />,
  error: <ErrorIcon />,
  info: <InfoIcon />
};

// --- Componente Toast individual rediseñado ---
function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300); // Espera a que termine la animación de salida
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);
  
  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  const typeStyles = {
    error:   { bg: 'bg-red-500',   bar: 'bg-red-300' },
    success: { bg: 'bg-green-500', bar: 'bg-green-300' },
    info:    { bg: 'bg-blue-500',  bar: 'bg-blue-300' },
  };

  const styles = typeStyles[toast.type] || typeStyles.info;

  return (
    <div 
      className={`
        fixed bottom-5 right-5 w-[350px] max-w-[90vw]
        rounded-lg shadow-2xl text-white overflow-hidden
        transition-all duration-300 ease-in-out
        ${styles.bg}
        ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">{ICONS[toast.type]}</div>
        <div className="ml-3 flex-1">
          <p className="font-bold text-base">{toast.message}</p>
          {toast.detail && <p className="text-sm opacity-90 mt-1">{toast.detail}</p>}
        </div>
        <button onClick={handleDismiss} className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-black/20">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
      {/* Barra de progreso */}
      <div 
        className={`h-1 ${styles.bar} animate-progress`}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </div>
  );
}


export default function ErrorProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, options, type, defaultDuration) => {
    const newToast = {
      id: Date.now(), // ID único para cada toast
      message,
      type,
      detail: options.detail,
      duration: options.duration || defaultDuration,
    };
    setToast(newToast);
  };
  
  const showError = (message, options = {}) => showToast(message, options, 'error', 5000);
  const showSuccess = (message, options = {}) => showToast(message, options, 'success', 3000);
  const showInfo = (message, options = {}) => showToast(message, options, 'info', 4000);

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children} 
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </ErrorContext.Provider>
  );
}