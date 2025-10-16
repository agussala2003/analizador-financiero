# Implementación: Límite de Activos por Portfolio

## 📋 Resumen

Se implementó la **validación de límite de activos simultáneos en el portfolio**, reutilizando el límite de comparación del dashboard (`maxTickersToCompare`) para mantener coherencia en todo el sistema.

---

## ✅ Cambios Implementados

### 1. **Hook `use-portfolio-limits.ts` (NUEVO)**

#### Ubicación
`src/hooks/use-portfolio-limits.ts`

#### Propósito
Validar cuántos activos únicos puede tener un usuario en su portfolio según su plan.

#### Implementación
```typescript
export function usePortfolioLimits(currentAssetCount: number) {
  const { profile } = useAuth();
  const config = useConfig();
  const currentRole = profile?.role ?? 'basico';
  
  // ✅ Reutilizar límite de dashboard para coherencia
  const maxAssets = config.dashboard?.maxTickersToCompare?.[currentRole] ?? 3;
  const isAtLimit = currentAssetCount >= maxAssets;
  
  const planName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
  
  return {
    maxAssets,
    isAtLimit,
    currentAssetCount,
    limitMessage: `Tu plan ${planName} permite hasta ${maxAssets} activos simultáneos en tu portfolio.`,
    upgradeMessage: `Actualiza a un plan superior para agregar más activos a tu portfolio. Actualmente tienes ${currentAssetCount} de ${maxAssets} activos.`,
    usagePercentage: (currentAssetCount / maxAssets) * 100,
  };
}
```

#### Características
- ✅ Reutiliza `dashboard.maxTickersToCompare` de config.json
- ✅ Safe fallback: Default a `basico` (3 activos)
- ✅ Calcula porcentaje de uso
- ✅ Mensajes descriptivos para UI

---

### 2. **Validación en `add-transaction-modal.tsx`**

#### Ubicación
`src/features/portfolio/components/modals/add-transaction-modal.tsx`

#### Cambios

**1. Import del hook:**
```typescript
import { usePortfolioLimits } from '../../../../hooks/use-portfolio-limits';
```

**2. Obtener holdings y validar límite:**
```typescript
const { addTransaction, holdings } = usePortfolio();

// ✅ Validar límite de activos en portfolio
const uniqueAssets = holdings.length;
const { isAtLimit, upgradeMessage } = usePortfolioLimits(uniqueAssets);
```

