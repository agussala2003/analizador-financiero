// src/components/ui/Loader.jsx
export default function Loader({
  size = "md",          // "sm", "md", "lg", "xl" o tamaño personalizado como "32px"
  fullScreen = false,   // Si true → ocupa toda la pantalla con overlay
  message = "",         // Texto opcional
  className = "",       // Clases adicionales
  variant = "spin",     // "spin", "dots", "pulse"
  color = "blue",       // "blue", "white", "gray"
}) {
  // Mapeo de tamaños predefinidos
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4", 
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4"
  };

  // Mapeo de colores
  const colorClasses = {
    blue: "border-gray-300 border-t-blue-500 text-blue-500",
    white: "border-gray-600 border-t-white text-white",
    gray: "border-gray-400 border-t-gray-600 text-gray-600"
  };

  // Determinar clases de tamaño
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const colorClass = colorClasses[color] || colorClasses.blue;

  // Componente de spinner principal
  const SpinLoader = () => (
    <div 
      className={`${sizeClass} ${colorClass} animate-spin rounded-full`}
      role="status"
      aria-label={message || "Cargando"}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );

  // Loader de puntos pulsantes
  const DotsLoader = () => (
    <div className="flex space-x-1" role="status" aria-label={message || "Cargando"}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 ${color === 'blue' ? 'bg-blue-500' : color === 'white' ? 'bg-white' : 'bg-gray-500'} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );

  // Loader de pulso
  const PulseLoader = () => (
    <div 
      className={`${sizeClass} ${color === 'blue' ? 'bg-blue-500' : color === 'white' ? 'bg-white' : 'bg-gray-500'} rounded-full animate-pulse opacity-75`}
      role="status"
      aria-label={message || "Cargando"}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );

  // Seleccionar variante
  const LoaderComponent = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      default:
        return <SpinLoader />;
    }
  };

  // Loader en pantalla completa con overlay
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Cargando contenido"
      >
        <div className="flex flex-col items-center justify-center space-y-4 bg-gray-800/90 rounded-lg p-8 shadow-2xl">
          <LoaderComponent />
          {message && (
            <p className="text-white text-lg font-medium text-center max-w-xs">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loader inline (para usar en botones, cards, etc.)
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <LoaderComponent />
      {message && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}