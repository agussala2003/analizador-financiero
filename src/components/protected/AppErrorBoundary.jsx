// src/components/AppErrorBoundary.jsx
import React from 'react';
import { useError } from '../../hooks/useError';

export default class AppErrorBoundary extends React.Component {
  static contextType = React.createContext(null);

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  componentDidCatch(error, info) {
    // Mostramos un fallback y además lanzamos el modal global
    this.setState({ hasError: true, error, info });
    // no tenemos hooks aquí, así que notificamos por evento:
    window.dispatchEvent(new CustomEvent('app-error', { detail: { error, info }}));
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
          <div className="max-w-md text-center px-6">
            <h1 className="text-2xl font-bold mb-2">Algo se rompió 😵</h1>
            <p className="text-sm text-slate-300">
              Reintentá la acción o recargá la página. Si persiste, contactá soporte.
            </p>
            <button
              onClick={() => location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Hook pequeño para escuchar y mandar al ErrorModal
export function AppErrorBridge() {
  const { showError } = useError();
  React.useEffect(() => {
    const handler = (e) => {
      const { error } = e.detail || {};
      showError('Se produjo un error inesperado en la interfaz.', { detail: error?.stack || String(error) });
    };
    window.addEventListener('app-error', handler);
    return () => window.removeEventListener('app-error', handler);
  }, [showError]);
  return null;
}
