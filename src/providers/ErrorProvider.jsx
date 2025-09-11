// src/context/ErrorProvider.jsx
import { useState } from 'react';
import { ErrorContext } from '../context/ErrorContext';

export default function ErrorProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showError = (message, options = {}) => {
    setToast({ message, type: 'error', detail: options.detail });
    setTimeout(() => setToast(null), options.duration || 5000);
  };

  const showSuccess = (message, options = {}) => {
    setToast({ message, type: 'success', detail: options.detail });
    setTimeout(() => setToast(null), options.duration || 3000);
  };

  const showInfo = (message, options = {}) => {
    setToast({ message, type: 'info', detail: options.detail });
    setTimeout(() => setToast(null), options.duration || 4000);
  };

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white z-50
          ${toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <p className="font-bold">{toast.message}</p>
          {toast.detail && <p className="text-sm opacity-90">{toast.detail}</p>}
        </div>
      )}
    </ErrorContext.Provider>
  );
}
