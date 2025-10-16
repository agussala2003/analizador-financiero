// src/features/dashboard/components/ticker-input/ticker-badge.tsx

import { Button } from '../../../../components/ui/button';
import { XIcon } from 'lucide-react';

/**
 * Props para el componente TickerBadge.
 * @property ticker - Símbolo del ticker
 * @property onRemove - Callback para remover el ticker
 */
interface TickerBadgeProps {
  ticker: string;
  onRemove: (ticker: string) => void;
}

/**
 * Badge individual para un ticker seleccionado.
 * Muestra el símbolo con un botón para removerlo.
 * 
 * @example
 * ```tsx
 * <TickerBadge ticker="AAPL" onRemove={(ticker) => remove(ticker)} />
 * ```
 */
export function TickerBadge({ ticker, onRemove }: TickerBadgeProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium rounded-full bg-secondary text-secondary-foreground">
      <span>{ticker}</span>
      <Button
        variant="ghost"
        size="icon"
        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
        onClick={() => onRemove(ticker)}
        aria-label={`Quitar ${ticker}`}
      >
        <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
      </Button>
    </div>
  );
}

