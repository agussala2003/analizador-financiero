// src/features/asset-detail/components/rating/rating-scorecard.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { RatingStars } from './rating-stars';
import type { AssetData } from '../../../../types/dashboard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../components/ui/tooltip';
import { Badge } from '../../../../components/ui/badge';

interface RatingScorecardProps {
  asset: AssetData;
}

export function RatingScorecard({ asset }: RatingScorecardProps) {
  const { rating } = asset;

  if (!rating) return null;

  // Función auxiliar para colores de texto según el score (1-5)
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 dark:text-green-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Definición de métricas para iterar limpio
  const metrics = [
    {
      label: 'DCF (Flujo de Caja)',
      score: rating.discountedCashFlowScore,
      description: 'Puntaje basado en la valoración intrínseca (DCF). Indica si el activo está infravalorado según sus flujos futuros.'
    },
    {
      label: 'ROE (Retorno Equity)',
      score: rating.returnOnEquityScore,
      description: 'Mide la rentabilidad financiera. Qué tan eficiente es la empresa generando ganancias con el dinero de los accionistas.'
    },
    {
      label: 'ROA (Retorno Activos)',
      score: rating.returnOnAssetsScore,
      description: 'Mide la rentabilidad económica. Qué tan eficiente es la empresa usando sus activos para generar ganancias.'
    },
    {
      label: 'Deuda / Equity',
      score: rating.debtToEquityScore,
      description: 'Calificación del apalancamiento. Un puntaje alto (5/5) indica una deuda baja y saludable; un puntaje bajo indica alto riesgo de deuda.'
    },
    {
      label: 'P/E (Precio/Ganancia)',
      score: rating.priceToEarningsScore,
      description: 'Calificación basada en el ratio P/E. Un puntaje alto indica que la acción está barata respecto a sus ganancias.'
    },
    {
      label: 'P/B (Precio/Libros)',
      score: rating.priceToBookScore,
      description: 'Calificación basada en el ratio P/B. Compara el precio de mercado con el valor contable de la empresa.'
    },
  ];

  // Interpretación del Rating (Ej: S, A, B...)
  const ratingLabel = (() => {
    const r = rating.rating;
    if (r.startsWith('S') || r.startsWith('A')) return "Compra Fuerte";
    if (r.startsWith('B')) return "Compra / Mantener";
    if (r.startsWith('C')) return "Neutral / Mantener";
    return "Venta / Riesgo";
  })();

  return (
    <Card className="border-l-4 border-l-indigo-500/50 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            Scorecard Financiero
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Evaluación algorítmica de la salud financiera basada en métricas clave (0-5 estrellas).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating General Destacado */}
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating General</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getScoreColor(rating.overallScore)}`}>
                {rating.rating}
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                ({rating.overallScore}/5)
              </span>
            </div>
          </div>

          <Badge variant="outline" className={`px-3 py-1 text-sm font-semibold border bg-background ${getScoreColor(rating.overallScore)}`}>
            {ratingLabel}
          </Badge>
        </div>

        {/* Lista de Métricas */}
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground/80 font-medium group-hover:text-foreground transition-colors">
                  {metric.label}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground/30 hover:text-indigo-500 transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {metric.description}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-3">
                {/* Mostramos el número pequeño para precisión */}
                <span className="text-xs font-mono text-muted-foreground w-3 text-right">{metric.score}</span>
                <RatingStars score={metric.score} />
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground pt-2 border-t text-center italic">
          Puntuaciones calculadas automáticamente sobre reportes fundamentales.
        </div>
      </CardContent>
    </Card>
  );
}