# 🔍 Auditoría de Límites de Planes - Análisis Completo

**Fecha**: 15 de octubre, 2025  
**Estado**: 🔴 **REQUIERE CORRECCIONES**  
**Prioridad**: 🟡 **ALTA** - Claridad y congruencia del negocio

---

## 📋 Resumen Ejecutivo

Se identificaron **inconsistencias importantes** en cómo se describen y aplican los límites de planes. La terminología en la página `/plans` es confusa y no refleja exactamente lo que está implementado.

---

## 🎯 Problemas Identificados

### 1. **"Activos para Analizar" es ENGAÑOSO** 🔴

#### Lo que dice la página de planes:
```
Básico: 5 activos para analizar
Plus: 25 activos para analizar
Premium: 50 activos para analizar
```

#### Lo que realmente significa:
- **NO** es un límite de qué activos puedes ver/analizar
- **SÍ** es un límite de cuántos activos puedes agregar al **Dashboard de Comparación**
- Los usuarios Básico pueden analizar CUALQUIER símbolo popular (de los ~90 en `freeTierSymbols`)
- Los usuarios Plus/Premium pueden analizar CUALQUIER símbolo de +8,000

#### Problema:
El texto **"activos para analizar"** suena como si fuera un límite total de acceso, cuando en realidad es:
- Para Básico: Límite de **símbolos disponibles** (~90) + límite de **comparación simultánea** (3)
- Para Plus/Premium: Sin límite de símbolos + límite de **comparación simultánea** (5/10)

#### Corrección sugerida:
```
❌ "5 activos para analizar"
✅ "Watchlist de hasta 5 activos" o "Dashboard comparativo de hasta 3 activos"
```

---

### 2. **Sistema de Watchlist NO EXISTE** 🔴

#### Lo que debería ser (según config.json):
```json
"roleLimits": {
  "basico": 5,
  "plus": 25,
  "premium": 50
}
```

Estos valores de `roleLimits` **deberían** referirse a una **Watchlist** (lista de seguimiento), pero:

#### Estado actual:
- ❌ **NO hay sistema de watchlist implementado**
- ❌ **NO hay tabla `watchlist` en la base de datos**
- ❌ **NO hay componente de watchlist**
- ❌ Los valores de `roleLimits` se usan en documentación pero no en código

#### Lo que SÍ está implementado:
- ✅ **Dashboard de comparación**: Límites de 3/5/10 activos (`maxTickersToCompare`)
- ✅ **Símbolos disponibles**: Plan Básico limitado a ~90 símbolos (`freeTierSymbols`)

#### Impacto:
La página de planes promete "25 activos para analizar" (Plus) pero:
1. En realidad puedes analizar **todos** los activos disponibles
2. Solo puedes **comparar** hasta 5 simultáneamente
3. No hay límite de cuántos activos puedes ver en total

---

### 3. **Portfolios Múltiples NO ESTÁN IMPLEMENTADOS** 🔴

#### Lo que promete la página:
```
Básico: 1 portafolio
Plus: Hasta 5 portafolios
Premium: Hasta 10 portafolios
```

#### Estado actual:
- ❌ **Solo existe 1 portfolio por usuario**
- ❌ **NO hay sistema de selección de portfolios**
- ❌ **NO hay tabla separada de portfolios**
- ❌ **NO hay UI para crear/cambiar entre portfolios**

#### Implementación actual:
```typescript
// src/providers/portfolio-provider.tsx
// Las transacciones se guardan con user_id
// No hay campo "portfolio_id"
// Todo se calcula como un solo portfolio

const transResult = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)  // ← No hay filtro por portfolio_id
```

#### Impacto:
Los valores en `config.plans.portfolioLimits` (1/5/10) **no se usan en ninguna parte del código**.

---

## 📊 Estado de Implementación - Tabla Resumen

