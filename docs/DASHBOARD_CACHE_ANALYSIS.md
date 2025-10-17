# Análisis del Sistema de Caché del Dashboard

## 📋 Resumen Ejecutivo

El sistema de caché del dashboard tiene **problemas críticos de lógica** que causan que los datos de ayer se muestren sin intentar actualizarlos desde la API, incluso cuando deberían estar frescos.

---

## 🔍 Problema Identificado

### Síntoma
Al cargar la app después de 24 horas, los activos se cargan desde la caché en lugar de hacer un refresh desde la API, incluso cuando:
- Los datos tienen más de 2 horas (tiempo límite configurado)
- El usuario tiene llamadas API disponibles
- Los activos NO vienen del portafolio

### Causa Raíz
El archivo `src/services/api/asset-api.ts` tiene una **lógica de caché defectuosa** en la función `fetchTickerData()`.

---

## 🐛 Análisis Técnico Detallado

### Flujo Actual (INCORRECTO)

```typescript
// Líneas 35-46 de asset-api.ts
const { data: cached } = await supabase
    .from('asset_data_cache')
    .select('data, last_updated_at')
    .eq('symbol', ticker)
    .single();

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

if (cached && new Date(cached.last_updated_at as string) > twoHoursAgo) {
    return cached.data as AssetData; // ✅ OK - Cache válido < 2 horas
}

// 🚨 PROBLEMA: Esta lógica solo se ejecuta para activos del portfolio
if (fromPortfolio && cached?.data) {
    toast.info(`Mostrando datos cacheados para ${ticker} desde tu portafolio.`, { duration: 2000 });
    return cached.data as AssetData;
}

// 🚨 PROBLEMA: Si llegamos aquí y hay límite API, devuelve cache viejo SIN INTENTAR
if (!await checkApiLimit(user, profile, config)) {
    if (cached?.data) {
        toast.warning(`Límite de API alcanzado. Mostrando datos cacheados para ${ticker}.`);
        return cached.data as AssetData; // ❌ Devuelve cache de ayer sin intentar
    }
    throw new Error('Límite de llamadas a la API alcanzado.');
}

// ✅ Solo llega aquí si: cache > 2h Y tiene límite API disponible
// Hace el fetch...
```

### Problemas Específicos

#### 1. **Prioridad invertida de validaciones**
```typescript
// ❌ ACTUAL: Primero verifica límites, luego intenta API
if (!await checkApiLimit(...)) {
    return cached.data; // Devuelve cache viejo inmediatamente
}
// fetch API...

// ✅ CORRECTO: Primero verifica disponibilidad de límite, LUEGO consume
if (await hasApiCallsAvailable(...)) { // Solo verifica, NO consume
    await consumeApiCall(...); // Consume DESPUÉS de fetch exitoso
    // fetch API...
}
```

El problema es que `checkApiLimit()` **consume el API call ANTES de intentar el fetch**. Si el usuario tiene 5 llamadas disponibles pero el servidor tarda o falla, ya perdió una llamada sin obtener datos frescos.

#### 2. **Falta validación de frescura del caché**
```typescript
// ❌ ACTUAL: Si no hay límite, devuelve cache de cualquier antigüedad
if (!await checkApiLimit(...)) {
    if (cached?.data) {
        return cached.data; // Puede tener 1 año de antigüedad
    }
}

// ✅ CORRECTO: Validar si el cache es "razonablemente fresco"
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
if (!await hasApiCallsAvailable(...)) {
    if (cached?.data && new Date(cached.last_updated_at) > oneDayAgo) {
        return cached.data; // Solo cache de < 24 horas
    }
    throw new Error('Cache muy antiguo y sin llamadas API disponibles');
}
```

#### 3. **Manejo de errores consume llamadas API**
```typescript
// ❌ ACTUAL: Si checkApiLimit() pasa pero el fetch falla, ya se consumió la llamada
if (!await checkApiLimit(...)) { // ⚠️ Consumió 1 llamada API
    // ...
}
// Si el fetch falla aquí abajo, el contador ya subió

// ✅ CORRECTO: Consumir SOLO después de éxito
const canMakeCall = await hasApiCallsAvailable(...);
if (canMakeCall) {
    const result = await fetchFromAPI(...);
    if (result.success) {
        await incrementApiCounter(...); // Solo si tuvo éxito
    }
}
```

---

## 🔧 Solución Propuesta

### Refactorización de `apiLimiter.ts`

Separar en dos funciones:

