// src/components/ui/ErrorModal.jsx
import { useError } from "../../hooks/useError";

// Ícono simple de Alerta (SVG) para usar en el modal
function AlertTriangleIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}


export default function ErrorModal() {
  const { error, clearError } = useError();
  if (!error) return null;

  return (
    // Fondo oscuro semi-transparente con efecto de aparición
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in-fast p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-6 border border-red-500/30 text-center">
        
        {/* Ícono y Título */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 mb-4">
          <AlertTriangleIcon className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{error.title || 'Ocurrió un Error'}</h3>
        
        {/* Mensaje principal */}
        <p className="text-gray-300 text-sm mb-4">{error.message}</p>

        {/* Botón de cierre */}
        <button
          onClick={clearError}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}