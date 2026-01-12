import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../../../hooks/use-watchlist';
import { usePrefetchAsset } from '../../../hooks/use-prefetch-asset';
import { usePlanLimits } from '../../../hooks/use-plan-limits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Star, TrendingUp, Crown } from 'lucide-react';

/**
 * Watchlist page displays user's favorite assets for quick tracking.
 * 
 * @remarks
 * - Enforces plan-based limits on watchlist size
 * - Shows upgrade prompt when limit is reached
 * - Implements prefetching on hover for better UX
 * - Displays loading skeletons during data fetch
 * 
 * @example
 * This page is rendered at route `/watchlist`
 */
export default function WatchlistPage() {
  const { data: watchlist = [], isLoading, error } = useWatchlist();
  const navigate = useNavigate();
  const { prefetchAssetIfNotCached } = usePrefetchAsset();
  const { limit, isAtLimit } = usePlanLimits('watchlist', watchlist.length);

  const handleNavigateToAsset = useCallback((symbol: string) => {
    void navigate(`/asset/${symbol}`);
  }, [navigate]);

  const handleNavigateToDashboard = useCallback(() => {
    void navigate('/dashboard');
  }, [navigate]);

  const handleNavigateToPlans = useCallback(() => {
    void navigate('/plans');
  }, [navigate]);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  if (isLoading) {
    return (
      <div className="container-wide space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mi Watchlist</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Tus assets favoritos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="p-4 sm:p-6">
                <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                <Skeleton className="h-3 sm:h-4 w-28 sm:w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide">
        <Card className="card-static">
          <CardContent className="pt-6">
            <div className="text-center text-destructive text-xs sm:text-sm">
              Error al cargar watchlist: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="container-wide space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Mi Watchlist</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Tus assets favoritos</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <Star className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Tu watchlist está vacía
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
                Agrega assets a tu watchlist para seguir su rendimiento de forma rápida.
                Haz clic en la estrella ⭐ en la página de detalles de cualquier asset.
              </p>
              <Button size="sm" onClick={handleNavigateToDashboard}>
                Explorar Assets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-wide space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold">Mi Watchlist</h1>
              <Badge 
                variant={isAtLimit ? "destructive" : "secondary"}
                className="gap-1 text-xs"
              >
                {watchlist.length} / {limit}
                {isAtLimit && <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {watchlist.length} {watchlist.length === 1 ? 'asset' : 'assets'} en seguimiento
              {isAtLimit && ' · Límite alcanzado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isAtLimit && (
            <Button size="sm" variant="default" onClick={handleNavigateToPlans} className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm">
              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Actualizar Plan</span>
              <span className="sm:hidden">Upgrade</span>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleNavigateToDashboard} className="flex-1 sm:flex-initial text-xs sm:text-sm">
            Explorar Más
          </Button>
        </div>
      </div>

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {watchlist.map((item) => (
          <Card 
            key={item.id}
            className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
            onClick={() => handleNavigateToAsset(item.symbol)}
            onMouseEnter={() => prefetchAssetIfNotCached(item.symbol)}
            onFocus={() => prefetchAssetIfNotCached(item.symbol)}
            tabIndex={0}
          >
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">{item.symbol}</CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm">
                    Agregado el {formatDate(item.added_at)}
                  </CardDescription>
                </div>
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </CardHeader>
            
            {item.notes && (
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {item.notes}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="rounded-full bg-primary/10 p-2 sm:p-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Consejo</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Usa tu watchlist para seguir assets que te interesan pero que aún no has comprado.
                Haz clic en la estrella ⭐ desde la página de detalles de cualquier asset para agregarlo aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
