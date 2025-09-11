// src/components/onboarding/TooltipSystem.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTour } from '../../hooks/useTour';

/**
 * Componente de Tooltip Contextual (Ahora consume el contexto)
 */
export function ContextualTooltip() {
  const { isActive, tooltip, position, nextStep, skipTour, endTour } = useTour();

  if (!isActive || !tooltip) return null;

  const { content, placement = 'top', element } = tooltip;

  const getArrowClasses = () => {
    // ... (Esta función no cambia, la puedes copiar de tu archivo original)
    switch (placement) {
      case 'top': return 'top-full left-1/2 -translate-x-1/2 border-t-gray-800';
      case 'bottom': return 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800';
      case 'left': return 'left-full top-1/2 -translate-y-1/2 border-l-gray-800';
      case 'right': return 'right-full top-1/2 -translate-y-1/2 border-r-gray-800';
      default: return 'top-full left-1/2 -translate-x-1/2 border-t-gray-800';
    }
  };

  const getTooltipClasses = () => {
    // ... (Esta función no cambia)
    switch (placement) {
      case 'top': return '-translate-x-1/2 -translate-y-full';
      case 'bottom': return '-translate-x-1/2';
      case 'left': return '-translate-x-full -translate-y-1/2';
      case 'right': return '-translate-y-1/2';
      default: return '-translate-x-1/2 -translate-y-full';
    }
  };

  const rect = element.getBoundingClientRect();

  return createPortal(
    <>
      <div
        className="fixed z-[9010] pointer-events-none transition-all duration-300"
        style={{
          left: rect.left - 4,
          top: rect.top - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '8px'
        }}
      />
      
      <div
        className={`fixed z-[9020] animate-fade-in-fast ${getTooltipClasses()}`}
        style={{ left: position.x, top: position.y }}
      >
        <div className="relative bg-gray-800 text-white rounded-lg shadow-xl max-w-sm border border-gray-700">
          <div className={`absolute w-0 h-0 border-[6px] border-transparent ${getArrowClasses()}`} />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
            <p className="text-sm leading-relaxed">{content.description}</p>
          </div>
          <div className="px-4 pb-3 flex items-center justify-between">
            <button onClick={skipTour} className="text-xs text-gray-400 hover:text-white">Saltar tour</button>
            <div className="flex space-x-2">
              <button onClick={endTour} className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded">Cerrar</button>
              <button onClick={nextStep} className="px-4 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded font-semibold">{content.nextLabel || 'Siguiente'}</button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

/**
 * Componente para iniciar el tour del dashboard automáticamente la primera vez
 */
export function AutoDashboardTour({ tourSteps }) {
  const { startTour, isActive } = useTour();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('dashboard_tour_completed');
    if (!hasSeenTour && !isActive) {
      const timer = setTimeout(() => startTour(tourSteps), 1500); // Inicia después de 1.5s
      return () => clearTimeout(timer);
    }
  }, [startTour, isActive, tourSteps]);

  useEffect(() => {
    if (!isActive && tourSteps.length > 0) {
      // Marcamos como completado una vez que el tour finaliza.
      localStorage.setItem('dashboard_tour_completed', 'true');
    }
  }, [isActive, tourSteps]);

  return null; // Este componente no renderiza nada visible
}

/**
 * Botón genérico para iniciar cualquier tour
 */
export function TourButton({ tourSteps, label = "Iniciar Tour", className="" }) {
  const { startTour } = useTour();

  return (
    <button
      onClick={() => startTour(tourSteps)}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors ${className}`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {label}
    </button>
  );
}