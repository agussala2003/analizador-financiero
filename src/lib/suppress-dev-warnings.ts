// src/lib/suppress-dev-warnings.ts

/**
 * Suprime warnings específicos de desarrollo que no afectan la funcionalidad.
 * Solo se ejecuta en modo desarrollo.
 * 
 * Warnings suprimidos:
 * - Preload resource not used (Vite lazy loading)
 * - React DevTools recommendation
 * - Performance violations menores (< 100ms)
 */

if (import.meta.env.DEV) {
  // Guardar el console.warn original
  const originalWarn = console.warn;
  const originalError = console.error;

  // Lista de patterns a ignorar en desarrollo
  const ignoredWarnings = [
    'Download the React DevTools',
    'was preloaded using link preload but not used',
    'preload',
  ];

  const ignoredPerformanceViolations = [
    "'setTimeout' handler took",
    "'requestIdleCallback' handler took",
  ];

  // Sobrescribir console.warn
  console.warn = (...args: unknown[]) => {
    const message = args.join(' ');
    
    // Ignorar warnings de la lista
    if (ignoredWarnings.some(pattern => 
      typeof message === 'string' && message.includes(pattern)
    )) {
      return;
    }

    // Ignorar violations menores de performance (< 100ms)
    if (ignoredPerformanceViolations.some(pattern => 
      typeof message === 'string' && message.includes(pattern)
    )) {
      const regex = /(\d+)ms/;
      const match = regex.exec(message);
      if (match && parseInt(match[1]) < 100) {
        return; // Solo ignorar si es < 100ms
      }
    }

    // Mostrar el resto de warnings
    originalWarn.apply(console, args);
  };

  // Sobrescribir console.error para filtrar algunos errores de desarrollo
  console.error = (...args: unknown[]) => {
    const message = args.join(' ');
    
    // Ignorar errores específicos de preload en dev
    if (typeof message === 'string' && message.includes('credentials mode does not match')) {
      return;
    }

    // Mostrar el resto de errores
    originalError.apply(console, args);
  };

  // Log de que el sistema de supresión está activo
  console.log(
    '%c[Dev] Warning suppression active',
    'color: #10b981; font-weight: bold',
    '\n- Preload warnings: suppressed',
    '\n- Performance violations < 100ms: suppressed',
    '\n- React DevTools prompts: suppressed'
  );
}

export {};
