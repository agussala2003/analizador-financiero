// src/features/retirement/components/results/results-section.tsx

import { ResultsSectionProps } from "../../types/retirement.types";
import { formatCurrency } from "../../lib/retirement.utils";
import { Wallet, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "../../../../components/ui/card";

/**
 * Sección con las 3 tarjetas de resultados principales mejoradas
 */
export function ResultsSection({
  finalAhorro,
  finalInversion,
  diferencia,
  porcentajeMejor,
}: ResultsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Solo Ahorro */}
      <Card className="p-4 border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Solo Ahorro</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 mb-1">
          {formatCurrency(finalAhorro)}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Sin invertir, solo guardando
        </p>
      </Card>

      {/* Invirtiendo */}
      <Card className="p-4 border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-500" />
            </div>
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Invirtiendo</span>
          </div>
        </div>
        <p className="text-2xl font-bold text-green-600 dark:text-green-500 mb-1">
          {formatCurrency(finalInversion)}
        </p>
        <p className="text-xs text-green-700 dark:text-green-400">
          Con interés compuesto
        </p>
      </Card>

      {/* Diferencia - Destacada */}
      <Card className="p-4 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              </div>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Ganancia Extra</span>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
              +{porcentajeMejor.toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-500 mb-1">
            +{formatCurrency(diferencia)}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            El poder del interés compuesto
          </p>
        </div>
      </Card>
    </div>
  );
}
