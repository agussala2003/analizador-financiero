// src/features/admin/components/stats/stat-card.tsx
import { Card, CardHeader, CardContent } from '../../../../components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</div>
          {Icon && (
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{value}</div>
          {(description ?? trend) && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              {trend && (
                <span className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
              {description && (
                <span className="text-muted-foreground">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