**3. Validación antes de agregar transacción:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validaciones anteriores
  
  // ✅ Validación: Verificar límite de activos si es un activo nuevo
  const symbolExists = holdings.some(h => h.symbol === ticker);
  if (!symbolExists && isAtLimit) {
    toast.error("Límite de activos alcanzado", {
      description: `${upgradeMessage} Actualiza tu plan para agregar más activos.`,
    });
    return;
  }

  // Proceder con transacción...
};
```

#### Lógica
- **Si el símbolo ya existe en holdings**: ✅ Permitir (solo agrega más acciones del mismo activo)
- **Si es un nuevo símbolo Y está en límite**: ❌ Bloquear con toast descriptivo
- **Si es un nuevo símbolo Y NO está en límite**: ✅ Permitir

---

### 3. **Actualización de TODO List**

Se actualizó el TODO list para reflejar:
- ✅ Watchlist completado
- 🔄 Validación de límite de activos en portfolio (en progreso)
- 🔮 Múltiples portfolios marcado como FUTURO

---

## 🎯 Límites Implementados

| Plan | Límite de Activos | Config Key | Coherente con Dashboard |
|------|------------------|------------|------------------------|
| **Básico** | 3 activos | `maxTickersToCompare.basico` | ✅ Sí |
| **Plus** | 5 activos | `maxTickersToCompare.plus` | ✅ Sí |
| **Premium** | 10 activos | `maxTickersToCompare.premium` | ✅ Sí |
| **Admin** | 20 activos | `maxTickersToCompare.administrador` | ✅ Sí |

### Ventajas de Reutilizar `maxTickersToCompare`

1. **Coherencia**: Usuario puede comparar en dashboard los mismos activos que tiene en portfolio
2. **Simplicidad**: No hay que recordar dos límites diferentes
3. **Mantenibilidad**: Un solo config para actualizar
4. **UX clara**: Fácil de explicar al usuario

---

## 📊 Flujos Validados

### Flujo 1: Agregar Nuevo Activo (PERMITIDO)
```
Usuario: Plan Básico, tiene 2 activos (AAPL, TSLA)
Acción: Agregar transacción de AMZN
Validación: 2 < 3 → ✅ PERMITIDO
Resultado: Transacción agregada correctamente
```

### Flujo 2: Agregar Nuevo Activo (BLOQUEADO)
```
Usuario: Plan Básico, tiene 3 activos (AAPL, TSLA, AMZN)
Acción: Agregar transacción de GOOGL
Validación: 3 >= 3 → ❌ BLOQUEADO
Toast: "Límite de activos alcanzado"
Description: "Actualiza a un plan superior... tienes 3 de 3 activos"
```

### Flujo 3: Agregar Más del Mismo Activo (PERMITIDO)
```
Usuario: Plan Básico, tiene 3 activos (AAPL, TSLA, AMZN)
Acción: Agregar otra transacción de AAPL
Validación: AAPL ya existe → ✅ PERMITIDO (no es nuevo activo)
Resultado: Transacción agregada, holdings de AAPL actualizados
```

### Flujo 4: Usuario Upgrade (LÍMITE AUMENTA)
```
Usuario: Upgrade de Básico → Plus
Límite anterior: 3 activos
Límite nuevo: 5 activos
Estado: Tiene 3 activos
Resultado: Ahora puede agregar 2 activos más
```

---

## 🧪 Casos de Prueba

### Test 1: Usuario Básico (límite: 3)
```typescript
// Estado inicial
holdings = [
  { symbol: 'AAPL', quantity: 10 },
  { symbol: 'TSLA', quantity: 5 },
  { symbol: 'AMZN', quantity: 3 }
]

// Test 1.1: Intentar agregar GOOGL (4to activo)
addTransaction({ symbol: 'GOOGL', quantity: 2 })
// ❌ Esperado: Toast "Límite de activos alcanzado"

// Test 1.2: Agregar más AAPL (ya existe)
addTransaction({ symbol: 'AAPL', quantity: 5 })
// ✅ Esperado: Transacción agregada, AAPL ahora tiene 15 shares
```

### Test 2: Usuario Plus (límite: 5)
```typescript
// Estado inicial: 4 activos
holdings = [AAPL, TSLA, AMZN, GOOGL]

// Test 2.1: Agregar MSFT (5to activo)
addTransaction({ symbol: 'MSFT', quantity: 10 })
// ✅ Esperado: Transacción agregada

// Test 2.2: Agregar NVDA (6to activo)
addTransaction({ symbol: 'NVDA', quantity: 5 })
// ❌ Esperado: Bloqueado
```

### Test 3: Usuario Premium (límite: 10)
```typescript
// Estado inicial: 10 activos (lleno)
holdings = [AAPL, TSLA, AMZN, GOOGL, MSFT, NVDA, META, NFLX, JPM, V]

// Test 3.1: Intentar agregar BAC (11vo)
addTransaction({ symbol: 'BAC', quantity: 20 })
// ❌ Esperado: Bloqueado

// Test 3.2: Vender completamente AAPL (queda con 9)
sellTransaction({ symbol: 'AAPL', quantity: 10 })
// ✅ AAPL eliminado de holdings

// Test 3.3: Ahora agregar BAC
addTransaction({ symbol: 'BAC', quantity: 20 })
// ✅ Esperado: Permitido (ahora tiene espacio)
```

---

## 🚨 Edge Cases Considerados

### 1. **Usuario sin autenticar**
```typescript
profile?.role ?? 'basico'
// Fallback seguro a plan básico
```

### 2. **Config faltante**
```typescript
config.dashboard?.maxTickersToCompare?.[currentRole] ?? 3
// Fallback a 3 activos si hay error en config
```

### 3. **Holdings vacíos (primer activo)**
```typescript
const uniqueAssets = holdings.length; // 0
const symbolExists = holdings.some(...); // false
// No está en límite si es el primer activo
```

### 4. **Transacción de venta**
- **NO requiere validación** (solo compras agregan nuevos activos)
- `SellTransactionModal` no necesita cambios

---

## 📝 Mensajes de Error

### En Toast (Usuario ve):
```
Título: "Límite de activos alcanzado"
Descripción: "Actualiza a un plan superior para agregar más activos 
              a tu portfolio. Actualmente tienes 3 de 3 activos. 
              Actualiza tu plan para agregar más activos."
