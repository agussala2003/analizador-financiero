// src/features/asset-detail/components/rating/dcf-valuation-card.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Scale, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, calculateDCFDifference } from '../../lib/asset-formatters';

/**
 * Props para el componente DCFValuationCard.
 * @property currentPrice - Precio actual del activo
 * @property dcf - Valor DCF del activo (o "N/A")
 */
interface DCFValuationCardProps {
  currentPrice: number;
  dcf: number | 'N/A';
}

/**
 * Tarjeta que muestra la valoración DCF completa con comparación.
 * Incluye:
 * - Precio actual
 * - Valor intrínseco (DCF)
 * - Diferencia porcentual con indicador visual de sobrevaloración/infravaloración
 * 
 * @example
 * ```tsx
 * <DCFValuationCard currentPrice={150.5} dcf={180.2} />
 * <DCFValuationCard currentPrice={150.5} dcf="N/A" />
 * ```
 */
export function DCFValuationCard({ currentPrice, dcf }: DCFValuationCardProps) {
  const dcfValue = typeof dcf === 'number' ? dcf : null;
  const dcfDifference =
    dcfValue !== null ? calculateDCFDifference(currentPrice, dcfValue) : null;

  // Si no hay datos de DCF (ej. ETFs, Índices), no mostrar la tarjeta para evitar bloques vacíos
  if (dcfValue === null) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Valoración (DCF)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs sm:text-sm text-muted-foreground">Precio Actual</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{formatPrice(currentPrice)}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs sm:text-sm text-muted-foreground">Valor Intrínseco (DCF)</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {dcfValue !== null ? (
              formatPrice(dcfValue)
            ) : (
              <span className="text-muted-foreground">N/A</span>
            )}
          </span>
        </div>
        {dcfDifference !== null && (
          <div
            className={`flex items-center justify-center p-3 rounded-lg ${dcfDifference >= 0
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
              }`}
          >
            {dcfDifference >= 0 ? (
              <TrendingDown className="w-5 h-5 mr-2 rotate-180" />
            ) : (
              <TrendingUp className="w-5 h-5 mr-2" />
            )}
            <span className="font-semibold tabular-nums">
              {dcfDifference >= 0
                ? `Infravalorada un ${dcfDifference.toFixed(2)}%`
                : `Sobrevalorada un ${Math.abs(dcfDifference).toFixed(2)}%`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
