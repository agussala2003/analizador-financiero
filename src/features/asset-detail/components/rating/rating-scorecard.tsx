// src/features/asset-detail/components/rating/rating-scorecard.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { RatingStars } from './rating-stars';
import type { AssetRating } from '../../../../types/dashboard';

/**
 * Props para el componente RatingScorecard.
 * @property rating - Calificación del activo
 */
interface RatingScorecardProps {
  rating: AssetRating | null;
}

/**
 * Tarjeta que muestra la calificación general del activo y puntuaciones individuales.
 * Incluye:
 * - Rating general (letra y puntuación 0-5)
 * - Puntuaciones individuales con visualización de estrellas:
 *   - ROE (Return on Equity)
 *   - ROA (Return on Assets)
 *   - Deuda/Equity
 *   - P/E Ratio
 *   - P/B Ratio
 * 
 * Si no hay rating disponible, no se renderiza nada.
 * 
 * @example
 * ```tsx
 * <RatingScorecard rating={assetRating} />
 * <RatingScorecard rating={null} /> // No renderiza nada
 * ```
 */
export function RatingScorecard({ rating }: RatingScorecardProps) {
  if (!rating) return null;

  return (
    <Card className="border-l-4 border-l-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          Tarjeta de Calificaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center heading-4">
          <span className="font-semibold">Rating General</span>
          <span className="font-bold text-primary">
            {rating.rating} ({rating.overallScore}/5)
          </span>
        </div>
        <div className="pt-2 border-t border-border">
          <ul className="space-y-2 body-sm">
            <li className="flex justify-between">
              <span>Retorno sobre Equity (ROE)</span>
              <RatingStars score={rating.returnOnEquityScore} />
            </li>
            <li className="flex justify-between">
              <span>Retorno sobre Activos (ROA)</span>
              <RatingStars score={rating.returnOnAssetsScore} />
            </li>
            <li className="flex justify-between">
              <span>Deuda / Equity</span>
              <RatingStars score={rating.debtToEquityScore} />
            </li>
            <li className="flex justify-between">
              <span>Precio / Ganancias (P/E)</span>
              <RatingStars score={rating.priceToEarningsScore} />
            </li>
            <li className="flex justify-between">
              <span>Precio / Valor Libros (P/B)</span>
              <RatingStars score={rating.priceToBookScore} />
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