| Límite | Valor Config | Estado | Dónde se usa | Funciona Correctamente |
|--------|--------------|--------|--------------|------------------------|
| **maxTickersToCompare** | 3/5/10 | ✅ **IMPLEMENTADO** | `dashboard-provider.tsx` | ✅ SÍ |
| **freeTierSymbols** | ~90 símbolos | ✅ **IMPLEMENTADO** | `dashboard-provider.tsx` | ✅ SÍ |
| **roleLimits** | 5/25/50 | ❌ **NO USADO** | Solo en docs/planes | ❌ NO |
| **portfolioLimits** | 1/5/10 | ❌ **NO IMPLEMENTADO** | Solo en página planes | ❌ NO |

---

## 🔧 Opciones de Corrección

### **Opción 1: Clarificar la Página de Planes** (Rápido - 30 min)
**Recomendado a corto plazo**

Cambiar el texto para reflejar lo que **realmente está implementado**:

```diff
- ${config.plans.roleLimits.basico} activos para analizar
+ Acceso a ${config.plans.freeTierSymbols.length} símbolos populares

- Comparar hasta ${config.dashboard.maxTickersToCompare.basico} activos
+ Dashboard comparativo de hasta ${config.dashboard.maxTickersToCompare.basico} activos
```

**Cambios específicos**:

#### Para Plan Básico:
```diff
- '5 activos para analizar'
+ '~90 símbolos populares disponibles'
+ 'Dashboard comparativo de hasta 3 activos'
- '1 portafolio'
+ 'Portfolio de inversiones'
```

#### Para Plan Plus:
```diff
- '25 activos para analizar'
+ 'Todos los símbolos disponibles (+8,000)'
+ 'Dashboard comparativo de hasta 5 activos'
- 'Hasta 5 portafolios'
+ 'Portfolio de inversiones'
```

#### Para Plan Premium:
```diff
- '50 activos para analizar'
+ 'Todos los símbolos disponibles (+8,000)'
+ 'Dashboard comparativo de hasta 10 activos'
- 'Hasta 10 portafolios'
+ 'Portfolio de inversiones'
```

**Pros**:
- ✅ Rápido de implementar
- ✅ Elimina promesas falsas
- ✅ Clarifica el valor real

**Contras**:
- ❌ Pierde diferenciación entre planes (todos tienen "portfolio" singular)
- ❌ No aprovecha los valores de `roleLimits`

---

### **Opción 2: Implementar Sistema de Watchlist** (Medio - 4-6 horas)
**Recomendado a medio plazo**

Crear un sistema de **Watchlist** (favoritos) separado del dashboard de comparación:

#### Estructura:
```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, symbol)
);
```

#### Componentes a crear:
1. **WatchlistProvider** - Gestión de estado
2. **WatchlistPage** - Vista de lista de seguimiento
3. **WatchlistCard** - Card individual por activo
4. **AddToWatchlistButton** - Botón en asset-detail

#### Lógica:
```typescript
// Hook: usePlanLimits('watchlist', watchlistCount)
// Límites: 5 (básico), 25 (plus), 50 (premium)

const { isAtLimit } = usePlanLimits('watchlist', watchlist.length);
if (isAtLimit) {
  toast.error('Límite de watchlist alcanzado');
  return;
}
```

#### Uso de `roleLimits`:
```typescript
// Ahora sí se usaría config.plans.roleLimits
const limit = config.plans.roleLimits[userRole]; // 5, 25, 50
```

**Pros**:
- ✅ Diferenciación clara entre planes
- ✅ Funcionalidad útil para usuarios
- ✅ Usa los valores de `roleLimits` correctamente
- ✅ Aumenta el valor percibido de Plus/Premium

**Contras**:
- ❌ Requiere desarrollo adicional (4-6 horas)
- ❌ Necesita tabla nueva en DB
- ❌ Más complejidad en la app

---

### **Opción 3: Implementar Portfolios Múltiples** (Complejo - 12-16 horas)
**Recomendado a largo plazo (si hay demanda)**

Sistema completo de portfolios múltiples:

