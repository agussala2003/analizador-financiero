// src/features/insights/components/insights-section.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import type { InsightItem } from '../types/insights.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

// --- Formateadores robustos ---
const formatCurrency = (value?: number | null): string => {
  // Retorna '-' si el valor no es un número válido y finito
  if (typeof value !== 'number' || !isFinite(value)) {
    return '-';
  }
  return `$${value.toFixed(2)}`;
};

const formatPercentage = (value?: number | null, decimals?: number): string => {
  // Retorna '-' si el valor no es un número válido y finito
  if (typeof value !== 'number' || !isFinite(value)) {
    return '-';
  }
  return `${value.toFixed(decimals)}%`;
};

const formatNumber = (value?: number | null, decimals?: number): string => {
  // Retorna '-' si el valor no es un número válido y finito
  if (typeof value !== 'number' || !isFinite(value)) {
    return '-';
  }
  return value.toFixed(decimals);
};
// ------------------------------

export interface InsightsSectionProps {
  title: string;
  subtitle?: string;
  items: InsightItem[];
  kind: 'undervalued' | 'overvalued' | 'analystBuy' | 'analystSell' | 'highRoicLowPe';
}

/**
 * Sección reutilizable que muestra una lista de insights en forma de tabla compacta.
 */
export const InsightsSection: React.FC<InsightsSectionProps> = ({ title, subtitle, items, kind }) => {
  // Define las columnas basado en 'kind'
  const columns = React.useMemo(() => {
    switch (kind) {
      case 'undervalued':
        return [
          { key: 'asset', label: 'Activo', tooltip: null },
          { key: 'price', label: 'Precio Actual', tooltip: 'Precio de mercado en tiempo real', align: 'center' },
          { key: 'dcf', label: 'Valor Intrínseco', tooltip: 'DCF: Valor calculado mediante flujo de caja descontado', align: 'center' },
          { key: 'metric', label: 'Descuento', tooltip: 'Porcentaje de descuento respecto al valor intrínseco', align: 'center' },
        ];
      case 'overvalued':
        return [
          { key: 'asset', label: 'Activo', tooltip: null },
          { key: 'price', label: 'Precio Actual', tooltip: 'Precio de mercado en tiempo real', align: 'center' },
          { key: 'dcf', label: 'Valor Intrínseco', tooltip: 'DCF: Valor calculado mediante flujo de caja descontado', align: 'center' },
          { key: 'metric', label: 'Sobreprecio', tooltip: 'Porcentaje de sobreprecio respecto al valor intrínseco', align: 'center' },
        ];
      case 'highRoicLowPe':
        return [
          { key: 'asset', label: 'Activo', tooltip: null },
          { key: 'price', label: 'Precio Actual', tooltip: 'Precio de mercado en tiempo real', align: 'center' },
          { key: 'roic', label: 'ROIC', tooltip: 'Return on Invested Capital (%)', align: 'center' }, // Columna específica para ROIC
          { key: 'pe', label: 'PER', tooltip: 'Price to Earnings Ratio', align: 'center' },           // Columna específica para PER
        ];
      case 'analystBuy':
      case 'analystSell':
        return [
          { key: 'asset', label: 'Activo', tooltip: null },
          { key: 'price', label: 'Precio Actual', tooltip: 'Precio de mercado en tiempo real', align: 'center' },
          { key: 'target', label: 'Precio Objetivo', tooltip: 'Precio objetivo promedio según analistas', align: 'center' },
          { key: 'metric', label: 'Recomendaciones', tooltip: 'C: Compra, M: Mantener, V: Venta', align: 'center' },
        ];
      default:
        return [];
    }
  }, [kind]);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <TooltipProvider> {/* Envuelve con TooltipProvider */}
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={`text-xs sm:text-sm font-semibold ${c.align === 'center' ? 'text-center' : ''}`}>
                      <div className={`flex items-center gap-1.5 ${c.align === 'center' ? 'justify-center' : ''}`}>
                        {c.label}
                        {c.tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>{c.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                            No hay activos que cumplan los criterios actuales.
                        </TableCell>
                    </TableRow>
                ) : (
                    items.map((it) => (
                      <TableRow key={it.symbol} className="hover:bg-accent/50 transition-colors">
                        {/* Columna 1: Activo */}
                        <TableCell className="font-medium">
                          <NavLink to={`/asset/${it.symbol}`} className="group inline-flex items-center gap-2" aria-label={`Ver detalle de ${it.symbol}`}>
                            <Badge variant="secondary" className="font-mono group-hover:bg-primary/20 group-hover:text-primary transition-colors">{it.symbol}</Badge>
                            <span className="hidden sm:inline text-muted-foreground group-hover:text-foreground underline-offset-4 group-hover:underline">{it.companyName}</span>
                          </NavLink>
                        </TableCell>

                        {/* Columna 2: Precio Actual */}
                        <TableCell className="text-center font-semibold tabular-nums">{formatCurrency(it.currentPrice)}</TableCell>

                        {/* Columna 3: Variable (DCF, Target, ROIC) */}
                        <TableCell className="text-center tabular-nums">
                          {kind === 'undervalued' || kind === 'overvalued'
                            ? formatCurrency(it.dcf) // Sin '!'
                            : kind === 'highRoicLowPe'
                            ? formatPercentage(it.roic, 1) // Sin '!', el formateador maneja undefined
                            : formatCurrency(it.priceTarget) /* analystBuy/Sell, Sin '!' */
                          }
                        </TableCell>

                        {/* Columna 4: Variable (Metric, PER, Recomendaciones) */}
                        <TableCell className="text-center font-bold tabular-nums">
                          {kind === 'highRoicLowPe'
                            ? formatNumber(it.pe, 1) // Sin '!', el formateador maneja undefined
                            : renderAnalystMetric(kind, it) // Llama a la función para las otras métricas
                          }
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

// Función helper SÓLO para las métricas de analistas y valoración (%)
function renderAnalystMetric(kind: InsightsSectionProps['kind'], it: InsightItem) {
  if (kind === 'undervalued' || kind === 'overvalued') {
    const value = it.mispricingPct;
    // Ya usamos un formateador robusto que devuelve '-', no necesitamos verificar aquí
    const color = typeof value === 'number' && value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    // Llama al formateador robusto
    return <span className={color}>{formatPercentage(value, 1)}</span>;
  }

  // Para listas de analistas mostramos el desglose C/M/V (Compra/Mantener/Venta)
  if (kind === 'analystBuy' || kind === 'analystSell') {
      if (typeof it.buyCount === 'number' || typeof it.holdCount === 'number' || typeof it.sellCount === 'number') {
        const b = it.buyCount ?? 0; const h = it.holdCount ?? 0; const s = it.sellCount ?? 0;
        return (
          <span className="tabular-nums">
            <span className="text-green-600 dark:text-green-400 font-semibold">{b}</span>
            <span className="text-muted-foreground mx-0.5">/</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">{h}</span>
            <span className="text-muted-foreground mx-0.5">/</span>
            <span className="text-red-600 dark:text-red-400 font-semibold">{s}</span>
          </span>
        );
      }
      // Formatea analystScore usando formatNumber
      return formatNumber(it.analystScore, 1);
  }

  // Si no es ninguno de los anteriores
  return '-';
}