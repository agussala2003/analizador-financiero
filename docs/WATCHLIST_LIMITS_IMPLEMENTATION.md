# Implementación de Límites de Watchlist

## 📋 Resumen

Se implementó la **validación de límites de plan para el watchlist**, completando el sistema de restricciones. El watchlist ya tenía toda la infraestructura (tabla, hooks, componentes) pero **faltaba la validación de límites**.

---

## ✅ Cambios Implementados

### 1. **Hook `use-watchlist.ts` - Validación de Límites**

#### Ubicación
`src/hooks/use-watchlist.ts`

#### Cambios
1. **Import de `usePlanLimits`**:
```typescript
import { usePlanLimits } from './use-plan-limits';
```

2. **Validación en `useWatchlistMutations`**:
```typescript
export function useWatchlistMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['watchlist', user?.id];

  // ✅ Obtener watchlist actual para validar límites
  const { data: currentWatchlist = [] } = useWatchlist();
  const { isAtLimit, limit } = usePlanLimits('watchlist', currentWatchlist.length);

  // ... mutations
}
```

3. **Validación en `addToWatchlist` (línea ~78)**:
```typescript
mutationFn: async (dto: CreateWatchlistItemDto): Promise<WatchlistItem> => {
  if (!user?.id) {
    throw new Error('Usuario no autenticado');
  }

  // ✅ VALIDAR LÍMITE DEL PLAN ANTES DE AGREGAR
  if (isAtLimit) {
    throw new Error(`Has alcanzado el límite de ${limit} activos en tu watchlist. Actualiza tu plan para agregar más.`);
  }

  // Proceder con insert...
}
```

4. **Validación en `toggleWatchlist` (línea ~290)**:
```typescript
if (existing) {
  // Remover...
} else {
  // ✅ VALIDAR LÍMITE DEL PLAN ANTES DE AGREGAR
  if (isAtLimit) {
    throw new Error(`Has alcanzado el límite de ${limit} activos en tu watchlist. Actualiza tu plan para agregar más.`);
  }

  // Agregar...
}
```

#### Comportamiento
- **Antes de agregar**: Verifica si el usuario alcanzó su límite
- **Si está en el límite**: Lanza error con mensaje descriptivo
- **El error se captura**: En `onError` de mutation → muestra toast
- **Optimistic update**: Se hace rollback automático si hay error

---

### 2. **Página `watchlist-page.tsx` - Indicador Visual**

#### Ubicación
`src/features/watchlist/pages/watchlist-page.tsx`

#### Cambios
1. **Imports adicionales**:
```typescript
import { usePlanLimits } from '../../../hooks/use-plan-limits';
import { Badge } from '../../../components/ui/badge';
import { Crown } from 'lucide-react';
```

2. **Hook de límites**:
```typescript
const { limit, isAtLimit } = usePlanLimits('watchlist', watchlist.length);
```

3. **Badge con contador visual**:
```tsx
<div className="flex items-center gap-3">
  <h1 className="heading-2">Mi Watchlist</h1>
  <Badge 
    variant={isAtLimit ? "destructive" : "secondary"}
    className="gap-1"
  >
    {watchlist.length} / {limit}
    {isAtLimit && <Crown className="h-3 w-3" />}
  </Badge>
</div>
```

4. **Mensaje de límite alcanzado**:
```tsx
<p className="body text-muted-foreground mt-1">
  {watchlist.length} {watchlist.length === 1 ? 'asset' : 'assets'} en seguimiento
  {isAtLimit && ' · Límite alcanzado'}
</p>
```

5. **Botón de upgrade cuando está en límite**:
```tsx
{isAtLimit && (
  <Button variant="default" onClick={() => void navigate('/plans')} className="btn-press gap-2">
    <Crown className="h-4 w-4" />
    Actualizar Plan
  </Button>
)}
```

#### Experiencia de Usuario
- **Badge visual**: Muestra `3 / 5` (ejemplo para Básico)
- **Color rojo**: Cuando alcanza el límite
- **Icono de corona**: Aparece cuando está en límite
- **Botón de upgrade**: Prominente cuando está en límite
- **Mensaje claro**: "Límite alcanzado" en el subtítulo

---

## 🎯 Límites por Plan

| Plan | Límite Watchlist | Config |
|------|-----------------|--------|
| **Básico** | 5 activos | `roleLimits.basico: 5` |
| **Plus** | 25 activos | `roleLimits.plus: 25` |
| **Premium** | 50 activos | `roleLimits.premium: 50` |
| **Admin** | Ilimitado | `roleLimits.administrador: 100000` |

---

## 📊 Flujos Validados

### Flujo 1: Agregar desde Asset Detail
```
1. Usuario: Clic en "Agregar a Watchlist" (WatchlistToggleButton)
2. Hook: Verifica límite con usePlanLimits
3a. Si NO está en límite:
   - Optimistic update: Agrega inmediatamente en UI
   - API: Insert en Supabase
   - Toast: "AAPL agregado a watchlist"
3b. Si SÍ está en límite:
   - Lanza error
   - onError: Rollback optimistic update
   - Toast: "Has alcanzado el límite de 5 activos..."
```

