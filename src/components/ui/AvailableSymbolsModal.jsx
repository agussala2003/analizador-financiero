// src/components/ui/AvailableSymbolsModal.jsx
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
// Ícono simple para el botón de cierre
function XIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AvailableSymbolsModal({ isOpen, onClose }) {
  const { profile } = useAuth();
  const role = profile?.role || 'basico';
  const isBasicPlan = role === 'basico';
  const config = useConfig();

  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Convertimos el Set a un Array para poder mapearlo
  const freeSymbolsArray = [...config.plans.freeTierSymbols].sort();

  return (
    // Fondo oscuro semi-transparente que cierra el modal al hacer clic
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in-fast p-4">
      {/* Contenido del modal. stopPropagation evita que el clic se propague al fondo */}
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700 text-left">
        {/* Header del Modal */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Instrumentos Disponibles</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido Dinámico */}
        <div className="text-gray-300 text-sm">
          <p className="mb-4">
            Tu plan actual es <span className="font-bold capitalize text-blue-400">{role}</span>.
          </p>
          {isBasicPlan ? (
            <>
              <p className="mb-3">Con este plan, tenés acceso a los siguientes instrumentos de forma gratuita:</p>
              <div className="max-h-60 overflow-y-auto bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-4 gap-y-2">
                  {freeSymbolsArray.map(symbol => (
                    <code key={symbol} className="text-gray-300">{symbol}</code>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400">Para acceder a todos los instrumentos disponibles, considerá mejorar tu plan.</p>
            </>
          ) : (
            <p>¡Buenas noticias! Tu plan te da acceso a **todos los instrumentos** disponibles en la plataforma. Podés buscar cualquier activo que desees.</p>
          )}
        </div>
        
        {/* Footer del Modal */}
        <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105"
            >
              Entendido
            </button>
        </div>
      </div>
    </div>
  );
}