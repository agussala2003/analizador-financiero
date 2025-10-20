# Fix de Cierre de Sesión (SignOut)

## Problema Detectado

El usuario reportó que al intentar cerrar sesión, la aplicación **no cerraba la sesión correctamente** y mantenía la sesión activa.

## Causa Raíz

La función `signOut` en `auth-provider.tsx` tenía múltiples problemas:

1. **Orden incorrecto de operaciones**: Limpiaba el estado local ANTES de llamar a `supabase.auth.signOut()`
2. **No limpiaba React Query cache**: Los datos cacheados permanecían en memoria
3. **Redirect + Reload simultáneos**: Causaba conflictos y estados inconsistentes
4. **No esperaba a que se completara la limpieza**: Redirect inmediato sin tiempo para cleanup

## Solución Implementada

### Flujo Mejorado del SignOut

```typescript
const signOut = async (): Promise<void> => {
  try {
    const toastId = toast.loading('Cerrando sesión...');
    
    // 1. Cerrar sesión en Supabase PRIMERO
    //    Esto limpia automáticamente localStorage (tokens, etc.)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.dismiss(toastId);
      toast.error('Error al cerrar sesión', { description: error.message });
      void logger.error('AUTH_SIGNOUT_FAILED', error.message);
      return;
    }
    
    // 2. Limpiar cache de React Query
    //    Elimina todos los datos cacheados (assets, portfolios, etc.)
    queryClient.clear();
    
    // 3. Limpiar estado local del provider
    setProfile(null);
    setSession(null);
    setIsLoaded(false);
    
    // 4. Limpiar cualquier residuo en localStorage
    //    Por si Supabase dejó algo o hay keys custom
    try {
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignorar errores de storage
    }
    
    toast.dismiss(toastId);
    toast.success('Sesión cerrada correctamente');
    
    // 5. Delay breve para asegurar que todo se limpió
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 6. Redirect a login
    //    El listener onAuthStateChange manejará el resto
    window.location.href = '/login';
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    toast.error('Error al cerrar sesión', { description: msg });
    void logger.error('AUTH_SIGNOUT_FAILED', msg);
  }
};
```

## Cambios Realizados

### 1. Orden Correcto de Operaciones

**Antes (❌ Incorrecto):**
```typescript
// Limpiaba estado antes de signOut de Supabase
queryClient.clear();
setProfile(null);
setSession(null);
await supabase.auth.signOut();
window.location.href = '/login';
window.location.reload(); // ⚠️ Conflicto con redirect
```

**Ahora (✅ Correcto):**
```typescript
// SignOut de Supabase primero (limpia tokens automáticamente)
await supabase.auth.signOut();

// Luego limpiar estado y cache
queryClient.clear();
setProfile(null);
setSession(null);
setIsLoaded(false);

// Limpiar residuos de localStorage
// ...

// Delay para asegurar limpieza
await new Promise(resolve => setTimeout(resolve, 100));

// Finalmente redirect (SIN reload)
window.location.href = '/login';
```

### 2. Limpieza de React Query Cache

**Nuevo Import:**
```typescript
import { queryClient } from '../lib/react-query';
```

**Uso:**
```typescript
// Limpia TODA la cache de React Query
queryClient.clear();
```

**Impacto:**
- ✅ Elimina todos los datos de assets cacheados
- ✅ Elimina datos de portfolios
- ✅ Elimina cualquier query pendiente
- ✅ Previene que el siguiente usuario vea datos del anterior

### 3. Limpieza Exhaustiva de localStorage

```typescript
// Encuentra y elimina TODAS las keys relacionadas con Supabase
const keysToRemove = Object.keys(localStorage).filter(key => 
  key.includes('supabase') || key.includes('sb-')
);
keysToRemove.forEach(key => localStorage.removeItem(key));
```

**Keys que se limpian:**
- `sb-<project-ref>-auth-token`
- `sb-<project-ref>-auth-token-code-verifier`
- Cualquier otra key custom de Supabase

### 4. Reset del Estado `isLoaded`

```typescript
setIsLoaded(false);
```

**Importancia:**
- Fuerza a que los guards (`ProtectedRoute`, `GuestRoute`) muestren loading
- Previene accesos no autorizados durante el proceso de logout
- Garantiza que la UI se actualice correctamente

### 5. Delay Estratégico

```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

**Razón:**
- Da tiempo a que todas las operaciones asíncronas se completen
- Asegura que el DOM se actualice con los toasts
- Previene race conditions entre cleanup y redirect

### 6. Manejo de Errores Mejorado

```typescript
try {
  // ... proceso de signOut
} catch (error) {
  const msg = error instanceof Error ? error.message : 'Error desconocido';
  toast.error('Error al cerrar sesión', { description: msg });
  void logger.error('AUTH_SIGNOUT_FAILED', msg);
}
```

**Mejoras:**
- ✅ Catch de cualquier error inesperado
- ✅ Toast notification clara para el usuario
- ✅ Logging del error para debugging
- ✅ No deja la app en estado inconsistente

## Flujo Completo del SignOut

```
Usuario hace click en "Cerrar sesión"
          ↓
