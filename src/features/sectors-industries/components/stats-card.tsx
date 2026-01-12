// src/features/sectors-industries/components/stats-card.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatPercentage, getPercentageColor } from '../lib/format-utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

/**
 * Props for the StatsCard component.
 */
interface StatsCardProps {
  /**
   * Title of the stat
   */
  title: string;
  
  /**
   * Percentage value to display
   */
  value: number;
  
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
}

/**
 * Displays a single statistic card with formatted percentage.
 * 
 * @example
 * ```tsx
 * <StatsCard
 *   title="Cambio Promedio"
 *   value={2.5}
 *   subtitle="Últimos 30 días"
 * />
 * ```
 */
export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const Icon = isNeutral ? Activity : isPositive ? TrendingUp : TrendingDown;
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-1.5 rounded-full ${
            isPositive ? 'bg-green-500/10' : isNeutral ? 'bg-muted' : 'bg-red-500/10'
          }`}>
            <Icon className={`w-4 h-4 ${
              isPositive ? 'text-green-500' : isNeutral ? 'text-muted-foreground' : 'text-red-500'
            }`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold mb-1 ${getPercentageColor(value)}`}>
          {formatPercentage(value)}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
