# 🗂️ Análisis: Implementación de Múltiples Portfolios

> **Fecha**: Octubre 2024  
> **Estimación Original**: 12-16 horas  
> **Estimación Revisada**: 6-10 horas (optimizada)

---

## 📊 Análisis de Complejidad

### ⚠️ **Complejidad: MEDIA-ALTA**

**Factores positivos ✅**:
- Schema actual es simple (solo tabla `transactions`)
- No hay foreign keys complejas
- Provider ya existe y está bien estructurado
- Hooks con TanStack Query ya implementados
- Optimistic updates ya funcionan

**Factores negativos ❌**:
- Requiere migración de base de datos
- Afecta TODOS los componentes de portfolio
- Necesita lógica de "portfolio activo"
- Requiere nueva UI de selector de portfolio
- Impacta cálculos y agregaciones

---

## 🏗️ Cambios Necesarios (Desglosados)

### 1. **Base de Datos** (1-2 horas)

#### A) Nueva tabla `portfolios`
```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_user_default ON portfolios(user_id, is_default);

-- RLS Policies
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);
```

#### B) Modificar tabla `transactions`
```sql
-- Agregar columna portfolio_id
ALTER TABLE transactions 
ADD COLUMN portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE;

-- Crear índice
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);

-- Migrar datos existentes (crear portfolio default para cada usuario)
INSERT INTO portfolios (user_id, name, is_default)
SELECT DISTINCT user_id, 'Mi Portfolio', true
FROM transactions
WHERE user_id IS NOT NULL;

-- Asignar transacciones existentes al portfolio default
UPDATE transactions t
SET portfolio_id = p.id
FROM portfolios p
WHERE t.user_id = p.user_id 
  AND p.is_default = true
  AND t.portfolio_id IS NULL;

-- Hacer portfolio_id NOT NULL después de la migración
ALTER TABLE transactions 
ALTER COLUMN portfolio_id SET NOT NULL;
```

#### C) Función para validar límite de portfolios
```sql
CREATE OR REPLACE FUNCTION check_portfolio_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  portfolio_count INT;
  max_portfolios INT;
BEGIN
  -- Obtener plan del usuario desde profiles
  SELECT plan INTO user_plan
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Contar portfolios actuales
  SELECT COUNT(*) INTO portfolio_count
  FROM portfolios
  WHERE user_id = NEW.user_id;
  
  -- Determinar límite según plan
  max_portfolios := CASE user_plan
    WHEN 'basico' THEN 1
    WHEN 'plus' THEN 5
    WHEN 'premium' THEN 10
    ELSE 10000 -- administrador
  END;
  
  -- Validar límite
  IF portfolio_count >= max_portfolios THEN
    RAISE EXCEPTION 'Has alcanzado el límite de % portfolios para tu plan %', 
      max_portfolios, user_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER enforce_portfolio_limit
  BEFORE INSERT ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION check_portfolio_limit();
```

---

### 2. **TypeScript Types** (30 min)

```typescript
// src/types/portfolio.ts

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  portfolio_id: string; // ✅ NUEVO
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  transaction_type: 'buy' | 'sell';
}

export interface PortfolioWithMetrics extends Portfolio {
  totalValue: number;
  totalPL: number;
  totalPLPercent: number;
  assetCount: number;
  transactionCount: number;
}

export interface PortfolioContextType {
  // Existente
  transactions: Transaction[];
  portfolioData: Record<string, PortfolioAssetData>;
  holdings: Holding[];
  totalPerformance: TotalPerformance;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'portfolio_id'>) => void;
  deleteAsset: (symbol: string) => Promise<void>;
  
  // ✅ NUEVO para múltiples portfolios
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  setActivePortfolio: (portfolioId: string) => void;
  createPortfolio: (name: string, description?: string) => Promise<void>;
  updatePortfolio: (portfolioId: string, updates: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (portfolioId: string) => Promise<void>;
}
```

---

### 3. **Hooks** (2-3 horas)

#### A) `use-portfolios.ts` (NUEVO)
```typescript
// src/hooks/use-portfolios.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './use-auth';
import { Portfolio } from '../types/portfolio';
import { toast } from 'sonner';
import { usePlanLimits } from './use-plan-limits';

export function usePortfolios() {
  const { user } = useAuth();
  
  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Portfolio[];
    },
    enabled: !!user,
  });
  
  return { portfolios, isLoading };
}

export function usePortfolioMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { portfolios = [] } = usePortfolios();
  const { isAtLimit, limit } = usePlanLimits('portfolios', portfolios.length);
  
  const createPortfolio = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      // ✅ Validar límite ANTES de insert
      if (isAtLimit) {
        throw new Error(`Has alcanzado el límite de ${limit} portfolios. Actualiza tu plan.`);
      }
      
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name,
          description,
          is_default: portfolios.length === 0, // Primero es default
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Portfolio creado');
      void queryClient.invalidateQueries({ queryKey: ['portfolios', user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  
  const updatePortfolio = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Portfolio> }) => {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Portfolio actualizado');
      void queryClient.invalidateQueries({ queryKey: ['portfolios', user?.id] });
    },
  });
  
  const deletePortfolio = useMutation({
    mutationFn: async (portfolioId: string) => {
      // Validar que no sea el único portfolio
      if (portfolios.length === 1) {
        throw new Error('No puedes eliminar tu único portfolio');
      }
      
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Portfolio eliminado');
      void queryClient.invalidateQueries({ queryKey: ['portfolios', user?.id] });
      void queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
    },
  });
  
  return {
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
}
```

