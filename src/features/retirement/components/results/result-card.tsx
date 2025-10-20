// src/features/retirement/components/results/result-card.tsx

import { ResultCardProps } from "../../types/retirement.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";

/**
 * Tarjeta de resultado individual con soporte para valores largos
 * Muestra un tooltip con el valor completo si es necesario
 */
export function ResultCard({
  title,
  value,
  colorClass,
  subtitle,
  fullValue,
}: ResultCardProps) {
  // Determinar si el valor es muy largo para mostrar tooltip
  const isLongValue = value.length > 15;

  const cardContent = (
    <div className="bg-muted/40 p-3 sm:p-4 rounded-lg text-center border">
      <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">{title}</p>
      <p 
        className={`text-lg sm:text-xl md:text-2xl font-bold ${colorClass} ${
          isLongValue ? 'truncate max-w-full px-2' : ''
        }`}
        title={isLongValue ? (fullValue ?? value) : undefined}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{subtitle}</p>
      )}
    </div>
  );

  // Si el valor es largo, envolver en tooltip
  if (isLongValue && fullValue) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cardContent}
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-sm">{fullValue}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
}
