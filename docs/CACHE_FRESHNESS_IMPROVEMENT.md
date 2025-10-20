# Mejora del Sistema de Frescura de Datos del Dashboard

## Problema Detectado

El usuario reportó que el dashboard mostraba datos del **19/10 a las 20:10** cuando la hora actual era **20/10 a las 12:43** (~16.5 horas de antigüedad).

### Causa Raíz

El sistema tenía una lógica de caché compleja con múltiples umbrales (2h, 24h) que no era clara y no forzaba actualizaciones después de 1 hora.

## Solución Implementada

### Lógica Simplificada y Directa

**Nueva regla simple:**
- **Cache < 1 hora**: Usar cache inmediatamente (SIN llamar a la API) ✅
- **Cache > 1 hora**: SIEMPRE intentar actualizar desde la API 🔄
  - Si API disponible → Fetch y actualiza
  - Si API no disponible o falla → Fallback al cache antiguo con warning

Esta lógica es más predecible y garantiza que los datos nunca tengan más de 1 hora sin al menos **intentar** actualizarse.

## Solución Implementada

### 1. Lógica de Cache Simplificada (< 1h = fresco, > 1h = actualizar)

**Archivo:** `src/services/api/asset-api.ts`

**Cambios:**
- ❌ Antes: Lógica compleja con umbrales de 2h y 24h, condiciones especiales para portfolio
- ✅ Ahora: Lógica simple y directa

```typescript
// LÓGICA SIMPLIFICADA:
// 1. Cache < 1h → Devolver inmediatamente (SIN API call)
if (cached && new Date(cached.last_updated_at) > oneHourAgo) {
    return cached.data;
}

// 2. Cache > 1h → SIEMPRE intentar actualizar desde API
const hasApiAvailable = await hasApiCallsAvailable(user, profile, config);

if (!hasApiAvailable) {
    // Sin API → Fallback a cache con warning
    if (cached?.data) {
        toast.warning(`Límite de API alcanzado. Usando datos de hace ${hoursOld}h.`);
        return cached.data;
    }
    throw new Error('Sin API y sin cache');
}

// Con API → Fetch datos frescos
try {
    const freshData = await fetchFromAPI();
    await updateCache(freshData);
    return freshData;
} catch (error) {
    // Fetch falló → Fallback a cache con warning
    if (cached?.data) {
        toast.warning(`No se pudo actualizar. Usando datos de hace ${hoursOld}h.`);
        return cached.data;
    }
    throw error;
}
```

**Impacto:**
- ✅ Lógica más simple y predecible
- ✅ Siempre intenta actualizar datos > 1h
- ✅ Fallback automático al cache si falla
- ✅ Mensajes claros sobre la antigüedad de los datos

### 2. Indicador Visual de Frescura de Datos

**Archivo:** `src/components/ui/data-freshness-indicator.tsx`

**Características:**
- Componente reutilizable para mostrar antigüedad de datos
- Sistema de colores intuitivo:
  - 🟢 **Verde** (< 1 hora): Datos muy frescos
  - 🟡 **Amarillo** (1-12 horas): Datos relativamente frescos
  - 🟠 **Naranja** (12-24 horas): Datos desactualizados
  - 🔴 **Rojo** (> 24 horas): Datos muy antiguos
- Tooltip con información detallada (fecha y hora exacta)
- Soporte para click para actualizar datos
- Animación de "loading" durante actualización

**Props del Componente:**
```typescript
interface DataFreshnessIndicatorProps {
  lastUpdated: Date | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}
```

### 3. Hook de Frescura del Cache

**Archivo:** `src/features/dashboard/hooks/use-cache-freshness.ts`

**Funcionalidad:**
- Hook personalizado para consultar fechas de actualización desde `asset_data_cache`
- Retorna la fecha más antigua y más reciente de los activos cargados
- Se actualiza automáticamente cada 30 segundos
- Integrado con React Query para cache eficiente

```typescript
export function useCacheFreshness(symbols: string[]): CacheFreshnessResult {
  // ...implementación
}
```

### 4. Integración en el Dashboard

**Archivo:** `src/features/dashboard/pages/dashboard-page.tsx`

**Nuevas Funcionalidades:**

#### a) Indicador de Frescura
- Muestra la antigüedad de los datos más antiguos cargados
- Visible en la parte superior del dashboard
- Click en el indicador actualiza los datos

#### b) Botón de Actualización Manual
- Botón "Actualizar datos" siempre visible
- Invalida el cache de React Query forzando refetch
- Animación de "loading" durante la actualización
- Responsive (texto completo en desktop, abreviado en mobile)

