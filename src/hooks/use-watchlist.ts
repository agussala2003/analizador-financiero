// src/hooks/use-watchlist.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { logger } from '../lib/logger';
import type { WatchlistItem, CreateWatchlistItemDto, UpdateWatchlistItemDto } from '../types/watchlist';

/**
 * Hook para obtener la watchlist del usuario
 */
export function useWatchlist() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async (): Promise<WatchlistItem[]> => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        void logger.error('WATCHLIST_FETCH_ERROR', 'Error fetching watchlist', { error });
        throw new Error('No se pudo obtener tu watchlist');
      }

      return (data || []) as WatchlistItem[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Hook para verificar si un asset está en watchlist
 */
export function useIsInWatchlist(symbol: string) {
  const { data: watchlist = [] } = useWatchlist();
  
  return watchlist.some(item => item.symbol === symbol);
}

/**
 * Hook para obtener un item específico del watchlist
 */
export function useWatchlistItem(symbol: string) {
  const { data: watchlist = [] } = useWatchlist();
  
  return watchlist.find(item => item.symbol === symbol);
}

/**
 * Hook para las mutaciones del watchlist
 */
export function useWatchlistMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['watchlist', user?.id];

  // Agregar a watchlist
  const addToWatchlist = useMutation({
    mutationFn: async (dto: CreateWatchlistItemDto): Promise<WatchlistItem> => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const result = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol: dto.symbol,
          notes: dto.notes,
        })
        .select()
        .single();

      if (result.error) {
        void logger.error('WATCHLIST_ADD_ERROR', 'Error adding to watchlist', { error: result.error, dto });
        
        // Si es duplicado, mostrar mensaje específico
        if (result.error.code === '23505') {
          throw new Error('Este asset ya está en tu watchlist');
        }
        
        throw new Error('No se pudo agregar a watchlist');
      }

      return result.data as WatchlistItem;
    },
    onSuccess: (data) => {
      // Actualizar caché
      queryClient.setQueryData<WatchlistItem[]>(queryKey, (old = []) => [data, ...old]);
      toast.success(`${data.symbol} agregado a watchlist`);
      void logger.info('WATCHLIST_ADDED', 'Asset added to watchlist', { symbol: data.symbol });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agregar a watchlist');
    },
  });

  // Remover de watchlist
  const removeFromWatchlist = useMutation({
    mutationFn: async (symbol: string): Promise<void> => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) {
        void logger.error('WATCHLIST_REMOVE_ERROR', 'Error removing from watchlist', { error, symbol });
        throw new Error('No se pudo eliminar de watchlist');
      }
    },
    onSuccess: (_data, symbol) => {
      // Actualizar caché
      queryClient.setQueryData<WatchlistItem[]>(queryKey, (old = []) => 
        old.filter(item => item.symbol !== symbol)
      );
      toast.success(`${symbol} eliminado de watchlist`);
      void logger.info('WATCHLIST_REMOVED', 'Asset removed from watchlist', { symbol });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar de watchlist');
    },
  });

  // Actualizar notas
  const updateWatchlistItem = useMutation({
    mutationFn: async ({ symbol, dto }: { symbol: string; dto: UpdateWatchlistItemDto }): Promise<WatchlistItem> => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const result = await supabase
        .from('watchlist')
        .update({ notes: dto.notes })
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .select()
        .single();

      if (result.error) {
        void logger.error('WATCHLIST_UPDATE_ERROR', 'Error updating watchlist item', { error: result.error, symbol, dto });
        throw new Error('No se pudo actualizar el item');
      }

      return result.data as WatchlistItem;
    },
    onSuccess: (data) => {
      // Actualizar caché
      queryClient.setQueryData<WatchlistItem[]>(queryKey, (old = []) => 
        old.map(item => item.symbol === data.symbol ? data : item)
      );
      toast.success('Notas actualizadas');
      void logger.info('WATCHLIST_UPDATED', 'Watchlist item updated', { symbol: data.symbol });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar');
    },
  });

  // Toggle watchlist (agregar o remover)
  const toggleWatchlist = useMutation({
    mutationFn: async (symbol: string): Promise<'added' | 'removed'> => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar si ya está en watchlist
      const { data: existing } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

      if (existing) {
        // Remover
        await removeFromWatchlist.mutateAsync(symbol);
        return 'removed';
      } else {
        // Agregar
        await addToWatchlist.mutateAsync({ symbol });
        return 'added';
      }
    },
  });

  return {
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    toggleWatchlist,
  };
}
