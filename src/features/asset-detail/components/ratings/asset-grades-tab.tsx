// src/features/asset-detail/components/ratings/asset-grades-tab.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Target, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, BarChart3 } from 'lucide-react';
import type { AssetData } from '../../../../types/dashboard';
import { formatPrice } from '../../lib/asset-formatters';
import { Progress } from '../../../../components/ui/progress';

interface AssetGradesTabProps {
  asset: AssetData;
}

export function AssetGradesTab({ asset }: AssetGradesTabProps) {
  const { gradesConsensus, priceTargetConsensus, quote } = asset;

  // Validación básica
  if (!gradesConsensus) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
          <BarChart3 className="w-10 h-10 mb-3 opacity-20" />
          <p>No hay consenso de analistas disponible para este activo.</p>
        </CardContent>
      </Card>
    );
  }

  // --- DATOS DEL CONSENSO ---
  const totalRatings = (gradesConsensus.buy || 0) + (gradesConsensus.strongBuy || 0) + (gradesConsensus.hold || 0) + (gradesConsensus.sell || 0) + (gradesConsensus.strongSell || 0);

  const buyCount = (gradesConsensus.buy || 0) + (gradesConsensus.strongBuy || 0);
  const sellCount = (gradesConsensus.sell || 0) + (gradesConsensus.strongSell || 0);
  const holdCount = gradesConsensus.hold || 0;

  const buyPercent = totalRatings > 0 ? (buyCount / totalRatings) * 100 : 0;
  const holdPercent = totalRatings > 0 ? (holdCount / totalRatings) * 100 : 0;
  const sellPercent = totalRatings > 0 ? (sellCount / totalRatings) * 100 : 0;

  // Interpretación del Consenso
  let consensusLabel = gradesConsensus.consensus || "Neutral";
  // let consensusColor = "bg-yellow-500"; // Unused but kept for future use
  let consensusTextColor = "text-yellow-600";

  if (consensusLabel.toLowerCase().includes('buy')) {
    // consensusColor = "bg-emerald-500";
    consensusTextColor = "text-emerald-600";
    consensusLabel = "Compra";
  } else if (consensusLabel.toLowerCase().includes('sell')) {
    // consensusColor = "bg-rose-500";
    consensusTextColor = "text-rose-600";
    consensusLabel = "Venta";
  } else {
    consensusLabel = "Mantener";
  }

  // --- DATOS DEL PRICE TARGET ---
  const currentPrice = quote?.price || 0;
  const targetPrice = priceTargetConsensus?.targetConsensus || 0;
  const potential = currentPrice > 0 && targetPrice > 0
    ? ((targetPrice - currentPrice) / currentPrice) * 100
    : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in-50 slide-in-from-bottom-2">

      {/* 1. TARJETA DE CONSENSO DE ANALISTAS */}
      <Card className="flex flex-col h-full border-l-4 border-l-primary/40">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                Consenso de Analistas
              </CardTitle>
              <CardDescription>Basado en {totalRatings} analistas</CardDescription>
            </div>
            <Badge variant="outline" className={`text-base px-3 py-1 font-bold ${consensusTextColor} bg-background border-current`}>
              {consensusLabel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 flex-1">
          {/* Barra de Progreso Segmentada */}
          <div className="space-y-2">
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary">
              <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${buyPercent}%` }} />
              <div className="bg-yellow-400 transition-all duration-1000" style={{ width: `${holdPercent}%` }} />
              <div className="bg-rose-500 transition-all duration-1000" style={{ width: `${sellPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Compra ({buyCount})</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Mantener ({holdCount})</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Venta ({sellCount})</span>
            </div>
          </div>

          {/* Detalles Rápidos */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border">
              <ThumbsUp className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="text-xl font-bold">{buyCount}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Positivos</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border">
              <Minus className="w-5 h-5 text-yellow-500 mb-1" />
              <span className="text-xl font-bold">{holdCount}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Neutrales</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg border">
              <ThumbsDown className="w-5 h-5 text-rose-500 mb-1" />
              <span className="text-xl font-bold">{sellCount}</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Negativos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. TARJETA DE PRECIO OBJETIVO */}
      <Card className="flex flex-col h-full border-l-4 border-l-blue-500/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-500" />
            Precio Objetivo (12M)
          </CardTitle>
          <CardDescription>Proyección promedio del mercado</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4 flex-1 flex flex-col justify-center">

          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Precio Actual</p>
              <p className="text-2xl font-bold">{formatPrice(currentPrice)}</p>
            </div>

            {/* Flecha de Potencial */}
            <div className="flex flex-col items-center px-4 flex-1">
              <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${potential > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                {potential > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {potential > 0 ? '+' : ''}{potential.toFixed(1)}%
              </div>
              <div className="h-px w-full bg-border mt-2 relative">
                <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-border" />
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Target Promedio</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(targetPrice)}</p>
            </div>
          </div>

          {/* Rango de Precios (Low - High) */}
          {priceTargetConsensus && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Bajo: {formatPrice(priceTargetConsensus.targetLow)}</span>
                <span>Alto: {formatPrice(priceTargetConsensus.targetHigh)}</span>
              </div>
              <Progress value={((targetPrice - priceTargetConsensus.targetLow) / (priceTargetConsensus.targetHigh - priceTargetConsensus.targetLow)) * 100} className="h-2" />
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            El precio objetivo representa la estimación de valor justo de los analistas para los próximos 12 meses.
            {potential > 15
              ? " Existe un potencial de subida significativo según el consenso."
              : potential < 0
                ? " El mercado cotiza actualmente por encima del objetivo promedio."
                : " El precio actual está cerca del valor estimado por los analistas."
            }
          </div>

        </CardContent>
      </Card>
    </div>
  );
}