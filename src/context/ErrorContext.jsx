// src/context/ErrorContext.jsx
import { createContext, useContext, useMemo, useState } from 'react';

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null); // { title, message, detail? }

  const showError = (message, options = {}) => {
    setError({
      title: options.title || 'Ocurrió un problema',
      message,
      detail: options.detail || null,
    });
  };

  const clearError = () => setError(null);

  const value = useMemo(() => ({ error, showError, clearError }), [error]);
  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
}

export function useError() {
  return useContext(ErrorContext);
}
