// src/features/insights/components/analyst-firms-stats.tsx
import React from 'react';
import type { AnalystFirmStat } from '../types/insights.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export interface AnalystFirmsStatsProps {
  buyers: AnalystFirmStat[];
  sellers: AnalystFirmStat[];
}

/**
 * Muestra los rankings de firmas que más recomiendan COMPRAR o VENDER
 * en la ventana de tiempo configurada.
 */
export const AnalystFirmsStats: React.FC<AnalystFirmsStatsProps> = ({ buyers, sellers }) => {
  const columns = [
    { label: 'Firma', tooltip: null },
    { label: 'C', tooltip: 'Compra: Cantidad de recomendaciones de compra' },
    { label: 'M', tooltip: 'Mantener: Cantidad de recomendaciones de mantener' },
    { label: 'V', tooltip: 'Venta: Cantidad de recomendaciones de venta' },
    { label: '% Compra', tooltip: 'Porcentaje de recomendaciones que son de compra' },
  ];

  const sellColumns = [
    { label: 'Firma', tooltip: null },
    { label: 'C', tooltip: 'Compra: Cantidad de recomendaciones de compra' },
    { label: 'M', tooltip: 'Mantener: Cantidad de recomendaciones de mantener' },
    { label: 'V', tooltip: 'Venta: Cantidad de recomendaciones de venta' },
    { label: '% Venta', tooltip: 'Porcentaje de recomendaciones que son de venta' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg">Firmas más optimistas</CardTitle>
          <CardDescription>Ordenadas por mayor proporción de recomendaciones de compra</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.label} className="text-xs sm:text-sm font-semibold">
                      <div className="flex items-center gap-1.5">
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
                {buyers.map((f) => (
                  <TableRow key={`b-${f.firm}`} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium max-w-[200px] truncate" title={f.firm}>{f.firm}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold tabular-nums">{f.buy}</TableCell>
                    <TableCell className="text-right text-yellow-600 dark:text-yellow-400 font-semibold tabular-nums">{f.hold}</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold tabular-nums">{f.sell}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{(f.buyRatio * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg">Firmas más pesimistas</CardTitle>
          <CardDescription>Ordenadas por mayor proporción de recomendaciones de venta</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {sellColumns.map((c) => (
                    <TableHead key={c.label} className="text-xs sm:text-sm font-semibold">
                      <div className="flex items-center gap-1.5">
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
                {sellers.map((f) => (
                  <TableRow key={`s-${f.firm}`} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium max-w-[200px] truncate" title={f.firm}>{f.firm}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold tabular-nums">{f.buy}</TableCell>
                    <TableCell className="text-right text-yellow-600 dark:text-yellow-400 font-semibold tabular-nums">{f.hold}</TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold tabular-nums">{f.sell}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{(f.sellRatio * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
