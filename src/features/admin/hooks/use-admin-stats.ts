// src/features/admin/hooks/use-admin-stats.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface UserStats {
  total: number;
  byRole: { role: string; count: number }[];
  newUsers: number;
  activeUsers: number;
  withBlogPermission: number;
}

export interface BlogStats {
  total: number;
  byStatus: { status: string; count: number }[];
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  topAuthors: { author: string; count: number }[];
}

export interface PortfolioStats {
  totalTransactions: number;
  uniqueSymbols: number;
  totalUsers: number;
  topSymbols: { symbol: string; count: number }[];
}

export interface WatchlistStats {
  totalItems: number;
  uniqueSymbols: number;
  totalUsers: number;
  topSymbols: { symbol: string; count: number }[];
}

export interface SuggestionStats {
  total: number;
  byStatus: { status: string; count: number }[];
  recent: { id: string; title: string; status: string; created_at: string }[];
}

export interface LogStats {
  total: number;
  byLevel: { level: string; count: number }[];
  errors: number;
  warnings: number;
  recentErrors: { event_type: string; message: string; created_at: string; count: number }[];
  topEvents: { event_type: string; count: number }[];
}

export interface ActivityStats {
  loginAttempts: number;
  successfulLogins: number;
  failedLogins: number;
  registrations: number;
}

export interface AdminStats {
  users: UserStats;
  blogs: BlogStats;
  portfolio: PortfolioStats;
  watchlist: WatchlistStats;
  suggestions: SuggestionStats;
  logs: LogStats;
  activity: ActivityStats;
}

