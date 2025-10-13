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
    <div className="bg-muted/40 p-4 rounded-lg text-center border">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