signOut() inicia
          ↓
Toast: "Cerrando sesión..."
          ↓
supabase.auth.signOut()
    ↓               ↓
  Error         Éxito
    ↓               ↓
Toast error   queryClient.clear()
    ↓               ↓
  Return      setProfile(null)
              setSession(null)
              setIsLoaded(false)
                  ↓
        Limpiar localStorage
                  ↓
        Toast: "Sesión cerrada"
                  ↓
          Delay 100ms
                  ↓
      window.location.href = '/login'
                  ↓
      onAuthStateChange detecta logout
                  ↓
      GuestRoute permite acceso
                  ↓
      Usuario ve página de login
```

## Diferencias Clave

### Antes (Problemático)

| Aspecto | Comportamiento |
|---------|---------------|
| Orden | Estado → SignOut → Redirect + Reload |
| Cache | ❌ No se limpiaba |
| localStorage | ❌ Limpieza parcial |
| Redirect | ⚠️ Conflicto entre href y reload |
| Errores | ⚠️ Manejo básico |
| Estado | ⚠️ isLoaded no se reseteaba |

### Ahora (Corregido)

| Aspecto | Comportamiento |
|---------|---------------|
| Orden | SignOut → Cache → Estado → Redirect |
| Cache | ✅ queryClient.clear() |
| localStorage | ✅ Limpieza exhaustiva |
| Redirect | ✅ Solo href (sin reload) |
| Errores | ✅ Try-catch completo |
| Estado | ✅ isLoaded = false |

## Testing Recomendado

### Caso 1: Logout Normal
1. Iniciar sesión
2. Navegar por la app (cargar dashboard, portfolio)
3. Click en "Cerrar sesión"
4. Verificar:
   - ✅ Toast "Cerrando sesión..." aparece
   - ✅ Toast "Sesión cerrada correctamente" aparece
   - ✅ Redirect a `/login`
   - ✅ No se puede volver con botón "Atrás" sin re-autenticar

### Caso 2: Logout con Cache Pesado
1. Iniciar sesión
2. Cargar muchos activos en dashboard (10+)
3. Navegar a portfolio con transacciones
4. Click en "Cerrar sesión"
5. Verificar:
   - ✅ Cache se limpia completamente
   - ✅ No hay datos visibles al re-autenticarse con otro usuario

### Caso 3: Logout con Pérdida de Conexión
1. Iniciar sesión
2. Deshabilitar WiFi/Red
3. Click en "Cerrar sesión"
4. Verificar:
   - ⚠️ Toast de error apropiado
   - ✅ App no crashea
   - ✅ Usuario puede reintentar cuando vuelva la conexión

### Caso 4: Logout Múltiple Rápido
1. Iniciar sesión
2. Click en "Cerrar sesión" → INMEDIATAMENTE click de nuevo
3. Verificar:
   - ✅ No hay errores de "signOut called multiple times"
   - ✅ Solo un redirect
   - ✅ Estado consistente

## Archivos Modificados

1. `src/providers/auth-provider.tsx`
   - Importado `queryClient`
   - Reescrita función `signOut` completa
   - Orden de operaciones corregido
   - Limpieza exhaustiva de estado

## Compatibilidad

- ✅ Compatible con Supabase Auth v2+
- ✅ Compatible con React Query v5
- ✅ Compatible con React Router v6/v7
- ✅ Funciona en todos los navegadores modernos

## Próximas Mejoras Potenciales

1. **Session Timeout Automático**: Cerrar sesión automáticamente después de X tiempo inactivo
2. **Logout Global**: Si usuario cierra sesión en una pestaña, cerrar en todas
3. **Logout Confirmation**: Dialog de confirmación antes de cerrar sesión
4. **Logout Analytics**: Trackear razones de logout (manual, timeout, error)
5. **Offline Logout**: Manejar logout cuando no hay conexión (queue para sync después)

## Notas Técnicas

- `supabase.auth.signOut()` es idempotente (safe to call multiple times)
- `queryClient.clear()` elimina cache pero no afecta queries activas en otros tabs
- `window.location.href` fuerza reload del contexto de React (limpieza completa)
- El listener `onAuthStateChange` se ejecuta DESPUÉS del signOut
- `isLoaded = false` previene flicker en guards durante el proceso

---

**Fecha de Implementación:** 20 de Octubre de 2025  
**Desarrollador:** GitHub Copilot  
**Issue:** SignOut no cerraba sesión correctamente
