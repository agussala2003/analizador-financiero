// src/features/retirement/types/retirement.types.ts

/**
 * Datos para el gráfico de proyección
 */
export interface ChartDatum {
  year: string;
  "Solo Ahorro": number;
  Invirtiendo: number;
}

/**
 * Parámetros de la calculadora de retiro
 */
export interface RetirementParams {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  annualReturn: number;
}

/**
 * Resultados calculados de la proyección
 */
export interface RetirementResults {
  finalAhorro: number;
  finalInversion: number;
  diferencia: number;
  porcentajeMejor: number;
}

/**
 * Props para ParameterControl
 */
export interface ParameterControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  id: string;
}

/**
 * Props para ResultCard
 */
export interface ResultCardProps {
  title: string;
  value: string;
  colorClass?: string;
  subtitle?: string;
}

/**
 * Props para RetirementChart
 */
export interface RetirementChartProps {
  chartData: ChartDatum[];
  years: number;
}

/**
 * Props para ResultsSection
 */
export interface ResultsSectionProps {
  finalAhorro: number;
  finalInversion: number;
  diferencia: number;
  porcentajeMejor: number;
}

/**
 * Props para ParametersSection
 */
export interface ParametersSectionProps {
  params: RetirementParams;
  onParamsChange: (params: RetirementParams) => void;
}
