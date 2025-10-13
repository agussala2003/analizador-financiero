// src/features/asset-detail/components/rating/dcf-card.tsx

import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { calculateDCFDifference } from '../../lib/asset-formatters';
import type { AssetData } from '../../../../types/dashboard';

/**
 * Props para el componente DCFCard.
 * @property asset - Datos del activo (contiene precio actual y DCF)
 */
interface DCFCardProps {
  asset: AssetData;
}

/**
 * Tarjeta que muestra el valor DCF (Discounted Cash Flow) del activo.
 * Compara el precio actual con el valor DCF y muestra la diferencia porcentual.
 * 
 * @example
 * ```tsx
 * <DCFCard asset={assetData} />
 * ```
 */
export function DCFCard({ asset }: DCFCardProps) {
  const dcfValue = typeof asset.dcf === 'number' ? asset.dcf : null;
  const dcfDifference =
    dcfValue !== null
      ? calculateDCFDifference(asset.currentPrice, dcfValue)
      : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="body-sm text-muted-foreground font-semibold">
            Valor DCF
          </p>
          <p className="heading-2 font-bold">
            {dcfValue !== null ? `$${dcfValue.toFixed(2)}` : 'N/A'}
          </p>
        </div>
        {dcfDifference !== null && (
          <Badge
            variant={dcfDifference >= 0 ? 'default' : 'destructive'}
            className="gap-1"
          >
            {dcfDifference >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {dcfDifference >= 0 ? '+' : ''}
            {dcfDifference.toFixed(1)}%
          </Badge>
        )}
      </div>
    </Card>
  );
}