#### B) Modificar `portfolio-provider.tsx`
```typescript
// Agregar estado de portfolio activo
const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
const { portfolios } = usePortfolios();

// Cambiar query para filtrar por portfolio activo
const { data } = useQuery({
  queryKey: ['portfolio', user?.id, activePortfolioId],
  queryFn: () => fetchPortfolioData(user?.id, activePortfolioId),
  enabled: !!user && !!activePortfolioId,
});

// Función modificada
const fetchPortfolioData = async (userId: string | undefined, portfolioId: string | null) => {
  // ... código existente pero filtrar por portfolio_id
  const transResult = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('portfolio_id', portfolioId) // ✅ NUEVO FILTRO
    .order('purchase_date', { ascending: false });
  
  // ... resto igual
};
```

---

### 4. **UI Components** (2-3 horas)

#### A) `portfolio-selector.tsx` (NUEVO)
```tsx
// src/features/portfolio/components/portfolio-selector.tsx

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { usePortfolios } from '@/hooks/use-portfolios';
import { usePortfolio } from '@/hooks/use-portfolio';

export function PortfolioSelector() {
  const { portfolios } = usePortfolios();
  const { activePortfolioId, setActivePortfolio } = usePortfolio();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  return (
    <div className="flex items-center gap-2">
      <Select value={activePortfolioId} onValueChange={setActivePortfolio}>
        <SelectTrigger className="w-[200px]">
          <Briefcase className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Seleccionar portfolio" />
        </SelectTrigger>
        <SelectContent>
          {portfolios.map((portfolio) => (
            <SelectItem key={portfolio.id} value={portfolio.id}>
              {portfolio.name}
              {portfolio.is_default && ' (Principal)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      {showCreateModal && (
        <CreatePortfolioModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
```

#### B) `create-portfolio-modal.tsx` (NUEVO)
```tsx
// Modal para crear nuevo portfolio con validación de límites
// Similar a AddTransactionModal pero más simple
```

#### C) `portfolio-list-page.tsx` (NUEVO)
```tsx
// Página /portfolios mostrando todos los portfolios del usuario
// Con cards, métricas agregadas, y botones de acción
```

#### D) Modificar `portfolio-page.tsx`
```tsx
// Agregar PortfolioSelector en el header
<div className="flex items-center justify-between">
  <div>
    <h1>Mi Portfolio</h1>
    <PortfolioSelector />
  </div>
  <Button onClick={exportPDF}>Exportar PDF</Button>
</div>
```

---

### 5. **Límite de Activos por Portfolio** (1 hora)

#### Tu idea: Usar límite de comparación del dashboard ✅

```typescript
// src/hooks/use-portfolio-limits.ts (NUEVO)

export function usePortfolioLimits(currentAssetCount: number) {
  const { user } = useAuth();
  const config = useConfig();
  
  // Reutilizar límite de dashboard
  const maxAssets = config.dashboard.maxTickersToCompare[user?.plan || 'basico'];
  
  return {
    maxAssets,
    isAtLimit: currentAssetCount >= maxAssets,
    limitMessage: `Tu plan ${user?.plan} permite hasta ${maxAssets} activos simultáneos por portfolio.`,
  };
}
```

#### Validación al agregar transacción
```typescript
// En AddTransactionModal
const { holdings } = usePortfolio();
const { maxAssets, isAtLimit } = usePortfolioLimits(holdings.length);

const handleSubmit = () => {
  const symbolExists = holdings.some(h => h.symbol === symbol);
  
  if (!symbolExists && isAtLimit) {
    toast.error(`No puedes agregar más activos. Límite: ${maxAssets}`);
    return;
  }
  
  // Proceder...
};
```

**Límites resultantes:**
- Básico: 3 activos por portfolio
- Plus: 5 activos por portfolio
- Premium: 10 activos por portfolio
- Admin: 20 activos por portfolio

---

## ⏱️ Estimación de Tiempo Detallada

