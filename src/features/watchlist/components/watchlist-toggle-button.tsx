// src/features/watchlist/components/watchlist-toggle-button.tsx

import { Button } from '../../../components/ui/button';
import { Star } from 'lucide-react';
import { useIsInWatchlist, useWatchlistMutations } from '../../../hooks/use-watchlist';
import { Loader2 } from 'lucide-react';

interface WatchlistToggleButtonProps {
  symbol: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WatchlistToggleButton({ 
  symbol, 
  variant = 'outline',
  size = 'default' 
}: WatchlistToggleButtonProps) {
  const isInWatchlist = useIsInWatchlist(symbol);
  const { toggleWatchlist } = useWatchlistMutations();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir navegación si está en un card clickeable
    void toggleWatchlist.mutate(symbol);
  };

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
}
