import React, { useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { useIsInWatchlist, useWatchlistMutations } from '../../../hooks/use-watchlist';

/**
 * Props for WatchlistToggleButton component.
 * @property symbol - Stock ticker symbol to add/remove from watchlist
 * @property variant - Button visual style variant
 * @property size - Button size variant
 */
interface WatchlistToggleButtonProps {
  symbol: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Toggle button for adding/removing assets from user's watchlist.
 * 
 * @remarks
 * - Shows filled star when asset is in watchlist
 * - Displays loading spinner during mutation
 * - Prevents event propagation to parent elements
 * - Memoized for performance optimization
 * 
 * @example
 * ```tsx
 * <WatchlistToggleButton symbol="AAPL" variant="outline" size="sm" />
 * ```
 */

export const WatchlistToggleButton = React.memo(function WatchlistToggleButton({ 
  symbol, 
  variant = 'outline',
  size = 'default' 
}: WatchlistToggleButtonProps) {
  const isInWatchlist = useIsInWatchlist(symbol);
  const { toggleWatchlist } = useWatchlistMutations();

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    void toggleWatchlist.mutate(symbol);
  }, [symbol, toggleWatchlist]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggleWatchlist.isPending}
      className="gap-1.5 sm:gap-2"
    >
      {toggleWatchlist.isPending ? (
        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
      ) : (
        <Star 
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isInWatchlist ? 'fill-yellow-400 text-yellow-400' : ''}`} 
        />
      )}
      {size !== 'icon' && (
        <span className="text-xs sm:text-sm">{isInWatchlist ? 'En Watchlist' : 'Agregar a Watchlist'}</span>
      )}
    </Button>
  );
});