#### Cambios en Base de Datos:
```sql
-- Nueva tabla: portfolios
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  is_default BOOLEAN DEFAULT FALSE
);

-- Modificar tabla transactions
ALTER TABLE transactions 
ADD COLUMN portfolio_id UUID REFERENCES portfolios(id);

-- Índices
CREATE INDEX idx_portfolios_user ON portfolios(user_id);
CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
```

#### Componentes a crear:
1. **PortfolioSelector** - Dropdown para cambiar entre portfolios
2. **CreatePortfolioModal** - Modal con validación de límites
3. **PortfolioSettingsModal** - Editar nombre/descripción
4. **PortfolioList** - Vista de todos los portfolios

#### Lógica de Validación:
```typescript
const { isAtLimit, limit } = usePlanLimits('portfolios', portfoliosCount);

// En CreatePortfolioModal
if (isAtLimit) {
  return (
    <UpgradeModal
      featureName="Crear Más Portfolios"
      requiredPlan={role === 'basico' ? 'plus' : 'premium'}
      description={`Has alcanzado el límite de ${limit} portfolio(s). Actualiza tu plan para crear hasta ${nextLimit}.`}
    />
  );
}
```

#### Migración de Datos:
```typescript
// Script de migración para usuarios existentes
async function migrateToPortfolios() {
  // 1. Crear portfolio default para cada usuario
  // 2. Asignar todas las transacciones existentes a ese portfolio
  // 3. Marcar como is_default = true
}
```

**Pros**:
- ✅ Funcionalidad profesional
- ✅ Gran diferenciador entre planes
- ✅ Usa `portfolioLimits` correctamente
- ✅ Permite casos de uso avanzados (ej: portfolio personal, portfolio empresa, portfolio especulativo)

**Contras**:
- ❌ Desarrollo extenso (12-16 horas)
- ❌ Migración de datos existentes
- ❌ Cambios en múltiples componentes
- ❌ Testing complejo
- ❌ Riesgo de bugs si no se hace bien

---

## 🎯 Recomendaciones Priorizadas

### **Fase 1: Corrección Inmediata** (HOY - 30 min)
✅ **Actualizar página de planes** para reflejar la realidad

**Acción**:
1. Cambiar "X activos para analizar" → "Dashboard comparativo de hasta X activos"
2. Cambiar "Hasta X portfolios" → "Portfolio de inversiones" (singular para todos)
3. Agregar clarificación sobre símbolos disponibles

**Resultado**: Página de planes honesta y clara

---

### **Fase 2: Implementar Watchlist** (ESTA SEMANA - 4-6 horas)
✅ **Crear sistema de favoritos/watchlist**

**Acción**:
1. Crear tabla `watchlist` en Supabase
2. Crear `WatchlistProvider` y hooks
3. Crear página `/watchlist`
4. Agregar botón "Agregar a Watchlist" en asset-detail
5. Aplicar límites: 5/25/50 según plan

**Resultado**: Uso real de `roleLimits`, diferenciación entre planes

---

### **Fase 3: Evaluar Portfolios Múltiples** (FUTURO - si hay demanda)
⚠️ **Solo si usuarios lo piden explícitamente**

**Acción**:
1. Encuestar a usuarios actuales
2. Analizar si realmente necesitan múltiples portfolios
3. Si hay demanda (>30% de usuarios), planificar desarrollo
4. Implementar con migración cuidadosa

**Resultado**: Funcionalidad profesional solo si aporta valor real

---

## 📝 Cambios Específicos para Fase 1

### En `plans-page.tsx`:

```typescript
// ANTES:
features: [
  `${config.plans.roleLimits.basico} activos para analizar`,
  `${config.plans.portfolioLimits.basico} portafolio`,
  `Comparar hasta ${config.dashboard.maxTickersToCompare.basico} activos`,
  // ...
]

// DESPUÉS:
features: [
  `Acceso a ~90 símbolos populares`,
  `Dashboard comparativo (hasta ${config.dashboard.maxTickersToCompare.basico} activos)`,
  `Portfolio de inversiones`,
  // ...
]
```

