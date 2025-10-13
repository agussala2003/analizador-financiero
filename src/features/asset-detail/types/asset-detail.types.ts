// src/features/asset-detail/types/asset-detail.types.ts

/**
 * Tipos locales específicos del feature asset-detail.
 * Los tipos principales (AssetData, AssetRating) están en src/types/dashboard.ts
 */

/**
 * Props para componentes que necesitan información de error.
 */
export interface ErrorStateProps {
  title: string;
  message: string;
  backLink?: string;
  backLinkText?: string;
}

/**
 * Métrica individual dentro de una sección financiera.
 */
export interface FinancialMetric {
  label: string;
  value: string;
}

/**
 * Sección de métricas financieras para el tab de finanzas.
 */
export interface FinancialSection {
  title: string;
  metrics: FinancialMetric[];
}

/**
 * Datos para gráficos de pie (ingresos).
 */
export interface RevenueChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

/**
 * Props para renderizado personalizado de labels en charts.
 */
export interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  [key: string]: unknown;
}