| Tarea | Tiempo | Dificultad |
|-------|--------|------------|
| **1. Migrations SQL** | 1-2h | Media |
| - Crear tabla portfolios | 30min | Baja |
| - Modificar transactions | 30min | Baja |
| - Migración de datos existentes | 30min | Media |
| - Trigger de validación | 30min | Media |
| **2. TypeScript Types** | 30min | Baja |
| **3. Hooks** | 2-3h | Media-Alta |
| - use-portfolios.ts | 1h | Media |
| - Modificar portfolio-provider.tsx | 1h | Alta |
| - use-portfolio-limits.ts | 30min | Baja |
| **4. UI Components** | 2-3h | Media |
| - PortfolioSelector | 1h | Media |
| - CreatePortfolioModal | 1h | Media |
| - PortfolioListPage | 1h | Media |
| **5. Modificar componentes existentes** | 1-2h | Media |
| - portfolio-page.tsx | 30min | Baja |
| - add-transaction-modal.tsx | 30min | Media |
| - Otros componentes menores | 1h | Baja |
| **6. Testing y debugging** | 1-2h | - |
| **TOTAL** | **8-12 horas** | **Media-Alta** |

---

## 🚨 Riesgos y Consideraciones

### Riesgos Técnicos
1. **Migración de datos**: Usuarios existentes tienen transacciones sin portfolio_id
   - **Solución**: Script de migración automática al portfolio default
   
2. **Queries más complejas**: Filtrar por portfolio_id en todas partes
   - **Impacto**: Ligero impacto en performance (mitigado con índices)
   
3. **Breaking changes**: Afecta toda la lógica de portfolio
   - **Solución**: Hacer cambios backward-compatible primero

### Riesgos de UX
1. **Complejidad adicional**: Usuarios deben seleccionar portfolio activo
   - **Solución**: Portfolio default seleccionado automáticamente
   
2. **Confusión**: ¿Dónde está mi dinero? ¿En qué portfolio?
   - **Solución**: Vista agregada en /portfolios mostrando todos

---

## 💡 Alternativa: Implementación Gradual (Recomendada)

### Fase 1: Backend (2-3h)
- ✅ Crear tabla portfolios
- ✅ Migrar datos existentes
- ✅ Modificar transactions
- ⏸️ NO agregar UI todavía

### Fase 2: UI Básica (2-3h)
- ✅ PortfolioSelector simple
- ✅ Modificar PortfolioProvider
- ⏸️ Solo mostrar, no crear/editar/eliminar

### Fase 3: CRUD Completo (3-4h)
- ✅ CreatePortfolioModal
- ✅ PortfolioListPage
- ✅ Validación de límites

### Fase 4: Límites de activos (1h)
- ✅ usePortfolioLimits
- ✅ Validación en modals

**Total gradual: 8-11 horas** (igual que full, pero menos riesgoso)

---

## ✅ Recomendación Final

### 🎯 **SÍ implementar múltiples portfolios SI:**
- Tienes usuarios que lo piden explícitamente
- Quieres diferenciarte de competencia
- Plan Premium necesita más features

### ❌ **NO implementar todavía SI:**
- Usuarios actuales están satisfechos con 1 portfolio
- Tienes otras prioridades más urgentes
- No hay presión de mercado

### 🌟 **Mi recomendación:**
**Implementar en Fase 1-2 (4-6h)** para tener backend listo, pero UI mínima. Evaluar demanda con usuarios antes de invertir en CRUD completo.

### 💎 **Sobre el límite de activos por portfolio:**
**¡EXCELENTE IDEA!** ✅ Reutilizar `maxTickersToCompare` es súper inteligente porque:
- Ya existe la lógica
- Tiene sentido de negocio (consistencia)
- Fácil de implementar (30-60 min)
- No confunde al usuario

**Límites resultantes coherentes:**
- Básico: 3 activos/portfolio, 1 portfolio = 3 activos totales
- Plus: 5 activos/portfolio, 5 portfolios = 25 activos totales
- Premium: 10 activos/portfolio, 10 portfolios = 100 activos totales

---

## 📄 Archivos a Crear/Modificar

### CREAR (7 archivos)
```
✨ supabase/migrations/20241015_multiple_portfolios.sql
✨ src/hooks/use-portfolios.ts
✨ src/hooks/use-portfolio-limits.ts
✨ src/features/portfolio/components/portfolio-selector.tsx
✨ src/features/portfolio/components/create-portfolio-modal.tsx
✨ src/features/portfolio/pages/portfolio-list-page.tsx
✨ docs/MULTIPLE_PORTFOLIOS_IMPLEMENTATION.md
```

### MODIFICAR (5 archivos)
```
📝 src/types/portfolio.ts (agregar Portfolio interface)
📝 src/providers/portfolio-provider.tsx (filtrar por portfolio_id)
📝 src/features/portfolio/pages/portfolio-page.tsx (agregar selector)
📝 src/features/portfolio/components/modals/add-transaction-modal.tsx (validar límite activos)
📝 src/hooks/use-plan-limits.ts (agregar tipo 'portfolios')
```

---

## 🎉 Conclusión

**Complejidad real: MEDIA** (no tan alta como parecía inicialmente)

**Tiempo optimizado: 6-10 horas** (vs 12-16 original)

**Factibilidad: ALTA** si se hace gradualmente

**ROI: MEDIO-ALTO** si hay demanda de usuarios

**Límite de activos por portfolio: OBLIGATORIO** ✅ (evita abusos y sobrecarga)