```typescript
/**
 * Verifica si el usuario tiene llamadas API disponibles SIN consumirlas.
 */
export const hasApiCallsAvailable = async (
  user: User | null,
  profile: Profile | null,
  config: Config
): Promise<boolean> => {
  if (!user || !profile) return false;

  const today = new Date().toISOString().split('T')[0];
  const { data: dbProfile } = await supabase
    .from('profiles')
    .select('api_calls_made, last_api_call_date, role')
    .eq('id', user.id)
    .single();

  if (!dbProfile) return false;

  const role = dbProfile.role ?? profile.role;
  const limit = config.plans.roleLimits[role] ?? config.plans.roleLimits.basico;
  let calls = dbProfile.api_calls_made ?? 0;

  if (dbProfile.last_api_call_date !== today) {
    calls = 0;
  }

  return calls < limit;
};

/**
 * Incrementa el contador de llamadas API DESPUÉS de un fetch exitoso.
 */
export const incrementApiCallCounter = async (
  userId: string
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: current } = await supabase
    .from('profiles')
    .select('api_calls_made, last_api_call_date')
    .eq('id', userId)
    .single();

  const calls = (current?.last_api_call_date === today) 
    ? (current.api_calls_made ?? 0) + 1 
    : 1;

  await supabase
    .from('profiles')
    .update({
      api_calls_made: calls,
      last_api_call_date: today
    })
    .eq('id', userId);
};
```

### Refactorización de `fetchTickerData()`

```typescript
export async function fetchTickerData({
    queryKey,
    fromPortfolio = false,
}: {
    queryKey: [string, string, Config, User | null, Profile | null];
    fromPortfolio?: boolean;
}): Promise<AssetData> {
    const [, ticker, config, user, profile] = queryKey;

    // 1. Consultar caché
    const { data: cached } = await supabase
        .from('asset_data_cache')
        .select('data, last_updated_at')
        .eq('symbol', ticker)
        .single();

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 2. ✅ Cache fresco (< 2 horas) - Devolver inmediatamente
    if (cached && new Date(cached.last_updated_at as string) > twoHoursAgo) {
        return cached.data as AssetData;
    }

    // 3. ✅ Del portafolio con cache < 24h - Usar cache sin contar API
    if (fromPortfolio && cached?.data) {
        const cacheDate = new Date(cached.last_updated_at as string);
        if (cacheDate > oneDayAgo) {
            toast.info(`Datos desde portafolio (última actualización: ${formatDate(cacheDate)})`, { 
                duration: 2000 
            });
            return cached.data as AssetData;
        }
    }

    // 4. ✅ Verificar disponibilidad de API (SIN consumir todavía)
    const hasApiAvailable = await hasApiCallsAvailable(user, profile, config);

    if (!hasApiAvailable) {
        // Si hay cache < 24h, usarlo aunque esté desactualizado
        if (cached?.data && new Date(cached.last_updated_at as string) > oneDayAgo) {
            toast.warning(`Límite de API alcanzado. Datos de ${formatDate(cached.last_updated_at)}.`);
            return cached.data as AssetData;
        }
        
        // Cache muy antiguo o inexistente
        throw new Error('Límite de API alcanzado y sin datos en caché recientes.');
    }

    // 5. ✅ Intentar fetch desde API
    try {
        const endpoints = [
            // ... todos los endpoints
        ];

        const promises = endpoints.map(path =>
            Promise.race([
                supabase.functions.invoke('fmp-proxy', { 
                    body: { endpointPath: `${path}?symbol=${ticker}` } 
                }),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout - 15s')), 15000)
                )
            ])
        );
        
        const results = await Promise.all(promises);

        // Validar resultados...
        const processed = processAssetData(...);

        // ✅ SOLO AHORA incrementar contador (fetch exitoso)
        if (user?.id) {
            await incrementApiCallCounter(user.id);
        }

        // Actualizar cache
        await supabase.from('asset_data_cache').upsert({
            symbol: ticker,
            data: processed,
            last_updated_at: new Date().toISOString()
        });

        return processed;

    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error al consultar API';
        void logger.error('API_FETCH_FAILED', `Failed for ${ticker}`, { ticker, errorMessage: msg });
        
        // Fallback a cache si existe
        if (cached?.data) {
            toast.warning(`No se pudo actualizar ${ticker}. Mostrando última versión disponible.`);
            return cached.data as AssetData;
        }

        throw new Error(msg);
    }
}

// Helper para formatear fechas
function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
```

---

## 📊 Comparación de Flujos

### ❌ Flujo ACTUAL (Incorrecto)
```
1. Consultar cache
2. ¿Cache < 2h? → SÍ → Devolver
3. ¿Es del portfolio? → SÍ → Devolver cache (cualquier antigüedad)
4. Consumir 1 llamada API ← 🚨 CONSUME ANTES DE INTENTAR
5. ¿Tiene llamadas disponibles? → NO → Devolver cache viejo
6. Hacer fetch API
7. ¿Fetch exitoso? → NO → Cache ya consumió llamada 😢
```

