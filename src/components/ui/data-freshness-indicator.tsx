/**
 * DataFreshnessIndicator Component
 * 
 * Muestra un indicador visual de la antigüedad de los datos con colores
 * según el tiempo transcurrido desde la última actualización.
 * 
 * Escalas de colores:
 * - Verde (< 1 hora): Datos muy frescos
 * - Amarillo (1-12 horas): Datos relativamente frescos
 * - Naranja (12-24 horas): Datos desactualizados
 * - Rojo (> 24 horas): Datos muy antiguos
 * 
 * @example
 * ```tsx
 * <DataFreshnessIndicator 
 *   lastUpdated={new Date('2025-10-20T08:00:00')} 
 *   label="Datos del mercado"
 * />
 * ```
 */

import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/**
 * Props para el componente DataFreshnessIndicator
 */
interface DataFreshnessIndicatorProps {
  /** Fecha de última actualización de los datos */
  lastUpdated: Date | string;
  /** Etiqueta descriptiva opcional */
  label?: string;
  /** Tamaño del indicador */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar solo el ícono (sin texto) */
  iconOnly?: boolean;
  /** Callback cuando el usuario hace click (para implementar refresh) */
  onRefresh?: () => void;
  /** Indica si está en proceso de actualización */
  isRefreshing?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Calcula la antigüedad de los datos y retorna información sobre su frescura
 */
function getDataFreshness(lastUpdated: Date | string) {
  const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Determinar el nivel de frescura
  let level: 'fresh' | 'recent' | 'stale' | 'very-stale';
  let color: string;
  let bgColor: string;
  let text: string;
  let tooltip: string;

  if (diffHours < 1) {
    level = 'fresh';
    color = 'text-green-600 dark:text-green-400';
    bgColor = 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
    text = diffMinutes < 1 ? 'Recién actualizado' : `Hace ${diffMinutes} min`;
    tooltip = 'Datos muy frescos (< 1 hora)';
  } else if (diffHours < 12) {
    level = 'recent';
    color = 'text-yellow-600 dark:text-yellow-400';
    bgColor = 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    text = `Hace ${diffHours}h`;
    tooltip = 'Datos relativamente frescos (< 12 horas)';
  } else if (diffHours < 24) {
    level = 'stale';
    color = 'text-orange-600 dark:text-orange-400';
    bgColor = 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
    text = `Hace ${diffHours}h`;
    tooltip = 'Datos desactualizados (< 24 horas)';
  } else {
    level = 'very-stale';
    color = 'text-red-600 dark:text-red-400';
    bgColor = 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    text = diffDays === 1 ? 'Hace 1 día' : `Hace ${diffDays} días`;
    tooltip = 'Datos muy antiguos (> 24 horas)';
  }

  return { level, color, bgColor, text, tooltip, date };
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  label,
  size = 'md',
  iconOnly = false,
  onRefresh,
  isRefreshing = false,
  className,
}) => {
  const { color, bgColor, text, tooltip, date } = getDataFreshness(lastUpdated);

  // Tamaños según prop
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const formattedDate = date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullTooltip = `${tooltip}\nÚltima actualización: ${formattedDate}`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center rounded-md border',
              bgColor,
              sizeClasses[size],
              onRefresh && !isRefreshing && 'cursor-pointer hover:opacity-80 transition-opacity',
              isRefreshing && 'opacity-60',
              className
            )}
            onClick={!isRefreshing ? onRefresh : undefined}
            role={onRefresh ? 'button' : undefined}
            aria-label={onRefresh ? 'Actualizar datos' : undefined}
          >
            {isRefreshing ? (
              <RefreshCw
                size={iconSizes[size]}
                className={cn(color, 'animate-spin')}
              />
            ) : (
              <Clock size={iconSizes[size]} className={color} />
            )}
            
            {!iconOnly && (
              <span className={cn('font-medium', color)}>
                {label && <span className="opacity-70">{label}: </span>}
                {text}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs whitespace-pre-line">
          <p>{fullTooltip}</p>
          {onRefresh && !isRefreshing && (
            <p className="text-xs mt-1 opacity-70">Click para actualizar</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
