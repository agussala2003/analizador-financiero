// src/components/ui/Loader.jsx
export default function Loader({
  size = "28",          // Tamaño de los puntos (ej: "1.5", "2", "3")
  fullScreen = false,  // Si true → ocupa toda la pantalla
  message = "",        // Texto opcional
  overlay = false,     // Si true → fondo oscuro semitransparente
}) {
  // Componente interno para los puntos pulsantes
  const Spinner = () => (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
      <div className={`w-${size} h-${size} border-4 text-blue-400 text-xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full`}>
        <div className="invisible">AS</div>
      </div>
    </div>
  );

  // Loader en pantalla completa u overlay
  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${
          overlay ? "bg-black/60 backdrop-blur-sm" : "bg-gray-900"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Spinner />
          {message && <p className="text-gray-200 text-2xl">{message}</p>}
        </div>
      </div>
    );
  }

  // Loader inline (para usar en botones, cards, etc.)
  // Ahora es horizontal para que se alinee mejor con el texto
  return (
    <div className="flex items-center justify-center gap-3 p-2">
      <Spinner />
      {message && <p className="text-gray-400 text-sm">{message}</p>}
    </div>
  );
}