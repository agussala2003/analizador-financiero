// docs/OPTIMISTIC_UPDATES.md

# Optimistic Updates Pattern

Este documento explica el patrón de **Optimistic Updates** implementado en la aplicación y cómo usarlo correctamente.

## ¿Qué son Optimistic Updates?

Los **Optimistic Updates** son una técnica de UX que actualiza la interfaz **instantáneamente** cuando el usuario realiza una acción, **antes** de que el servidor confirme el cambio.

### Sin Optimistic Updates:
```
Usuario hace clic → Loading spinner → Espera respuesta del servidor → UI se actualiza
Tiempo de espera: 500ms - 2s (percibido como lento)
```

### Con Optimistic Updates:
```
Usuario hace clic → UI se actualiza INMEDIATAMENTE → Servidor procesa en background
Tiempo de espera: 0ms (se siente instantáneo)
```

## Beneficios

1. **UX Instantánea**: La app se siente más rápida y responsiva
2. **Menos Frustración**: No hay spinners ni delays visibles
3. **Mejor Percepción**: Los usuarios perciben la app como "nativa"
4. **Rollback Automático**: Si el servidor falla, se revierte automáticamente

## Implementación en TanStack Query

### Anatomía de una Mutation con Optimistic Updates

```typescript
const mutation = useMutation({
  // 1️⃣ La función que se ejecuta en el servidor
  mutationFn: async (data) => {
    const response = await api.post('/endpoint', data);
    return response.json();
  },

  // 2️⃣ ANTES de llamar al servidor (INSTANTÁNEO)
  onMutate: async (variables) => {
    // Paso 1: Cancelar queries en curso para evitar race conditions
    await queryClient.cancelQueries({ queryKey: ['items'] });

    // Paso 2: Snapshot del estado actual (para rollback)
    const previousItems = queryClient.getQueryData(['items']);

    // Paso 3: Actualizar caché optimistamente
    queryClient.setQueryData(['items'], (old) => [...old, variables]);

    // Paso 4: Feedback visual instantáneo
    toast.success('Item agregado');

    // Paso 5: Retornar context para rollback
    return { previousItems };
  },

  // 3️⃣ Si el servidor responde con éxito
  onSuccess: (data) => {
    // Reemplazar datos optimistas con datos reales del servidor
    queryClient.setQueryData(['items'], (old) => 
      old.map(item => item.id === 'temp' ? data : item)
    );
  },

  // 4️⃣ Si el servidor falla
  onError: (error, variables, context) => {
    // ROLLBACK: Restaurar estado anterior
    if (context?.previousItems) {
      queryClient.setQueryData(['items'], context.previousItems);
    }
    toast.error('Error al agregar item');
  },

  // 5️⃣ Siempre al final (éxito o error)
  onSettled: () => {
    // Refetch para sincronizar con servidor
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

## Ejemplo Real: Watchlist Toggle

En nuestra app, el caso más visible es el botón de watchlist (⭐):

```typescript
// src/hooks/use-watchlist.ts

