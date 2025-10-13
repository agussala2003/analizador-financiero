// src/features/watchlist/pages/watchlist-page.tsx

import { useWatchlist } from '../../../hooks/use-watchlist';
import { usePrefetchAsset } from '../../../hooks/use-prefetch-asset';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '../../../components/ui/skeleton';

export default function WatchlistPage() {
  const { data: watchlist = [], isLoading, error } = useWatchlist();
  const navigate = useNavigate();
  const { prefetchAssetIfNotCached } = usePrefetchAsset();

  if (isLoading) {
    return (
      <div className="container-wide stack-6">
        <div>
          <h1 className="heading-2">Mi Watchlist</h1>
          <p className="body text-muted-foreground">Tus assets favoritos</p>
        </div>
        <div className="grid-cards-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-32 mt-2" />
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
            <div className="text-center text-destructive body">
              Error al cargar watchlist: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="container-wide stack-6">
        <div>
          <h1 className="heading-2">Mi Watchlist</h1>
          <p className="body text-muted-foreground">Tus assets favoritos</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Tu watchlist está vacía
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Agrega assets a tu watchlist para seguir su rendimiento de forma rápida.
                Haz clic en la estrella ⭐ en la página de detalles de cualquier asset.
              </p>
              <Button onClick={() => void navigate('/dashboard')}>
                Explorar Assets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-wide stack-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-2">Mi Watchlist</h1>
          <p className="body text-muted-foreground">
            {watchlist.length} {watchlist.length === 1 ? 'asset' : 'assets'} en seguimiento
          </p>
        </div>
        <Button variant="outline" onClick={() => void navigate('/dashboard')} className="btn-press">
          Explorar Más
        </Button>
      </div>

      {/* Watchlist Grid */}
      <div className="grid-cards-3">
        {watchlist.map((item) => (
          <Card 
            key={item.id}
            className="card-interactive"
            onClick={() => void navigate(`/asset/${item.symbol}`)}
            onMouseEnter={() => prefetchAssetIfNotCached(item.symbol)}
            onFocus={() => prefetchAssetIfNotCached(item.symbol)}
            tabIndex={0}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{item.symbol}</CardTitle>
                  <CardDescription className="mt-1">
                    Agregado el {new Date(item.added_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </CardDescription>
                </div>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </CardHeader>
            
            {item.notes && (
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.notes}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Consejo</h3>
              <p className="text-sm text-muted-foreground">
                Usa tu watchlist para seguir assets que te interesan pero que aún no has comprado.
                Puedes agregar notas personales a cada asset desde su página de detalles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