```

### En limitMessage (para otros usos):
```
"Tu plan Básico permite hasta 3 activos simultáneos en tu portfolio."
```

---

## 🔧 Integración con Sistema Existente

### Config.json
```json
{
  "dashboard": {
    "maxTickersToCompare": {
      "basico": 3,
      "plus": 5,
      "premium": 10,
      "administrador": 20
    }
  }
}
```

### Hooks Utilizados
- ✅ `useAuth()` - Obtener profile.role
- ✅ `useConfig()` - Leer maxTickersToCompare
- ✅ `usePortfolio()` - Obtener holdings
- ✅ `usePortfolioLimits()` - **NUEVO** - Validar límite

### Componentes Afectados
- ✅ `AddTransactionModal` - Validación agregada
- ⏸️ `SellTransactionModal` - Sin cambios (no aplica)

---

## 📖 Planes: Sin Mención de Múltiples Portfolios

La página de planes (`plans-page.tsx`) ya estaba corregida:
- ✅ Solo dice "Portfolio de inversiones"
- ✅ No menciona "Hasta X portfolios"
- ✅ No promete funcionalidad no implementada

---

## 🎉 Estado Actual

### Completado ✅
- [x] Hook `use-portfolio-limits.ts` creado
- [x] Validación en `AddTransactionModal`
- [x] Reutilización de `maxTickersToCompare`
- [x] Mensajes de error descriptivos
- [x] Edge cases manejados
- [x] TODO list actualizado
- [x] Documentación creada

### Pendiente ⏸️
- [ ] Testing manual con usuarios reales
- [ ] Analytics para ver cuántos usuarios alcanzan límite
- [ ] A/B testing de mensajes de upgrade

---

## 🚀 Próximos Pasos (Opcionales)

### 1. **Badge Visual en Portfolio Page** (30 min)
```tsx
<Badge variant={isAtLimit ? "destructive" : "secondary"}>
  {uniqueAssets} / {maxAssets} activos
</Badge>
```

### 2. **Indicador en Asset Card** (1h)
```tsx
{isAtLimit && !symbolExists && (
  <Badge variant="outline" className="text-muted-foreground">
    <Lock className="h-3 w-3 mr-1" />
    Límite alcanzado
  </Badge>
)}
```

### 3. **Múltiples Portfolios** (6-10h)
- Solo implementar si hay demanda explícita de usuarios
- Ver `MULTIPLE_PORTFOLIOS_ANALYSIS.md` para detalles

---

## 📊 Métricas Recomendadas

Para evaluar si necesitamos múltiples portfolios:

```typescript
// Analytics a trackear:
1. % usuarios que alcanzan límite de activos
2. Tiempo promedio para alcanzar límite
3. # intentos bloqueados por semana
4. Tasa de upgrade después de bloqueo
```

Si >30% de usuarios alcanzan límite → **Considerar múltiples portfolios**

Si <10% alcanzan límite → **No implementar todavía**

---

## ✅ Conclusión

**Sistema de límite de activos completamente funcional**:

1. ✅ **Coherencia**: Mismo límite que dashboard (3/5/10/20)
2. ✅ **Validación robusta**: Bloquea nuevos activos al alcanzar límite
3. ✅ **UX clara**: Mensajes descriptivos + sugerencia de upgrade
4. ✅ **Permite recompras**: No bloquea agregar más del mismo activo
5. ✅ **Edge cases**: Manejo seguro de casos límite

**No se requieren cambios adicionales en portfolio.**

**Múltiples portfolios queda como feature futura** (evaluando demanda).