Para Plus/Premium:
```typescript
features: [
  `Acceso a todos los símbolos (+8,000)`,
  `Dashboard comparativo (hasta ${config.dashboard.maxTickersToCompare.plus} activos)`,
  `Portfolio de inversiones`,
  // ...
]
```

---

## 🧪 Testing Requerido

### Después de Fase 1 (Corrección de Texto):
- [ ] Verificar que página de planes sea clara
- [ ] Confirmar que no promete funcionalidades no implementadas
- [ ] Asegurar que usuarios entiendan las diferencias reales

### Después de Fase 2 (Watchlist):
- [ ] Agregar activo a watchlist (Básico con 0 items) → ✅
- [ ] Agregar 6to activo a watchlist (Básico en límite) → ❌ Modal
- [ ] Agregar activo a watchlist (Plus con 24 items) → ✅
- [ ] Agregar 26to activo a watchlist (Plus en límite) → ❌ Modal
- [ ] Ver watchlist vacía → Mensaje amigable
- [ ] Eliminar activo de watchlist → ✅
- [ ] Watchlist persiste entre sesiones → ✅

---

## 💰 Impacto en el Negocio

### Situación Actual (Problemática):
- ❌ Promesas de "25 activos" confunden a usuarios
- ❌ Usuarios piensan que tienen límites que no existen
- ❌ Poca diferenciación real entre Básico y Plus (ambos acceden a todo)
- ❌ `roleLimits` definido pero no usado

### Después de Fase 1 (Clarificación):
- ✅ Descripción honesta de funcionalidades
- ✅ Usuarios entienden qué obtienen
- ⚠️ Pero poca diferenciación entre planes aún

### Después de Fase 2 (Watchlist):
- ✅ Diferenciación clara: 5 vs 25 vs 50 favoritos
- ✅ Funcionalidad útil y valiosa
- ✅ Incentivo real para actualizar a Plus
- ✅ Uso correcto de `roleLimits`

---

## ✅ Decisiones Pendientes

1. **¿Implementar Watchlist?** (Recomendado: SÍ)
   - Tiempo: 4-6 horas
   - Valor: ALTO
   - Riesgo: BAJO

2. **¿Implementar Portfolios Múltiples?** (Recomendado: EVALUAR DEMANDA)
   - Tiempo: 12-16 horas
   - Valor: MEDIO (depende del uso)
   - Riesgo: MEDIO-ALTO

3. **¿Cambiar valores de roleLimits?** (Recomendado: MANTENER para Watchlist)
   - Mantener 5/25/50 para watchlist futura
   - Son valores razonables y escalables

---

## 📈 Plan de Acción Recomendado

### Hoy (30 min):
1. ✅ Actualizar `plans-page.tsx` con texto corregido
2. ✅ Commit: "fix: clarify plan limits description"
3. ✅ Deploy

### Esta Semana (4-6 horas):
1. ⏳ Crear tabla `watchlist`
2. ⏳ Implementar WatchlistProvider
3. ⏳ Crear página `/watchlist`
4. ⏳ Agregar botón "Agregar a Watchlist"
5. ⏳ Aplicar límites 5/25/50
6. ⏳ Commit: "feat: implement watchlist system with plan limits"
7. ⏳ Testing manual
8. ⏳ Deploy

### Próximo Mes (Evaluar):
1. ⏳ Encuestar usuarios sobre portfolios múltiples
2. ⏳ Si hay demanda → planificar Fase 3
3. ⏳ Si no hay demanda → dejar como está

---

**Conclusión**: El sistema actual tiene inconsistencias entre lo que promete y lo que entrega. La solución más efectiva es:
1. **Corto plazo**: Clarificar página de planes (30 min)
2. **Medio plazo**: Implementar Watchlist (4-6 horas) 
3. **Largo plazo**: Evaluar portfolios múltiples según demanda

---

**Preparado por**: GitHub Copilot  
**Requiere decisión de**: Product Owner/Desarrollador
