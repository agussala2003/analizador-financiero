// src/features/asset-detail/components/financials/financial-metric-card.tsx

import { Card } from '../../../../components/ui/card';
import type { FinancialSection } from '../../types/asset-detail.types';

/**
 * Props para el componente FinancialMetricCard.
 * @property section - Objeto con título y array de métricas {label, value}
 */
interface FinancialMetricCardProps {
  section: FinancialSection;
}

/**
 * Tarjeta que muestra una sección de métricas financieras.
 * Renderiza un título y una lista de pares label-valor.
 * 
 * Usado en el tab de métricas financieras para mostrar:
 * - Métricas de Valoración (P/E, P/B, etc.)
 * - Métricas de Rentabilidad (ROE, ROA, etc.)
 * - Métricas de Liquidez (Quick Ratio, Current Ratio, etc.)
 * - Métricas de Apalancamiento (Debt to Equity, etc.)
 * 
 * @example
 * ```tsx
 * <FinancialMetricCard
 *   section={{
 *     title: "Métricas de Valoración",
 *     metrics: [
 *       { label: "P/E Ratio", value: "25.4" },
 *       { label: "P/B Ratio", value: "3.2" }
 *     ]
 *   }}
 * />
 * ```
 */
export function FinancialMetricCard({ section }: FinancialMetricCardProps) {
  return (
    <Card className="p-6">
      <h3 className="heading-4 mb-4">{section.title}</h3>
      <div className="space-y-3">
        {section.metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex justify-between items-center"
          >
            <span className="body-sm text-muted-foreground">
              {metric.label}
            </span>
            <span className="body font-semibold">{metric.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
