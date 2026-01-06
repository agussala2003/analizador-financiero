// src/features/asset-detail/components/financials/asset-financials-tab.tsx

import { indicatorConfig } from '../../../../utils/financial';
import { FinancialMetricCard } from './financial-metric-card';
import type { AssetData } from '../../../../types/dashboard';
import type { FinancialSection } from '../../types/asset-detail.types';

/**
 * Secciones de métricas financieras con sus respectivas claves de datos.
 */
const FINANCIAL_SECTIONS: {
  title: string;
  keys: string[];
}[] = [
    {
      title: 'Valoración',
      keys: [
        'PER',
        'priceToBook',
        'priceToSales',
        'pfc_ratio',
        'evToEbitda',
        'earningsYield',
      ],
    },
    {
      title: 'Rentabilidad',
      keys: ['roe', 'roa', 'roic', 'operatingMargin', 'grossMargin'],
    },
    {
      title: 'Salud Financiera',
      keys: ['debtToEquity', 'currentRatio', 'netDebtToEBITDA', 'payout_ratio'],
    },
  ];

/**
 * Props para el componente AssetFinancialsTab.
 * @property asset - Datos del activo con métricas financieras
 */
interface AssetFinancialsTabProps {
  asset: AssetData;
}

/**
 * Tab de métricas financieras que muestra indicadores clave agrupados por categoría.
 * 
 * Renderiza tres tarjetas con métricas de:
 * - Valoración (P/E, P/B, P/S, etc.)
 * - Rentabilidad (ROE, ROA, ROIC, márgenes)
 * - Salud Financiera (ratios de deuda y liquidez)
 * 
 * Las métricas se extraen de `asset.data` y se formatean según configuración
 * definida en `indicatorConfig`.
 * 
 * @example
 * ```tsx
 * <AssetFinancialsTab asset={assetData} />
 * ```
 */
export function AssetFinancialsTab({ asset }: AssetFinancialsTabProps) {
  /**
   * Procesa una sección de métricas financieras para generar los datos formateados.
   */
  const processSectionMetrics = (
    keys: string[]
  ): FinancialSection['metrics'] => {
    return keys.map((key) => {
      const config = indicatorConfig[key as keyof typeof indicatorConfig];
      const value = asset.data?.[key];

      let displayValue: string;
      if (typeof value === 'number') {
        const asPercent = config && 'asPercent' in config ? config.asPercent : false;
        displayValue = `${value.toFixed(2)}${asPercent ? '%' : ''}`;
      } else {
        displayValue = 'N/A';
      }

      return {
        label: config?.label ?? key,
        value: displayValue,
      };
    });
  };

  const sections: FinancialSection[] = FINANCIAL_SECTIONS.map((section) => ({
    title: section.title,
    metrics: processSectionMetrics(section.keys),
  }));

  // Filtrar secciones donde TODOS los valores son "N/A"
  const validSections = sections.filter(section =>
    section.metrics.some(metric => metric.value !== 'N/A')
  );

  if (validSections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center border rounded-lg bg-muted/20">
        <h3 className="text-lg font-semibold mb-2">Sin datos financieros</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Este activo (como índices o ciertos ETFs) no informa métricas financieras tradicionales como P/E o ROE.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {validSections.map((section) => (
        <FinancialMetricCard key={section.title} section={section} />
      ))}
    </div>
  );
}