```tsx
<div className="flex items-center gap-3">
  {oldestUpdate && !isFreshnessLoading && (
    <DataFreshnessIndicator 
      lastUpdated={oldestUpdate}
      label="Datos"
      size="md"
      onRefresh={handleRefresh}
      isRefreshing={isLoading}
    />
  )}
</div>

<Button
  onClick={handleRefresh}
  disabled={isLoading}
  variant="outline"
  size="sm"
  className="gap-2"
>
  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
  Actualizar datos
</Button>
```

## Flujo de Actualización Simplificado

```
Usuario carga dashboard
          ↓
Para cada activo, verificar cache:
          ↓
    ┌─────────────────┐
    │ Cache < 1 hora? │
    └────────┬────────┘
             │
     ┌───────┴───────┐
     │ SÍ            │ NO
     │               │
     ↓               ↓
Usar cache    Intentar API
(sin API)           │
                    ↓
            ┌───────────────┐
            │ API disponible?│
            └───────┬────────┘
                    │
            ┌───────┴───────┐
            │ SÍ            │ NO
            │               │
            ↓               ↓
      Fetch API      Cache fallback
      Actualizar      + Warning toast
      cache               │
            │               │
            └───────┬───────┘
                    ↓
          Mostrar datos en UI
          con indicador de frescura
```

**Casos de Uso:**

1. **Cache fresco (< 1h)**: 
   - ✅ Respuesta inmediata
   - ✅ No consume API calls
   - ✅ Indicador verde

2. **Cache antiguo + API disponible**:
   - 🔄 Intenta actualizar
   - ✅ Si éxito: Datos frescos + indicador verde
   - ⚠️ Si falla: Cache antiguo + warning + indicador amarillo/naranja

3. **Cache antiguo + Sin API**:
   - ⚠️ Usa cache antiguo
   - ⚠️ Warning toast claro
   - 🔴 Indicador rojo/naranja según antigüedad

## Mejoras de UX

### Antes
- ❌ Usuario no sabía si los datos eran antiguos
- ❌ No había forma clara de actualizar manualmente
- ❌ Cache de 2h causaba datos muy desactualizados en mercados activos

### Después
- ✅ Indicador visual claro de antigüedad de datos
- ✅ Botón de actualización manual siempre visible
- ✅ Cache de 1h mantiene datos más frescos
- ✅ Tooltips informativos con fechas exactas
- ✅ Animaciones de loading durante actualización
- ✅ Sistema de colores intuitivo (semáforo)

## Compatibilidad

- ✅ Funciona con datos del portafolio (no consume API calls)
- ✅ Respeta límites de API por plan
- ✅ Fallback a cache si API no disponible
- ✅ Toast notifications para feedback inmediato
- ✅ Responsive design (mobile + desktop)

## Archivos Modificados

1. `src/services/api/asset-api.ts` - Reducción de umbral de cache
2. `src/components/ui/data-freshness-indicator.tsx` - Nuevo componente
3. `src/features/dashboard/hooks/use-cache-freshness.ts` - Nuevo hook
4. `src/features/dashboard/pages/dashboard-page.tsx` - Integración UI

## Testing Recomendado

1. **Caso 1:** Cargar dashboard con datos < 1h
   - Esperado: Indicador verde, datos se cargan del cache
   
2. **Caso 2:** Cargar dashboard con datos > 1h < 12h
   - Esperado: Indicador amarillo, intenta actualizar desde API
   
3. **Caso 3:** Cargar dashboard con datos > 12h
   - Esperado: Indicador rojo/naranja, fuerza actualización
   
4. **Caso 4:** Click en botón "Actualizar"
   - Esperado: Animación de loading, actualización de datos, indicador se vuelve verde
   
5. **Caso 5:** Actualizar sin API calls disponibles
   - Esperado: Warning toast, datos antiguos se mantienen, indicador muestra antigüedad

## Próximas Mejoras Potenciales

1. **Auto-refresh programado:** Actualizar automáticamente cada X minutos si el usuario está activo
2. **Notificación de datos obsoletos:** Alert banner si datos > 24h
3. **Indicador por activo individual:** Mostrar frescura de cada ticker en la lista
4. **Preferencias de usuario:** Permitir configurar frecuencia de actualización
5. **Modo "Live":** Actualización en tiempo real para usuarios premium

## Notas Técnicas

- El hook `useCacheFreshness` consulta Supabase directamente (no usa el procesador de assets)
- React Query deduplica requests automáticamente (múltiples componentes usando el mismo hook)
- El indicador usa `Tooltip` de shadcn/ui para información detallada
- Los colores respetan el modo claro/oscuro del tema

---

**Fecha de Implementación:** 20 de Octubre de 2025  
**Desarrollador:** GitHub Copilot  
**Issue:** Dashboard mostrando datos de hace 16+ horas sin indicación clara
