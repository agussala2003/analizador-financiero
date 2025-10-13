// src/features/asset-detail/lib/chart-config.tsx

import React from 'react';
import type { CustomLabelProps } from '../types/asset-detail.types';

/**
 * Paleta de colores para los gráficos de pie (ingresos).
 * Mantiene consistencia visual en todos los charts del feature.
 */
export const CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
] as const;

/**
 * Renderiza un label personalizado en el gráfico de pie.
 * Solo muestra el porcentaje si es mayor al 5% para evitar sobrecarga visual.
 * 
 * @param props - Props del label de Recharts
 * @returns Elemento SVG text o null si el porcentaje es muy bajo
 * 
 * @remarks
 * Este componente se usa con Recharts PieChart label prop.
 * El cálculo de posición usa radianes para posicionar correctamente el texto.
 */
export function renderPieChartLabel(props: CustomLabelProps): React.ReactElement | null {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  
  // No mostrar labels para segmentos muy pequeños
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-bold pointer-events-none"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

/**
 * Formatea valores del tooltip de ingresos en billones.
 * 
 * @param value - Valor numérico a formatear
 * @returns String con formato $X.XXB
 */
export function formatRevenueTooltip(value: number): string {
  return `$${(value / 1e9).toFixed(2)}B`;
}
