/**
 * AssetFreshnessBadge Component
 * 
 * Muestra un badge compacto con la antigüedad de los datos de un activo específico.
 * Usa el mismo sistema de colores que DataFreshnessIndicator pero en formato badge pequeño.
 * 
 * @example
 * ```tsx
 * <AssetFreshnessBadge lastUpdated={new Date('2025-10-22T08:00:00')} />
 * ```
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface AssetFreshnessBadgeProps {
  /** Fecha de última actualización del activo */
  lastUpdated: Date | null;
  /** Tamaño del badge */
  size?: 'xs' | 'sm';
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Calcula la antigüedad y el color apropiado
 */
function getFreshnessInfo(lastUpdated: Date | null) {
  if (!lastUpdated) {
    return {
      level: 'unknown' as const,
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
      text: 'Sin datos',
      tooltip: 'No hay información de actualización disponible',
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - lastUpdated.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let level: 'fresh' | 'recent' | 'stale' | 'very-stale';
  let color: string;
  let bgColor: string;
  let text: string;
  let tooltip: string;

  if (diffHours < 1) {
    level = 'fresh';
    color = 'text-green-700 dark:text-green-400';
    bgColor = 'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800';
    text = diffMinutes < 1 ? 'Ahora' : `${diffMinutes}m`;
    tooltip = 'Datos muy frescos (< 1 hora)';
  } else if (diffHours < 12) {
    level = 'recent';
    color = 'text-yellow-700 dark:text-yellow-400';
    bgColor = 'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800';
    text = `${diffHours}h`;
    tooltip = 'Datos relativamente frescos (< 12 horas)';
  } else if (diffHours < 24) {
    level = 'stale';
    color = 'text-orange-700 dark:text-orange-400';
    bgColor = 'bg-orange-100 dark:bg-orange-950 border-orange-300 dark:border-orange-800';
    text = `${diffHours}h`;
    tooltip = 'Datos desactualizados (< 24 horas)';
  } else {
    level = 'very-stale';
    color = 'text-red-700 dark:text-red-400';
    bgColor = 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800';
    text = diffDays === 1 ? '1d' : `${diffDays}d`;
    tooltip = 'Datos muy antiguos (> 24 horas)';
  }

  const formattedDate = lastUpdated.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { level, color, bgColor, text, tooltip: `${tooltip}\nÚltima actualización: ${formattedDate}` };
}

export const AssetFreshnessBadge: React.FC<AssetFreshnessBadgeProps> = ({
  lastUpdated,
  size = 'xs',
  className,
}) => {
  const { color, bgColor, text, tooltip } = getFreshnessInfo(lastUpdated);

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    sm: 'text-xs px-2 py-1 gap-1',
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center rounded border font-medium whitespace-nowrap',
              bgColor,
              sizeClasses[size],
              className
            )}
          >
            <Clock size={iconSizes[size]} className={color} />
            <span className={color}>{text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs whitespace-pre-line">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
