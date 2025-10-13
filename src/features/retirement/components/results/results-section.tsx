// src/features/retirement/components/results/results-section.tsx

import { ResultsSectionProps } from "../../types/retirement.types";
import { formatCurrency } from "../../lib/retirement.utils";
import { ResultCard } from "./result-card";

/**
 * Sección con las 3 tarjetas de resultados principales
 */
export function ResultsSection({
  finalAhorro,
  finalInversion,
  diferencia,
  porcentajeMejor,
}: ResultsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <ResultCard
        title="Solo Ahorro"
        value={formatCurrency(finalAhorro)}
        colorClass="text-yellow-500"
      />
      <ResultCard
        title="Invirtiendo"
        value={formatCurrency(finalInversion)}
        colorClass="text-green-500"
      />
      <ResultCard
        title="Diferencia"
        value={formatCurrency(diferencia)}
        colorClass="text-blue-500"
        subtitle={`+${porcentajeMejor.toFixed(0)}%`}
      />
    </div>
  );
}
