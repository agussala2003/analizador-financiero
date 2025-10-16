// src/features/retirement/components/results/result-card.tsx

import { ResultCardProps } from "../../types/retirement.types";

/**
 * Tarjeta de resultado individual
 */
export function ResultCard({
  title,
  value,
  colorClass,
  subtitle,
}: ResultCardProps) {
  return (
    <div className="bg-muted/40 p-3 sm:p-4 rounded-lg text-center border">
      <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">{title}</p>
      <p className={`text-lg sm:text-xl md:text-2xl font-bold ${colorClass}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">{subtitle}</p>
      )}
    </div>
  );
}