export function useAdminStats(dateRange: DateRange) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        usersData,
        blogsData,
        portfolioData,
        watchlistData,
        suggestionsData,
        logsData,
        activityData
      ] = await Promise.all([
        fetchUserStats(),
        fetchBlogStats(),
        fetchPortfolioStats(),
        fetchWatchlistStats(),
        fetchSuggestionStats(),
        fetchLogStats(),
        fetchActivityStats()
      ]);

      setStats({
        users: usersData,
        blogs: blogsData,
        portfolio: portfolioData,
        watchlist: watchlistData,
        suggestions: suggestionsData,
        logs: logsData,
        activity: activityData
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async (): Promise<UserStats> => {
    // Total usuarios
    const { count: total } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    // Usuarios por rol
    const { data: roleData } = await supabase
      .from('profiles')
      .select('role');

    const byRole: { role: string; count: number }[] = [];
    if (roleData) {
      const roleCounts: Record<string, number> = {};
      roleData.forEach((item: { role: string }) => {
        roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
      });
      Object.entries(roleCounts).forEach(([role, count]) => {
        byRole.push({ role, count });
      });
    }

    // Nuevos usuarios en el rango (solo si existe la columna created_at)
    let newUsers = 0;
    try {
      const { count, error: newUsersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
      
      if (!newUsersError) {
        newUsers = count ?? 0;
      }
    } catch {
      // Silently fail if created_at doesn't exist
      console.warn('Note: profiles.created_at column not available for new users tracking');
    }

    // Usuarios con permiso de blog
    const { count: withBlogPermission } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('can_upload_blog', true);

    // Usuarios activos (con logs en el período)
    const { data: activeLogs } = await supabase
      .from('logs')
      .select('user_id')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    const activeUsers = activeLogs 
      ? new Set(activeLogs.map((log: { user_id: string | null }) => log.user_id).filter(Boolean)).size 
      : 0;

    return {
      total: total ?? 0,
      byRole,
      newUsers: newUsers ?? 0,
      activeUsers,
      withBlogPermission: withBlogPermission ?? 0
    };
  };

  const fetchBlogStats = async (): Promise<BlogStats> => {
    // Total blogs
    const { count: total } = await supabase
      .from('blogs')
      .select('id', { count: 'exact', head: true });

    // Blogs por estado
    const { data: statusData } = await supabase
      .from('blogs')
      .select('status');

    const byStatus: { status: string; count: number }[] = [];
    if (statusData) {
      const statusCounts: Record<string, number> = {};
      statusData.forEach((item: { status: string }) => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        byStatus.push({ status, count });
      });
    }

    // Total likes
    const { count: totalLikes } = await supabase
      .from('blog_likes')
      .select('id', { count: 'exact', head: true });

    // Total comentarios
    const { count: totalComments } = await supabase
      .from('blog_comments')
      .select('id', { count: 'exact', head: true });

    // Total bookmarks
    const { count: totalBookmarks } = await supabase
      .from('blog_bookmarks')
      .select('id', { count: 'exact', head: true });

    // Top autores
    const { data: blogsWithAuthors } = await supabase
      .from('blogs')
      .select('user_id, author:profiles!fk_author(first_name, last_name)');

    const topAuthors: { author: string; count: number }[] = [];
    if (blogsWithAuthors) {
      const authorCounts: Record<string, number> = {};
      blogsWithAuthors.forEach((item: Record<string, unknown>) => {
        const author = item.author as { first_name: string; last_name: string };
        const name = `${author.first_name} ${author.last_name}`.trim();
        authorCounts[name] = (authorCounts[name] || 0) + 1;
      });
      Object.entries(authorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([author, count]) => {
          topAuthors.push({ author, count });
        });
    }

    return {
      total: total ?? 0,
      byStatus,
      totalLikes: totalLikes ?? 0,
      totalComments: totalComments ?? 0,
      totalBookmarks: totalBookmarks ?? 0,
      topAuthors
    };
  };

  const fetchPortfolioStats = async (): Promise<PortfolioStats> => {
    // Total transacciones
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true });

    // Símbolos únicos
    const { data: symbolsData } = await supabase
      .from('transactions')
      .select('symbol');

    const uniqueSymbols = symbolsData 
      ? new Set(symbolsData.map((t: { symbol: string }) => t.symbol)).size 
      : 0;

    // Usuarios con transacciones
    const { data: usersData } = await supabase
      .from('transactions')
      .select('user_id');

    const totalUsers = usersData 
      ? new Set(usersData.map((t: { user_id: string }) => t.user_id)).size 
      : 0;

    // Top símbolos
    const topSymbols: { symbol: string; count: number }[] = [];
    if (symbolsData) {
      const symbolCounts: Record<string, number> = {};
      symbolsData.forEach((item: { symbol: string }) => {
        symbolCounts[item.symbol] = (symbolCounts[item.symbol] || 0) + 1;
      });
      Object.entries(symbolCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([symbol, count]) => {
          topSymbols.push({ symbol, count });
        });
    }

    return {
      totalTransactions: totalTransactions ?? 0,
      uniqueSymbols,
      totalUsers,
      topSymbols
    };
  };

  const fetchWatchlistStats = async (): Promise<WatchlistStats> => {
    // Total items en watchlist
    const { count: totalItems } = await supabase
      .from('watchlist')
      .select('id', { count: 'exact', head: true });

    // Símbolos únicos
    const { data: symbolsData } = await supabase
      .from('watchlist')
      .select('symbol');

    const uniqueSymbols = symbolsData 
      ? new Set(symbolsData.map((w: { symbol: string }) => w.symbol)).size 
      : 0;

    // Usuarios con watchlist
    const { data: usersData } = await supabase
      .from('watchlist')
      .select('user_id');

    const totalUsers = usersData 
      ? new Set(usersData.map((w: { user_id: string }) => w.user_id)).size 
      : 0;

    // Top símbolos en watchlist
    const topSymbols: { symbol: string; count: number }[] = [];
    if (symbolsData) {
      const symbolCounts: Record<string, number> = {};
      symbolsData.forEach((item: { symbol: string }) => {
        symbolCounts[item.symbol] = (symbolCounts[item.symbol] || 0) + 1;
      });
      Object.entries(symbolCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([symbol, count]) => {
          topSymbols.push({ symbol, count });
        });
    }

    return {
      totalItems: totalItems ?? 0,
      uniqueSymbols,
      totalUsers,
      topSymbols
    };
  };

  const fetchSuggestionStats = async (): Promise<SuggestionStats> => {
    try {
      // Total sugerencias
      const { count: total, error: countError } = await supabase
        .from('suggestions')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        console.warn('Suggestions table not available:', countError);
        return { total: 0, byStatus: [], recent: [] };
      }

      // Sugerencias por estado
      const { data: statusData, error: statusError } = await supabase
        .from('suggestions')
        .select('status');
      
      if (statusError) {
        console.warn('Error fetching suggestion status:', statusError);
        return { total: total ?? 0, byStatus: [], recent: [] };
      }

      const byStatus: { status: string; count: number }[] = [];
      if (statusData) {
        const statusCounts: Record<string, number> = {};
        statusData.forEach((item: { status: string }) => {
          statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        });
        Object.entries(statusCounts).forEach(([status, count]) => {
          byStatus.push({ status, count });
        });
      }

      // Sugerencias recientes (usando 'content' en lugar de 'title')
      const { data: recentData, error: recentError } = await supabase
        .from('suggestions')
        .select('id, content, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.warn('Error fetching recent suggestions:', recentError);
      }

      // Mapear content a title para compatibilidad con la interfaz
      const recent = (recentData ?? []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        title: (item.content as string)?.substring(0, 100) + (((item.content as string)?.length ?? 0) > 100 ? '...' : ''),
        status: item.status as string,
        created_at: item.created_at as string
      }));

      return {
        total: total ?? 0,
        byStatus,
        recent
      };
    } catch (error) {
      console.error('Error in fetchSuggestionStats:', error);
      return { total: 0, byStatus: [], recent: [] };
    }
  };

  const fetchLogStats = async (): Promise<LogStats> => {
    // Total logs en el período
    const { count: total } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    // Logs por nivel
    const { data: levelData } = await supabase
      .from('logs')
      .select('level')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    const byLevel: { level: string; count: number }[] = [];
    let errors = 0;
    let warnings = 0;

    if (levelData) {
      const levelCounts: Record<string, number> = {};
      levelData.forEach((item: { level: string }) => {
        levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
        if (item.level === 'ERROR') errors++;
        if (item.level === 'WARN') warnings++;
      });
      Object.entries(levelCounts).forEach(([level, count]) => {
        byLevel.push({ level, count });
      });
    }

    // Errores recientes agrupados
    const { data: errorData } = await supabase
      .from('logs')
      .select('event_type, message, created_at')
      .eq('level', 'ERROR')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    const recentErrors: { event_type: string; message: string; created_at: string; count: number }[] = [];
    if (errorData) {
      const errorCounts: Record<string, { message: string; created_at: string; count: number }> = {};
      errorData.forEach((item: { event_type: string; message: string; created_at: string }) => {
        if (!errorCounts[item.event_type]) {
          errorCounts[item.event_type] = {
            message: item.message,
            created_at: item.created_at,
            count: 0
          };
        }
        errorCounts[item.event_type].count++;
      });
      Object.entries(errorCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .forEach(([event_type, data]) => {
          recentErrors.push({ event_type, ...data });
        });
    }

    // Top eventos
    const { data: eventData } = await supabase
      .from('logs')
      .select('event_type')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    const topEvents: { event_type: string; count: number }[] = [];
    if (eventData) {
      const eventCounts: Record<string, number> = {};
      eventData.forEach((item: { event_type: string }) => {
        eventCounts[item.event_type] = (eventCounts[item.event_type] || 0) + 1;
      });
      Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([event_type, count]) => {
          topEvents.push({ event_type, count });
        });
    }

    return {
      total: total ?? 0,
      byLevel,
      errors,
      warnings,
      recentErrors,
      topEvents
    };
  };

  const fetchActivityStats = async (): Promise<ActivityStats> => {
    // Intentos de login
    const { count: loginAttempts } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .in('event_type', ['LOGIN_SUCCESS', 'LOGIN_FAILED'])
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    // Logins exitosos
    const { count: successfulLogins } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'LOGIN_SUCCESS')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    // Logins fallidos
    const { count: failedLogins } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'LOGIN_FAILED')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    // Registros
    const { count: registrations } = await supabase
      .from('logs')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'REGISTER_SUCCESS')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString());

    return {
      loginAttempts: loginAttempts ?? 0,
      successfulLogins: successfulLogins ?? 0,
      failedLogins: failedLogins ?? 0,
      registrations: registrations ?? 0
    };
  };

  return { stats, isLoading, error, refetch: loadStats };
}