### Flujo 2: Toggle desde Watchlist Page
```
1. Usuario: Clic en estrella en card
2. Hook: Verifica si existe en watchlist
3a. Si existe: Remueve (sin validación)
3b. Si NO existe:
   - Verifica límite
   - Si está en límite: Error + toast
   - Si no: Agrega con optimistic update
```

### Flujo 3: Visualización en Watchlist Page
```
1. Usuario: Entra a /watchlist
2. Hook: Fetch watchlist del usuario
3. Hook: Calcula límite con usePlanLimits('watchlist', count)
4. UI: Muestra badge "5 / 5" (rojo si en límite)
5. UI: Muestra botón "Actualizar Plan" si isAtLimit
```

---

## 🔧 Integración con Sistema Existente

### Hooks Utilizados
- ✅ `usePlanLimits('watchlist', count)` - Ya existía
- ✅ `useWatchlist()` - Ya existía
- ✅ `useWatchlistMutations()` - Ya existía, **ahora con validación**
- ✅ `useIsInWatchlist(symbol)` - Ya existía

### Componentes
- ✅ `WatchlistToggleButton` - No requiere cambios (maneja errores automáticamente)
- ✅ `WatchlistPage` - **Actualizada con indicador visual**

### Base de Datos
- ✅ Tabla `watchlist` - Ya existía
- ✅ RLS policies - Ya existían
- ✅ Migration `20241213_watchlist.sql` - Ya aplicada

---

## 🧪 Casos de Prueba

### Test 1: Usuario Básico (límite: 5)
```
1. Agregar 5 activos → ✅ Success
2. Intentar agregar 6to → ❌ Error: "Has alcanzado el límite de 5 activos..."
3. Verificar badge → 🔴 "5 / 5" (rojo)
4. Verificar botón → 👑 "Actualizar Plan" visible
```

### Test 2: Usuario Plus (límite: 25)
```
1. Agregar 25 activos → ✅ Success
2. Intentar agregar 26to → ❌ Error
3. Verificar badge → 🔴 "25 / 25"
```

### Test 3: Usuario Premium (límite: 50)
```
1. Agregar 50 activos → ✅ Success
2. Intentar agregar 51vo → ❌ Error
3. Verificar badge → 🔴 "50 / 50"
```

### Test 4: Optimistic Update Rollback
```
1. Usuario en límite (5/5)
2. Clic en agregar 6to
3. UI: Instantáneamente muestra 6/5 (optimistic)
4. API: Devuelve error
5. onError: Rollback → Vuelve a 5/5
6. Toast: Mensaje de error
```

---

## 📝 Mensajes de Error

### En Mutations
```typescript
throw new Error(`Has alcanzado el límite de ${limit} activos en tu watchlist. Actualiza tu plan para agregar más.`);
```

### En UI (Toast)
- **Success**: `"AAPL agregado a watchlist"`
- **Error**: `"Error al actualizar watchlist"` (mensaje genérico, error detallado en consola)

### En Badge
- **Normal**: `"5 / 25"` (gris)
- **En límite**: `"25 / 25"` (rojo) + icono corona

---

## 🚀 Estado del Sistema

### Completado ✅
- [x] Validación de límites en `addToWatchlist`
- [x] Validación de límites en `toggleWatchlist`
- [x] Indicador visual en `WatchlistPage`
- [x] Badge con contador `N / limit`
- [x] Botón de upgrade cuando está en límite
- [x] Mensaje "Límite alcanzado"
- [x] Manejo de errores con toast
- [x] Optimistic updates con rollback

### Infraestructura Pre-existente ✅
- [x] Tabla `watchlist` en Supabase
- [x] Hook `useWatchlist()` con queries
- [x] Hook `useWatchlistMutations()` con mutations
- [x] Hook `usePlanLimits()` con lógica de límites
- [x] Componente `WatchlistToggleButton`
- [x] Página `WatchlistPage`

---

## 📖 Documentación Relacionada

- **Plan Restrictions**: `docs/PLAN_RESTRICTIONS_COMPLETED.md`
- **Plan Limits Audit**: `docs/PLAN_LIMITS_AUDIT.md`
- **Plan Limits Correction**: `docs/PLAN_LIMITS_CORRECTION.md`
- **Migration**: `supabase/migrations/20241213_watchlist.sql`

---

## 🎉 Conclusión

El sistema de **watchlist con límites de plan está completamente funcional**:

1. ✅ **Límites aplicados**: 5/25/50 según plan
2. ✅ **Validación robusta**: Antes de cada insert
3. ✅ **UX clara**: Badge visual + botón de upgrade
4. ✅ **Manejo de errores**: Toast + rollback automático
5. ✅ **Optimistic updates**: Experiencia instantánea

**No se requieren cambios adicionales en el watchlist.**
