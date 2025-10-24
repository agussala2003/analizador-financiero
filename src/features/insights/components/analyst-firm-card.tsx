import React from 'react';
import type { AnalystFirmStat } from '../types/insights.types';
import { Card, CardContent } from '../../../components/ui/card';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';

export interface AnalystFirmCardProps {
  stat: AnalystFirmStat;
  type: 'buyer' | 'seller';
}

/**
 * Card visual para mostrar una firma de análisis y sus métricas de recomendaciones.
 */
export const AnalystFirmCard: React.FC<AnalystFirmCardProps> = ({ stat, type }) => {
  return (
    <Card className="h-full bg-gradient-to-br from-muted/40 to-background transition-all hover:shadow-lg hover:border-primary/60 hover:scale-[1.01] cursor-pointer px-2 py-2 sm:px-3 sm:py-3 rounded-xl border border-muted">
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        {/* Nombre de la firma destacado */}
        <span className="font-mono text-lg sm:text-xl font-bold text-primary tracking-wide drop-shadow-sm truncate max-w-[180px]" title={stat.firm}>{stat.firm}</span>
        <span className="text-xs text-muted-foreground">{type === 'buyer' ? 'Recomendaciones de compra' : 'Recomendaciones de venta'}</span>
      </div>
      <CardContent className="space-y-2 pt-0">
        {/* Métricas principales en badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 bg-background/80 border border-muted rounded px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
            C
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Compra: cantidad de recomendaciones de compra</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-semibold tabular-nums ml-1">{stat.buy}</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-background/80 border border-muted rounded px-2 py-0.5 text-xs text-yellow-600 dark:text-yellow-400">
            M
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Mantener: cantidad de recomendaciones de mantener</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-semibold tabular-nums ml-1">{stat.hold}</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-background/80 border border-muted rounded px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
            V
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Venta: cantidad de recomendaciones de venta</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-semibold tabular-nums ml-1">{stat.sell}</span>
          </span>
        </div>
        {/* Porcentaje principal */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs sm:text-sm bg-primary/10 text-primary">
            {type === 'buyer' ? '% Compra' : '% Venta'}
            <span className="tabular-nums ml-1">{type === 'buyer' ? (stat.buyRatio * 100).toFixed(1) : (stat.sellRatio * 100).toFixed(1)}%</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
