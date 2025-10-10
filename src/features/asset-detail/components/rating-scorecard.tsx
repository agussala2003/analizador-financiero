// src/features/asset-detail/components/rating-scorecard.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Scale, ShieldCheck, Star, TrendingDown, TrendingUp } from "lucide-react";
import { AssetRating } from "../../../types/dashboard";

interface RatingScorecardProps {
  rating: AssetRating | null;
  currentPrice: number;
  dcf: number | "N/A";
}

export const RatingScorecard: React.FC<RatingScorecardProps> = ({ rating, currentPrice, dcf }) => {
  if (!rating) return null;

  const scoreToStars = (score: number) => (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < score ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
    </div>
  );

  const dcfDifference =
    typeof dcf === "number" && dcf > 0 ? ((currentPrice / dcf) - 1) * 100 : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-l-4 border-l-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Valoración (DCF)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Precio Actual</span>
            <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Valor Intrínseco (DCF)</span>
            <span className="text-2xl font-bold">
              {typeof dcf === "number" ? `$${dcf.toFixed(2)}` : <span className="text-muted-foreground">N/A</span>}
            </span>
          </div>
          {dcfDifference !== null && (
            <div
              className={`flex items-center justify-center p-3 rounded-lg ${
                dcfDifference > 5
                  ? "bg-red-500/10 text-red-500"
                  : "bg-green-500/10 text-green-500"
              }`}
            >
              {dcfDifference > 5 ? (
                <TrendingUp className="w-5 h-5 mr-2" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-2" />
              )}
              <span className="font-semibold">
                {dcfDifference > 5
                  ? `Sobrevalorada un ${dcfDifference.toFixed(2)}%`
                  : `Infravalorada un ${Math.abs(dcfDifference).toFixed(2)}%`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            Tarjeta de Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Rating General</span>
            <span className="font-bold text-primary">
              {rating.rating} ({rating.overallScore}/5)
            </span>
          </div>
          <div className="pt-2 border-t border-border">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Retorno sobre Equity (ROE)</span> {scoreToStars(rating.returnOnEquityScore)}
              </li>
              <li className="flex justify-between">
                <span>Retorno sobre Activos (ROA)</span> {scoreToStars(rating.returnOnAssetsScore)}
              </li>
              <li className="flex justify-between">
                <span>Deuda / Equity</span> {scoreToStars(rating.debtToEquityScore)}
              </li>
              <li className="flex justify-between">
                <span>Precio / Ganancias (P/E)</span> {scoreToStars(rating.priceToEarningsScore)}
              </li>
              <li className="flex justify-between">
                <span>Precio / Valor Libros (P/B)</span> {scoreToStars(rating.priceToBookScore)}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};