const toggleWatchlist = useMutation({
  mutationFn: async (symbol: string) => {
    // Verificar estado actual en servidor
    const existing = await checkIfExists(symbol);
    
    if (existing) {
      await supabase.from('watchlist').delete().eq('symbol', symbol);
      return 'removed';
    } else {
      await supabase.from('watchlist').insert({ symbol });
      return 'added';
    }
  },

  onMutate: async (symbol) => {
    // 🚫 Cancelar queries en curso
    await queryClient.cancelQueries({ queryKey: ['watchlist'] });

    // 📸 Snapshot
    const previousWatchlist = queryClient.getQueryData(['watchlist']);

    // 🎯 Determinar acción optimista
    const isInWatchlist = previousWatchlist.some(item => item.symbol === symbol);

    if (isInWatchlist) {
      // ➖ Remover instantáneamente
      queryClient.setQueryData(['watchlist'], (old) => 
        old.filter(item => item.symbol !== symbol)
      );
      toast.success(`${symbol} eliminado`);
    } else {
      // ➕ Agregar instantáneamente
      const optimisticItem = {
        id: `temp-${Date.now()}`, // ID temporal
        symbol,
        added_at: new Date().toISOString(),
      };
      queryClient.setQueryData(['watchlist'], (old) => [optimisticItem, ...old]);
      toast.success(`${symbol} agregado`);
    }

    return { previousWatchlist };
  },

  onError: (error, symbol, context) => {
    // 🔄 ROLLBACK si falla
    if (context?.previousWatchlist) {
      queryClient.setQueryData(['watchlist'], context.previousWatchlist);
    }
    toast.error('Error al actualizar');
  },

  onSettled: () => {
    // 🔄 Sincronizar con servidor
    queryClient.invalidateQueries({ queryKey: ['watchlist'] });
  },
});
```

## Casos de Uso Perfectos

### ✅ Bueno para Optimistic Updates:
- ✅ **Watchlist add/remove** - Acción simple, reversible
- ✅ **Likes/Favorites** - Estado binario, fácil de revertir
- ✅ **Editar notas** - Cambios locales, bajo riesgo
- ✅ **Toggle switches** - Estado on/off claro
- ✅ **Soft deletes** - Se puede "deshacer"

### ❌ NO recomendado para:
- ❌ **Pagos/Transacciones** - Crítico, no optimista
- ❌ **Operaciones irreversibles** - Delete permanente
- ❌ **Lógica de negocio compleja** - Validaciones del servidor
- ❌ **Datos calculados** - El servidor debe calcular
- ❌ **Multi-step flows** - Demasiado complejo

## Patrones Comunes

### Patrón 1: Add Item

```typescript
onMutate: async (newItem) => {
  await queryClient.cancelQueries({ queryKey: ['items'] });
  const previous = queryClient.getQueryData(['items']);
  
  const optimisticItem = {
    id: `temp-${Date.now()}`,
    ...newItem,
    created_at: new Date().toISOString(),
  };
  
  queryClient.setQueryData(['items'], (old) => [optimisticItem, ...old]);
  
  return { previous };
},
```

### Patrón 2: Remove Item

```typescript
onMutate: async (itemId) => {
  await queryClient.cancelQueries({ queryKey: ['items'] });
  const previous = queryClient.getQueryData(['items']);
  
  queryClient.setQueryData(['items'], (old) => 
    old.filter(item => item.id !== itemId)
  );
  
  return { previous };
},
```

### Patrón 3: Update Item

```typescript
onMutate: async ({ id, updates }) => {
  await queryClient.cancelQueries({ queryKey: ['items'] });
  const previous = queryClient.getQueryData(['items']);
  
  queryClient.setQueryData(['items'], (old) => 
    old.map(item => item.id === id ? { ...item, ...updates } : item)
  );
  
  return { previous };
},
```

### Patrón 4: Toggle Boolean

```typescript
onMutate: async (itemId) => {
  await queryClient.cancelQueries({ queryKey: ['items'] });
  const previous = queryClient.getQueryData(['items']);
  
  queryClient.setQueryData(['items'], (old) => 
    old.map(item => 
      item.id === itemId 
        ? { ...item, enabled: !item.enabled } 
        : item
    )
  );
  
  return { previous };
},
```

## Troubleshooting

### Problema: Race Conditions

**Síntoma**: Datos inconsistentes, updates que "desaparecen"

**Solución**: Siempre cancelar queries en `onMutate`:
```typescript
await queryClient.cancelQueries({ queryKey: ['items'] });
```

### Problema: UI no revierte en error

**Síntoma**: Después de un error, la UI muestra el update optimista

**Solución**: Asegurarse de hacer rollback en `onError`:
```typescript
onError: (error, variables, context) => {
  if (context?.previous) {
    queryClient.setQueryData(['items'], context.previous);
  }
},
```

### Problema: Duplicados en la lista

**Síntoma**: El mismo item aparece 2 veces

**Solución**: Usar IDs temporales únicos y reemplazarlos en `onSuccess`:
```typescript
// En onMutate
const optimisticItem = { id: `temp-${Date.now()}`, ...data };

// En onSuccess
queryClient.setQueryData(['items'], (old) => 
  old.map(item => 
    item.id.startsWith('temp-') && item.symbol === data.symbol 
      ? data  // Reemplazar con datos reales
      : item
  )
);
```

## Testing Optimistic Updates

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWatchlistMutations } from './use-watchlist';

describe('useWatchlistMutations - Optimistic Updates', () => {
  it('should add item optimistically and rollback on error', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Mock de API que falla
    vi.spyOn(supabase, 'from').mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: new Error('Server error') }),
    });

    const { result } = renderHook(() => useWatchlistMutations(), { wrapper });

    // Estado inicial
    const initialWatchlist = [];
    queryClient.setQueryData(['watchlist'], initialWatchlist);

    // Ejecutar mutation
    result.current.addToWatchlist.mutate({ symbol: 'AAPL' });

    // Verificar update optimista (inmediato)
    await waitFor(() => {
      const watchlist = queryClient.getQueryData(['watchlist']);
      expect(watchlist).toHaveLength(1);
      expect(watchlist[0].symbol).toBe('AAPL');
    });

    // Esperar a que falle
    await waitFor(() => {
      expect(result.current.addToWatchlist.isError).toBe(true);
    });

    // Verificar rollback
    const finalWatchlist = queryClient.getQueryData(['watchlist']);
    expect(finalWatchlist).toEqual(initialWatchlist); // Volvió al estado inicial
  });
});
```

## Best Practices

1. ✅ **Siempre cancelar queries** en `onMutate`
2. ✅ **Siempre hacer snapshot** del estado anterior
3. ✅ **Usar IDs temporales únicos** (ej: `temp-${Date.now()}`)
4. ✅ **Mostrar feedback visual** inmediato (toast)
5. ✅ **Implementar rollback** en `onError`
6. ✅ **Invalidar en `onSettled`** para sincronizar
7. ✅ **Reemplazar datos optimistas** con datos reales en `onSuccess`
8. ✅ **Testear tanto success como error paths**

## Referencias

- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Kent C. Dodds - Optimistic UI](https://kentcdodds.com/blog/optimistic-ui-in-react-query)
- [UI.dev - Optimistic Updates](https://ui.dev/c/query/optimistic-updates)
