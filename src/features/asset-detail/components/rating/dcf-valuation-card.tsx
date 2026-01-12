// src/features/asset-detail/components/rating/dcf-valuation-card.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Scale, TrendingUp, TrendingDown, HelpCircle, AlertTriangle } from 'lucide-react';
import { formatPrice, calculateDCFDifference } from '../../lib/asset-formatters';
import type { AssetData } from '../../../../types/dashboard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../components/ui/tooltip';
import { Badge } from '../../../../components/ui/badge';

interface DCFValuationCardProps {
  asset: AssetData;
}

export function DCFValuationCard({ asset }: DCFValuationCardProps) {
  const currentPrice = asset.quote?.price ?? 0;

  // --- 1. Extraer Candidatos ---

  // Candidato A: Levered
  let leveredVal: number | null = null;
  const levered = asset.dcfLevered as {equityValuePerShare?: number; dcf?: number} | undefined;
  if (levered) {
    if (typeof levered.equityValuePerShare === 'number') leveredVal = levered.equityValuePerShare;
    else if (typeof levered.dcf === 'number') leveredVal = levered.dcf;
  }

  // Candidato B: Histórico
  let historicalVal: number | null = null;
  if (asset.dcf && Array.isArray(asset.dcf) && asset.dcf.length > 0) {
    const sortedDcf = [...asset.dcf].sort((a, b) => {
      const dateA = new Date((a as {date?: string; year?: string}).date ?? (a as {date?: string; year?: string}).year ?? '').getTime();
      const dateB = new Date((b as {date?: string; year?: string}).date ?? (b as {date?: string; year?: string}).year ?? '').getTime();
      return dateB - dateA;
    });
    const latest = sortedDcf[0] as {dcf?: unknown; 'Stock Price'?: unknown; stockPrice?: unknown; equityValuePerShare?: unknown};
    const raw = latest.dcf ?? latest['Stock Price'] ?? latest.stockPrice ?? latest.equityValuePerShare;
    if (typeof raw === 'number' || (typeof raw === 'string' && !isNaN(parseFloat(raw)))) {
      historicalVal = typeof raw === 'number' ? raw : parseFloat(raw);
    }
  }

  // --- 2. Selección Inteligente (Sanity Check) ---

  let intrinsicValue: number | null = null;
  let sourceLabel = "DCF Estándar";

  // Función para validar si un valor es "razonable" (no difiere más de 50x del precio)
  const isSane = (val: number, price: number) => {
    if (price === 0) return true;
    const ratio = val / price;
    return ratio > 0.02 && ratio < 50; // Aceptamos entre 2% y 5000% (amplio pero descarta errores masivos)
  };

  const isLeveredSane = leveredVal !== null && isSane(leveredVal, currentPrice);
  const isHistoricalSane = historicalVal !== null && isSane(historicalVal, currentPrice);

  // Lógica de decisión:
  if (isLeveredSane) {
    intrinsicValue = leveredVal;
    sourceLabel = "DCF Levered";
  } else if (isHistoricalSane) {
    // Si el levered es loco (caso PBR 3000 vs 11) pero el histórico es sano (8 vs 11), usamos histórico.
    intrinsicValue = historicalVal;
    sourceLabel = "DCF Histórico (Ajustado)";
  } else if (leveredVal !== null) {
    // Si ambos fallan el check, nos quedamos con el levered pero se marcará como anomalía abajo
    intrinsicValue = leveredVal;
    sourceLabel = "DCF Levered (Sin ajustar)";
  } else {
    intrinsicValue = historicalVal;
    sourceLabel = "DCF Histórico";
  }

  // --- DEBUGGING FINAL ---
  // console.log(`[DCF Smart Pick] ${asset.profile?.symbol}`, { 
  //     currentPrice, 
  //     leveredVal, 
  //     isLeveredSane, 
  //     historicalVal, 
  //     isHistoricalSane, 
  //     SELECTED: intrinsicValue 
  // });

  // 3. Cálculos Finales
  const potential = calculateDCFDifference(currentPrice, intrinsicValue);
  const isUndervalued = potential !== null && potential >= 0;

  // Si después de todo no hay valor, salir
  if (intrinsicValue === null || isNaN(intrinsicValue) || currentPrice === 0) {
    return null;
  }

  // Detección de anomalías remanentes (si ambos valores eran locos)
  const isAnomaly = potential !== null && Math.abs(potential) > 5000;

  return (
    <Card className="border-l-4 border-l-primary/50 h-full overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="w-5 h-5 text-primary" />
            Valoración Intrínseca
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Estimación del valor real basada en flujos de caja futuros (DCF).</p>
                <p className="mt-1 text-xs text-muted-foreground opacity-80">Fuente: {sourceLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 h-full flex flex-col justify-center">
        {/* Bloque Principal de Precios */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Precio Mercado</p>
            <p className="text-3xl font-bold tracking-tighter">
              {formatPrice(currentPrice)}
            </p>
          </div>

          <div className="flex-1 px-4 text-center pb-2 hidden sm:block">
            <p className="text-[10px] text-muted-foreground font-medium mb-1">Spread</p>
            <div className="h-px w-full bg-border relative">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isUndervalued ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider flex items-center justify-end gap-1">
              Valor Justo
              {isAnomaly && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
            </p>
            <p className={`text-3xl font-bold tracking-tighter ${isAnomaly ? 'text-yellow-600 decoration-yellow-600/30 line-through decoration-2' : 'text-primary'}`}>
              {formatPrice(intrinsicValue)}
            </p>
          </div>
        </div>

        {/* Tarjeta de Resultado / Anomalía */}
        {isAnomaly ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Datos Inconsistentes (+{potential?.toFixed(0)}%)</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                La diferencia es inusualmente alta. Esto suele indicar que el proveedor de datos está mezclando monedas (ej. USD vs Moneda Local).
              </p>
            </div>
          </div>
        ) : potential !== null && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant={isUndervalued ? "default" : "destructive"}
                className={`text-sm px-3 py-1 ${isUndervalued ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isUndervalued ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                {isUndervalued ? "Infravalorada" : "Sobrevalorada"}
              </Badge>

              <span className={`text-2xl font-bold tabular-nums ${isUndervalued ? 'text-green-600' : 'text-red-600'}`}>
                {potential > 0 ? '+' : ''}{potential.toFixed(2)}%
              </span>
            </div>

            <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`absolute top-0 bottom-0 transition-all duration-1000 ease-out rounded-full ${isUndervalued ? 'bg-green-500 left-0' : 'bg-red-500 right-0'}`}
                style={{ width: `${Math.min(Math.abs(potential), 100)}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center pt-1">
              {isUndervalued
                ? `El activo cotiza un ${Math.abs(potential).toFixed(0)}% por debajo de su valor teórico.`
                : `El activo cotiza un ${Math.abs(potential).toFixed(0)}% por encima de su valor teórico.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}