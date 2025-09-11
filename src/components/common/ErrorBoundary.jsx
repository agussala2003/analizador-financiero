// src/components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to your logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] bg-red-900/20 border border-red-600/50 rounded-lg p-6 m-4">
          <h2 className="text-lg font-bold text-red-400 mb-2">
            {this.props.title || 'Algo salió mal'}
          </h2>
          <p className="text-gray-300 mb-4">
            {this.props.message || 'Ha ocurrido un error inesperado en esta sección.'}
          </p>
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-300">
              Detalles técnicos
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