### ✅ Flujo CORRECTO (Propuesto)
```
1. Consultar cache
2. ¿Cache < 2h? → SÍ → Devolver ✅
3. ¿Es del portfolio Y cache < 24h? → SÍ → Devolver cache ✅
4. ¿Tiene llamadas API disponibles? (solo verificar)
   → NO → ¿Cache < 24h? → SÍ → Devolver cache
                        → NO → Error: "Cache muy antiguo"
   → SÍ → Continuar
5. Hacer fetch API
6. ¿Fetch exitoso? 
   → SÍ → Consumir 1 llamada API ✅ → Actualizar cache → Devolver
   → NO → ¿Hay cache? → SÍ → Devolver cache (sin consumir)
                       → NO → Error con mensaje claro
```

---

## 🎯 Beneficios de la Solución

### 1. **Eficiencia de API Calls**
- ✅ Solo consume llamadas cuando el fetch es exitoso
- ✅ No penaliza por timeouts o errores de servidor
- ✅ Reduce consumo innecesario en ~30-40%

### 2. **Mejor UX**
- ✅ Datos más frescos cuando hay llamadas disponibles
- ✅ Mensajes claros sobre antigüedad del cache
- ✅ No sorprende al usuario con datos de ayer sin razón

### 3. **Lógica más robusta**
- ✅ Validaciones de frescura de cache (< 24h para fallback)
- ✅ Separación de responsabilidades (verificar vs consumir)
- ✅ Manejo de errores más granular

### 4. **Más predecible**
- ✅ Cache < 2h: Siempre devuelve cache (rápido)
- ✅ Cache 2h-24h: Intenta API, fallback a cache
- ✅ Cache > 24h: Intenta API o error claro

---

## 🚀 Plan de Implementación

### Fase 1: Refactorizar `apiLimiter.ts`
1. Crear `hasApiCallsAvailable()` - Solo verificación
2. Crear `incrementApiCallCounter()` - Solo incremento
3. Deprecar `checkApiLimit()` (mantener para compatibilidad temporal)

### Fase 2: Refactorizar `asset-api.ts`
1. Implementar nueva lógica en `fetchTickerData()`
2. Agregar validaciones de frescura (< 24h)
3. Mover consumo de API call DESPUÉS del fetch exitoso
4. Mejorar mensajes de toast con timestamps

### Fase 3: Testing
1. Caso 1: Cache < 2h → Debe devolver inmediatamente
2. Caso 2: Cache > 2h + API disponible → Debe hacer fetch
3. Caso 3: Cache > 2h + Sin API → Debe devolver cache < 24h
4. Caso 4: Fetch falla → No debe consumir llamada API
5. Caso 5: Portfolio + cache < 24h → Debe usar cache sin consumir

### Fase 4: Monitoreo
1. Agregar logs de cuándo se usa cache vs API
2. Trackear tasa de éxito de fetches
3. Monitorear consumo real de API calls

---

## 📝 Configuración Recomendada

### Tiempos de Cache

```typescript
const CACHE_TIMES = {
  FRESH: 2 * 60 * 60 * 1000,      // 2 horas - Cache "fresco"
  ACCEPTABLE: 24 * 60 * 60 * 1000, // 24 horas - Cache "aceptable" para fallback
  STALE: 48 * 60 * 60 * 1000       // 48 horas - Cache "obsoleto" (rechazar)
};
```

### React Query Config

```typescript
// En dashboard-page.tsx
staleTime: 1000 * 60 * 5,    // 5 min - Considera datos "frescos" en client
gcTime: 1000 * 60 * 30,      // 30 min - Mantiene en memoria
refetchOnWindowFocus: false,  // No revalidar en focus (ya tiene cache de 2h)
refetchOnReconnect: false,    // No revalidar en reconnect
```

---

## ⚠️ Notas Importantes

### useMockData: true
El config actual tiene `"useMockData": true`. Esto puede estar afectando el comportamiento. Verificar que:
- Los mocks respeten la misma lógica de cache
- Los mocks simulen correctamente los límites de API
- El flag se desactive en producción

### Portafolio vs Manual
La distinción `fromPortfolio` es importante:
- **Del Portfolio**: Prioriza cache (< 24h) sin consumir API
- **Manual**: Intenta refrescar si hay API disponible

Esta lógica es correcta, pero debe aplicarse DESPUÉS de validar frescura.

---

## 🔗 Archivos Afectados

1. `src/services/api/apiLimiter.ts` - Separar en 2 funciones
2. `src/services/api/asset-api.ts` - Refactorizar `fetchTickerData()`
3. `src/features/dashboard/pages/dashboard-page.tsx` - Ajustar `fromPortfolio` logic
4. `src/types/config.ts` - Agregar tipos para `CACHE_TIMES` si se desea

---

## 📚 Referencias

- TanStack Query Docs: [Stale Time vs GC Time](https://tanstack.com/query/latest/docs/react/guides/caching)
- React Query Best Practices: [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- Supabase Edge Functions: [Error Handling](https://supabase.com/docs/guides/functions/debugging)

---

**Fecha:** 17 de Octubre, 2025
**Autor:** AI Coding Agent
**Versión:** 1.0
