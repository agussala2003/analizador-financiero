// src/features/admin/components/stats/admin-stats-section.tsx
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { StatCard } from './stat-card';
import { Badge } from '../../../../components/ui/badge';
import { 
  Users, FileText, TrendingUp, AlertCircle, Activity, 
  MessageSquare, Heart, Bookmark, LayoutDashboard, Star,
  LogIn, UserPlus, ShieldAlert, Eye
} from 'lucide-react';
import { useAdminStats, DateRange } from '../../hooks/use-admin-stats';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type TimeRange = '24h' | '7d' | '30d' | '3m' | '1y' | 'all';

export function AdminStatsSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const dateRange = useMemo((): DateRange => {
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case '24h':
        start.setHours(start.getHours() - 24);
        return { start, end, label: 'Últimas 24 horas' };
      case '7d':
        start.setDate(start.getDate() - 7);
        return { start, end, label: 'Últimos 7 días' };
      case '30d':
        start.setDate(start.getDate() - 30);
        return { start, end, label: 'Últimos 30 días' };
      case '3m':
        start.setMonth(start.getMonth() - 3);
        return { start, end, label: 'Últimos 3 meses' };
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        return { start, end, label: 'Último año' };
      case 'all':
        start.setFullYear(2020, 0, 1);
        return { start, end, label: 'Todo el tiempo' };
    }
  }, [timeRange]);

  const { stats, isLoading, error } = useAdminStats(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="h-6 sm:h-8 w-40 sm:w-48 bg-muted animate-pulse rounded" />
          <div className="h-9 sm:h-10 w-full sm:w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 sm:h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error ?? !stats) {
    return (
      <Card className="p-8 sm:p-12 text-center">
        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">Error al cargar estadísticas</h3>
        <p className="text-sm sm:text-base text-muted-foreground">{error ?? 'Error desconocido'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con filtro temporal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Estadísticas</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{dateRange.label}</p>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Últimas 24 horas</SelectItem>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="3m">Últimos 3 meses</SelectItem>
            <SelectItem value="1y">Último año</SelectItem>
            <SelectItem value="all">Todo el tiempo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principales - Usuarios */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">👥 Usuarios</h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Usuarios"
            value={stats.users.total}
            icon={Users}
            description="Registrados"
          />
          <StatCard
            title="Nuevos Usuarios"
            value={stats.users.newUsers}
            icon={UserPlus}
            description={dateRange.label}
          />
          <StatCard
            title="Usuarios Activos"
            value={stats.users.activeUsers}
            icon={Activity}
            description="Con actividad"
          />
          <StatCard
            title="Pueden Crear Blogs"
            value={stats.users.withBlogPermission}
            icon={FileText}
            description="Con permiso"
          />
        </div>
      </div>

      {/* Distribución por roles */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold">Distribución por Roles</h4>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-2.5 sm:space-y-3">
            {stats.users.byRole.map((role) => (
              <div key={role.role} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={role.role === 'administrador' ? 'default' : 'secondary'} className="text-xs">
                    {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{role.count} usuarios</div>
                  <div className="w-24 sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(role.count / stats.users.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales - Blog */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📝 Blog</h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Artículos"
            value={stats.blogs.total}
            icon={FileText}
            description="Publicados"
          />
          <StatCard
            title="Total Likes"
            value={stats.blogs.totalLikes}
            icon={Heart}
            description="En todos los artículos"
          />
          <StatCard
            title="Total Comentarios"
            value={stats.blogs.totalComments}
            icon={MessageSquare}
            description="En todos los artículos"
          />
          <StatCard
            title="Total Guardados"
            value={stats.blogs.totalBookmarks}
            icon={Bookmark}
            description="Bookmarks"
          />
        </div>
      </div>

      {/* Blog stats detalladas */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Artículos por estado */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold">Artículos por Estado</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.blogs.byStatus.map((status) => {
                const statusLabels: Record<string, { label: string; color: string }> = {
                  draft: { label: 'Borrador', color: 'bg-gray-500' },
                  pending_review: { label: 'En Revisión', color: 'bg-yellow-500' },
                  approved: { label: 'Aprobado', color: 'bg-green-500' },
                  rejected: { label: 'Rechazado', color: 'bg-red-500' }
                };
                const config = statusLabels[status.status] ?? { label: status.status, color: 'bg-gray-500' };
                
                return (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config.color}`} />
                      <span className="text-xs sm:text-sm">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">{status.count} artículos</span>
                      <div className="w-20 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${config.color}`}
                          style={{ width: `${(status.count / stats.blogs.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top autores */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold">Top Autores</h4>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {stats.blogs.topAuthors.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                  No hay artículos publicados
                </p>
              ) : (
                stats.blogs.topAuthors.map((author, index) => (
                  <div key={author.author} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-semibold text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{author.author}</span>
                    </div>
                    <Badge variant="secondary">{author.count} artículos</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas - Portfolio y Watchlist */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">💼 Portfolio</h3>
          <div className="grid gap-4 mb-4">
            <StatCard
              title="Total Transacciones"
              value={stats.portfolio.totalTransactions}
              icon={LayoutDashboard}
            />
            <StatCard
              title="Símbolos Únicos"
              value={stats.portfolio.uniqueSymbols}
              icon={TrendingUp}
            />
            <StatCard
              title="Usuarios con Portfolio"
              value={stats.portfolio.totalUsers}
              icon={Users}
            />
          </div>
          
          {/* Top símbolos en portfolio */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold">Top Símbolos en Portfolio</h4>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-1.5 sm:space-y-2">
                {stats.portfolio.topSymbols.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                    No hay transacciones registradas
                  </p>
                ) : (
                  stats.portfolio.topSymbols.slice(0, 5).map((symbol, index) => (
                    <div key={symbol.symbol} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground">#{index + 1}</span>
                        <Badge>{symbol.symbol}</Badge>
                      </div>
                      <span className="text-muted-foreground">{symbol.count} transacciones</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">⭐ Watchlist</h3>
          <div className="grid gap-3 sm:gap-4 mb-3 sm:mb-4">
            <StatCard
              title="Total Items"
              value={stats.watchlist.totalItems}
              icon={Star}
            />
            <StatCard
              title="Símbolos Únicos"
              value={stats.watchlist.uniqueSymbols}
              icon={TrendingUp}
            />
            <StatCard
              title="Usuarios con Watchlist"
              value={stats.watchlist.totalUsers}
              icon={Users}
            />
          </div>
          
          {/* Top símbolos en watchlist */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold">Símbolos Más Guardados</h4>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-1.5 sm:space-y-2">
                {stats.watchlist.topSymbols.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                    No hay símbolos en watchlist
                  </p>
                ) : (
                  stats.watchlist.topSymbols.slice(0, 5).map((symbol, index) => (
                    <div key={symbol.symbol} className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground">#{index + 1}</span>
                        <Badge>{symbol.symbol}</Badge>
                      </div>
                      <span className="text-muted-foreground">{symbol.count} usuarios</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sugerencias */}
      <div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">💡 Sugerencias</h3>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <StatCard
              title="Total Sugerencias"
              value={stats.suggestions.total}
              icon={MessageSquare}
            />
            
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold">Por Estado</h4>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  {stats.suggestions.byStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <Badge variant={status.status === 'pending' ? 'default' : 'secondary'} className="text-xs">
                        {status.status}
                      </Badge>
                      <span className="text-xs sm:text-sm">{status.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold">Sugerencias Recientes</h4>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2 sm:space-y-3">
                {stats.suggestions.recent.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                    No hay sugerencias
                  </p>
                ) : (
                  stats.suggestions.recent.map((suggestion) => (
                    <div key={suggestion.id} className="border-b pb-2 last:border-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs sm:text-sm font-medium line-clamp-1">{suggestion.title}</p>
                        <Badge variant="outline" className="shrink-0 text-xs">{suggestion.status}</Badge>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {format(new Date(suggestion.created_at), 'PPp', { locale: es })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección de Actividad y Seguridad */}
      <div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">🔒 Actividad y Seguridad</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Intentos de Login"
            value={stats.activity.loginAttempts}
            icon={LogIn}
            description={dateRange.label}
          />
          <StatCard
            title="Logins Exitosos"
            value={stats.activity.successfulLogins}
            icon={Users}
            description="Autenticaciones"
          />
          <StatCard
            title="Logins Fallidos"
            value={stats.activity.failedLogins}
            icon={ShieldAlert}
            description="Intentos"
          />
          <StatCard
            title="Nuevos Registros"
            value={stats.activity.registrations}
            icon={UserPlus}
            description={dateRange.label}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="Total Logs"
            value={stats.logs.total}
            icon={Eye}
            description={dateRange.label}
          />
          <StatCard
            title="Errores"
            value={stats.logs.errors}
            icon={AlertCircle}
            description="Nivel ERROR"
            className="border-red-200"
          />
          <StatCard
            title="Advertencias"
            value={stats.logs.warnings}
            icon={AlertCircle}
            description="Nivel WARN"
            className="border-yellow-200"
          />
          <StatCard
            title="Tipos de Eventos"
            value={stats.logs.topEvents.length}
            icon={Activity}
            description="Únicos"
          />
        </div>
      </div>

      {/* Logs detallados */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución de logs por nivel */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold">Logs por Nivel</h4>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {stats.logs.byLevel.map((level) => {
                const levelColors: Record<string, string> = {
                  INFO: 'bg-blue-500',
                  WARN: 'bg-yellow-500',
                  ERROR: 'bg-red-500',
                  DEBUG: 'bg-gray-500'
                };
                const color = levelColors[level.level] ?? 'bg-gray-500';
                
                return (
                  <div key={level.level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="font-medium text-xs sm:text-sm">{level.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">{level.count} eventos</span>
                      <div className="w-20 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${(level.count / stats.logs.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top eventos */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold">Eventos Más Frecuentes</h4>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-1.5 sm:space-y-2">
              {stats.logs.topEvents.slice(0, 8).map((event, index) => (
                <div key={event.event_type} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="font-mono text-[10px] sm:text-xs">{event.event_type}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{event.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errores recientes */}
      {stats.logs.recentErrors.length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <h4 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              Errores Más Frecuentes
            </h4>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {stats.logs.recentErrors.map((error) => (
                <div key={error.event_type} className="border-l-4 border-red-500 pl-3 sm:pl-4 py-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-mono text-xs sm:text-sm font-semibold">{error.event_type}</span>
                    <Badge variant="destructive" className="text-xs">{error.count}x</Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-1">
                    {error.message}
                  </p>
                  <p className="caption text-muted-foreground">
                    Última ocurrencia: {format(new Date(error.created_at), 'PPp', { locale: es })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
