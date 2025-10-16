// src/components/shared/feature-locked.tsx

import { Lock, Crown } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface FeatureLockedProps {
  /** Nombre de la funcionalidad bloqueada */
  featureName: string;
  /** Plan mínimo requerido */
  requiredPlan: 'plus' | 'premium';
  /** Descripción opcional de la funcionalidad */
  description?: string;
  /** Variante visual del componente */
  variant?: 'card' | 'inline' | 'banner';
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente para mostrar que una funcionalidad está bloqueada
 * y requiere un plan superior.
 * 
 * @example
 * ```tsx
 * <FeatureLocked
 *   featureName="Stock Grades"
 *   requiredPlan="plus"
 *   variant="card"
 * />
 * ```
 */
export function FeatureLocked({
  featureName,
  requiredPlan,
  description,
  variant = 'card',
  className,
}: FeatureLockedProps) {
  const navigate = useNavigate();

  const planNames = {
    plus: 'Plus',
    premium: 'Premium',
  };

  const handleUpgrade = () => {
    void navigate('/plans');
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Lock className="h-4 w-4" />
        <span>Disponible en el plan {planNames[requiredPlan]}</span>
        <Button size="sm" variant="link" onClick={handleUpgrade} className="h-auto p-0">
          Actualizar
        </Button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10 dark:border-yellow-900',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          <div>
            <div className="font-medium text-yellow-900 dark:text-yellow-100">
              {featureName}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              {description ?? `Esta funcionalidad requiere el plan ${planNames[requiredPlan]}`}
            </div>
          </div>
        </div>
        <Button onClick={handleUpgrade} size="sm" variant="default">
          Ver Planes
        </Button>
      </div>
    );
  }

  // Variant: card (default)
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{featureName}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description ??
            `Esta funcionalidad está disponible para usuarios del plan ${planNames[requiredPlan]} o superior.`}
        </p>
        <Button onClick={handleUpgrade}>
          <Crown className="mr-2 h-4 w-4" />
          Actualizar a {planNames[requiredPlan]}
        </Button>
      </CardContent>
    </Card>
  );
}
