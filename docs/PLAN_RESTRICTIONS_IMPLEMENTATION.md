# Plan de Implementación: Límites y Restricciones por Planes

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Límites Definidos en config.json](#límites-definidos)
3. [Análisis de Funcionalidades por Plan](#análisis-funcionalidades)
4. [Funcionalidades a Restringir](#funcionalidades-a-restringir)
5. [Plan de Implementación Detallado](#plan-implementación)
6. [Testing y Validación](#testing)

---

## 1. Resumen Ejecutivo

### Problema Actual
La aplicación promete diferentes funcionalidades según el plan en la página `/plans`, pero **no está aplicando las restricciones** en el código. Todos los usuarios pueden acceder a todas las funcionalidades sin importar su plan.

### Solución
Implementar **validaciones exhaustivas** en cada componente que ofrece funcionalidades premium, mostrando mensajes claros cuando el usuario necesita actualizar su plan.

### Impacto
- ✅ **Consistencia**: Lo que prometemos = Lo que entregamos
- ✅ **Monetización**: Incentivo real para upgrade
- ✅ **UX Honesta**: Usuario sabe exactamente qué obtiene
- ✅ **Escalabilidad**: Fácil agregar nuevos límites

---

## 2. Límites Definidos en config.json

### A) Límite de Activos para Analizar (`roleLimits`)

```json
{
  "basico": 5,      // Solo 5 activos diferentes en watchlist
  "plus": 25,       // Hasta 25 activos
  "premium": 50,    // Hasta 50 activos
  "administrador": 100000
}
```

**¿Dónde se aplica?**
- ❓ Watchlist (lista de seguimiento)
- ❓ ¿Límite de búsquedas?
- ❓ ¿Historial de activos visitados?

**Status**: ⚠️ **NO IMPLEMENTADO** - Necesita definición clara

### B) Límite de Portafolios (`portfolioLimits`)

```json
{
  "basico": 1,      // Solo 1 portafolio
  "plus": 5,        // Hasta 5 portafolios
  "premium": 10,    // Hasta 10 portafolios
  "administrador": 10000
}
```

**¿Dónde se aplica?**
- Portfolio creation (crear nuevo portafolio)

**Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO** en `dashboard-provider.tsx`

### C) Comparación Simultánea (`maxTickersToCompare`)

```json
{
  "basico": 3,      // Comparar 3 activos a la vez
  "plus": 5,        // Comparar 5 activos
  "premium": 10,    // Comparar 10 activos
  "administrador": 20
}
```

**¿Dónde se aplica?**
- Dashboard de comparación

**Status**: ✅ **IMPLEMENTADO** en `dashboard-provider.tsx`

### D) Símbolos Gratuitos (`freeTierSymbols`)

```json
[
  "AAPL", "TSLA", "AMZN", "MSFT", "NVDA", ...
  // ~90 símbolos populares
]
```

**¿Dónde se aplica?**
- Plan Básico solo puede analizar estos símbolos específicos
- Plus y Premium pueden analizar cualquier símbolo

**Status**: ⚠️ **PARCIALMENTE IMPLEMENTADO** en `dashboard-provider.tsx`

---

## 3. Análisis de Funcionalidades por Plan

### Plan BÁSICO (Gratis)

#### ✅ Funcionalidades Incluidas
1. **Análisis Fundamental** (todas las tabs excepto segmentación)
2. **Matriz de Correlación**
3. **Gráfico Radar Comparativo**
4. **Calendario de Dividendos**
5. **Noticias Financieras**
6. **Blog Comunitario**
7. **Comparar hasta 3 activos**
8. **1 Portafolio**
9. **5 activos para watchlist**
10. **Solo ~90 símbolos populares**

#### ❌ Funcionalidades BLOQUEADAS
1. **Stock Grades** (Calificaciones de analistas)
2. **Exportar Portfolio a PDF**
3. **Segmentación Geográfica**
4. **Segmentación de Productos**
5. **Calculadora de Retiro Avanzada**
6. **Más de 1 portafolio**
7. **Más de 5 activos en watchlist**
8. **Más de 3 activos en comparación**
9. **Símbolos que no estén en la lista gratuita**

### Plan PLUS ($9.99/mes)

#### ✅ TODO lo del Básico +
1. **Stock Grades** ← NUEVO
2. **Exportar Portfolio a PDF** ← NUEVO
3. **Segmentación Geográfica** ← NUEVO
4. **Segmentación de Productos** ← NUEVO
5. **Calculadora de Retiro Avanzada** ← NUEVO
6. **Hasta 5 portafolios**
7. **Hasta 25 activos en watchlist**
8. **Comparar hasta 5 activos**
9. **Todos los símbolos disponibles**
10. **Soporte prioritario**

#### ❌ Funcionalidades BLOQUEADAS
1. **API para automatización**
2. **Alertas en tiempo real**
3. **Análisis predictivo con IA**
4. **Reportes personalizados**

### Plan PREMIUM ($19.99/mes)

#### ✅ TODO + Funciones Avanzadas
1. **API para automatización**
2. **Alertas personalizadas en tiempo real**
3. **Análisis predictivo con IA**
4. **Reportes personalizados**
5. **Hasta 10 portafolios**
6. **Hasta 50 activos en watchlist**
7. **Comparar hasta 10 activos**
8. **Soporte 24/7**
9. **Acceso anticipado**

---

## 4. Funcionalidades a Restringir

### 🔴 PRIORIDAD CRÍTICA (Implementar YA)

#### 1. **Exportar Portfolio a PDF**
- **Archivo**: `src/features/portfolio/pages/portfolio-page.tsx`
- **Plan requerido**: Plus o Premium
- **Acción**: 
  - Ocultar botón para Básico
  - Mostrar tooltip: "Disponible en Plan Plus"
  - O mostrar botón disabled con modal de upgrade

#### 2. **Stock Grades Tab**
- **Archivo**: `src/features/asset-detail/components/asset-detail-tabs.tsx`
- **Plan requerido**: Plus o Premium
- **Acción**:
  - Ocultar tab para Básico
  - O mostrar tab locked con modal de upgrade

#### 3. **Segmentación Geográfica**
- **Archivo**: `src/features/asset-detail/components/revenue/revenue-geographic-tab.tsx`
- **Plan requerido**: Plus o Premium
- **Acción**: Igual que Stock Grades

#### 4. **Segmentación de Productos**
- **Archivo**: `src/features/asset-detail/components/revenue/revenue-product-tab.tsx`
- **Plan requerido**: Plus o Premium
- **Acción**: Igual que Stock Grades

#### 5. **Símbolos Restringidos (Básico)**
- **Archivo**: `src/features/search/*` y navigation
- **Plan requerido**: Plus o Premium para símbolos fuera de `freeTierSymbols`
- **Acción**:
  - En búsqueda, marcar símbolos premium con badge
  - Al intentar acceder, mostrar modal de upgrade
  - En dashboard, validar antes de agregar

#### 6. **Límite de Portafolios**
- **Archivo**: `src/features/portfolio/*`
- **Límites**: 
  - Básico: 1
  - Plus: 5
  - Premium: 10
- **Acción**:
  - Validar al crear nuevo portafolio
  - Mostrar contador: "1/1 portafolios usados"
  - Deshabilitar botón "Crear" cuando llegue al límite

### 🟡 PRIORIDAD MEDIA (Próximas semanas)

#### 7. **Límite de Watchlist**
- **Archivo**: `src/features/watchlist/*`
- **Límites**:
  - Básico: 5 activos
  - Plus: 25 activos
  - Premium: 50 activos
- **Acción**: Similar a dashboard, validar al agregar

#### 8. **Calculadora de Retiro Avanzada**
- **Archivo**: `src/features/retirement/*`
- **Plan requerido**: Plus o Premium
- **Acción**: 
  - Básico solo ve versión simple
  - Plus/Premium ven funciones avanzadas

### 🟢 PRIORIDAD BAJA (Futuro)

#### 9. **API para Automatización**
- **Plan requerido**: Solo Premium
- **Acción**: No existe aún, implementar cuando se cree

#### 10. **Alertas en Tiempo Real**
- **Plan requerido**: Solo Premium
- **Acción**: No existe aún

#### 11. **Análisis Predictivo con IA**
- **Plan requerido**: Solo Premium
- **Acción**: No existe aún

---

## 5. Plan de Implementación Detallado

### Fase 1: Crear Utilidades Compartidas (DÍA 1)

#### A) Hook: `usePlanFeature`

**Archivo**: `src/hooks/use-plan-feature.ts`

```typescript
import { useAuth } from './use-auth';
import { useConfig } from './use-config';

export type Feature =
  | 'exportPdf'
  | 'stockGrades'
  | 'revenueGeographic'
  | 'revenueProduct'
  | 'retirementAdvanced'
  | 'api'
  | 'alerts'
  | 'aiPredictions';

export interface PlanFeatureResult {
  hasAccess: boolean;
  requiredPlan: 'plus' | 'premium';
  currentPlan: string;
  upgradeMessage: string;
}

export function usePlanFeature(feature: Feature): PlanFeatureResult {
  const { profile } = useAuth();
  const currentRole = profile?.role ?? 'basico';

  const featureRequirements: Record<Feature, 'plus' | 'premium'> = {
    exportPdf: 'plus',
    stockGrades: 'plus',
    revenueGeographic: 'plus',
    revenueProduct: 'plus',
    retirementAdvanced: 'plus',
    api: 'premium',
    alerts: 'premium',
    aiPredictions: 'premium',
  };

  const requiredPlan = featureRequirements[feature];
  const planHierarchy = ['basico', 'plus', 'premium', 'administrador'];
  const currentIndex = planHierarchy.indexOf(currentRole);
  const requiredIndex = planHierarchy.indexOf(requiredPlan);

  const hasAccess = currentIndex >= requiredIndex;

  const featureNames: Record<Feature, string> = {
    exportPdf: 'Exportar a PDF',
    stockGrades: 'Calificaciones de Analistas',
    revenueGeographic: 'Segmentación Geográfica',
    revenueProduct: 'Segmentación de Productos',
    retirementAdvanced: 'Calculadora Avanzada',
    api: 'Acceso a API',
    alerts: 'Alertas en Tiempo Real',
    aiPredictions: 'Análisis Predictivo con IA',
  };

  const upgradeMessage = hasAccess
    ? ''
    : `${featureNames[feature]} está disponible en el plan ${requiredPlan === 'plus' ? 'Plus' : 'Premium'}.`;

  return {
    hasAccess,
    requiredPlan,
    currentPlan: currentRole,
    upgradeMessage,
  };
}
```

#### B) Componente: `<UpgradeModal />`

**Archivo**: `src/components/shared/upgrade-modal.tsx`

```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Crown, Rocket } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: 'plus' | 'premium';
  description?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureName,
  requiredPlan,
  description,
}: UpgradeModalProps) {
  const Icon = requiredPlan === 'plus' ? Crown : Rocket;
  const planName = requiredPlan === 'plus' ? 'Plus' : 'Premium';
  const price = requiredPlan === 'plus' ? '$9.99' : '$19.99';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary" />
            <DialogTitle>Actualiza a {planName}</DialogTitle>
          </div>
          <DialogDescription>
            {description ||
              `${featureName} está disponible para usuarios del plan ${planName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-center text-2xl font-bold">{price}/mes</p>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Plan {planName}
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button asChild>
            <a href="/plans">Ver Planes</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### C) Componente: `<FeatureLocked />`

**Archivo**: `src/components/shared/feature-locked.tsx`

```typescript
import { Lock, Crown, Rocket } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface FeatureLockedProps {
  featureName: string;
  requiredPlan: 'plus' | 'premium';
  description?: string;
  variant?: 'card' | 'inline' | 'overlay';
}

export function FeatureLocked({
  featureName,
  requiredPlan,
  description,
  variant = 'card',
}: FeatureLockedProps) {
  const Icon = requiredPlan === 'plus' ? Crown : Rocket;
  const planName = requiredPlan === 'plus' ? 'Plus' : 'Premium';

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Disponible en {planName}</span>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center space-y-4 p-8">
          <Icon className="h-12 w-12 mx-auto text-primary" />
          <div>
            <h3 className="font-semibold text-lg">{featureName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description || `Disponible en plan ${planName}`}
            </p>
          </div>
          <Button asChild>
            <a href="/plans">Actualizar a {planName}</a>
          </Button>
        </div>
      </div>
    );
  }

  // variant === 'card'
  return (
    <Card>
      <CardHeader className="text-center">
        <Icon className="h-12 w-12 mx-auto text-primary mb-4" />
        <CardTitle>{featureName}</CardTitle>
        <CardDescription>
          {description ||
            `Esta funcionalidad está disponible para usuarios del plan ${planName}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" asChild>
          <a href="/plans">Ver Planes y Actualizar</a>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

### Fase 2: Implementar Restricciones (DÍAS 2-5)

#### Día 2: Portfolio PDF Export

**Archivo modificar**: `src/features/portfolio/pages/portfolio-page.tsx`

**Cambios**:
1. Importar `usePlanFeature`
2. Usar hook para verificar acceso
3. Si no tiene acceso:
   - Deshabilitar botón
   - Mostrar tooltip
   - Al hacer click, abrir modal de upgrade

```typescript
// Al inicio del componente
const { hasAccess: canExportPdf, upgradeMessage } = usePlanFeature('exportPdf');

// En el botón de exportar
<Button
  variant="outline"
  size="sm"
  disabled={!canExportPdf}
  onClick={() => {
    if (!canExportPdf) {
      setShowUpgradeModal(true);
      return;
    }
    void handleExportPdf();
  }}
>
  <FileDown className="h-4 w-4 mr-2" />
  Exportar PDF
  {!canExportPdf && <Lock className="h-3 w-3 ml-2" />}
</Button>

{/* Modal de upgrade */}
<UpgradeModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  featureName="Exportar Portfolio a PDF"
  requiredPlan="plus"
  description="Descarga reportes detallados de tus portafolios en formato PDF."
/>
```

#### Día 3: Stock Grades + Segmentación

**Archivos a modificar**:
1. `src/features/asset-detail/components/asset-detail-tabs.tsx`
2. `src/features/asset-detail/components/ratings/asset-grades-tab.tsx`
3. `src/features/asset-detail/components/revenue/revenue-geographic-tab.tsx`
4. `src/features/asset-detail/components/revenue/revenue-product-tab.tsx`

**Estrategia**:
- Opción A: Ocultar tabs completamente (más simple)
- Opción B: Mostrar tabs con lock icon y contenido bloqueado (mejor UX)

**Recomendación**: Opción B

```typescript
// En asset-detail-tabs.tsx
const tabs = [
  { value: 'overview', label: 'Perfil', icon: Home },
  { value: 'chart', label: 'Gráfico', icon: ChartCandlestick },
  { value: 'financials', label: 'Finanzas', icon: DollarSign },
  { 
    value: 'grades', 
    label: 'Calificaciones', 
    icon: TrendingUp,
    requiresFeature: 'stockGrades' as const  // ← NUEVO
  },
  {
    value: 'geographic',
    label: 'Geográfico',
    icon: Globe,
    requiresFeature: 'revenueGeographic' as const  // ← NUEVO
  },
  // ...
];

// Renderizar tabs
{tabs.map((tab) => {
  const featureCheck = tab.requiresFeature 
    ? usePlanFeature(tab.requiresFeature)
    : { hasAccess: true };
    
  return (
    <TabsTrigger 
      key={tab.value} 
      value={tab.value}
      disabled={!featureCheck.hasAccess}
    >
      <tab.icon className="h-4 w-4" />
      {tab.label}
      {!featureCheck.hasAccess && <Lock className="h-3 w-3 ml-1" />}
    </TabsTrigger>
  );
})}
```

**En cada tab bloqueado** (asset-grades-tab.tsx, etc):

```typescript
export function AssetGradesTab({ symbol }: AssetGradesTabProps) {
  const { hasAccess } = usePlanFeature('stockGrades');

  if (!hasAccess) {
    return (
      <FeatureLocked
        featureName="Calificaciones de Analistas"
        requiredPlan="plus"
        description="Accede al historial completo de upgrades, downgrades y recomendaciones de las principales firmas analistas."
      />
    );
  }

  // ... resto del código normal
}
```

#### Día 4: Límite de Portafolios

**Archivo**: `src/features/portfolio/hooks/use-portfolios.ts` (o donde se creen)

```typescript
export function useCreatePortfolio() {
  const { profile } = useAuth();
  const config = useConfig();
  const { data: portfolios } = usePortfolios();

  const currentRole = profile?.role ?? 'basico';
  const limit = config.plans.portfolioLimits[currentRole];
  const currentCount = portfolios?.length ?? 0;
  const canCreate = currentCount < limit;

  const create = async (name: string) => {
    if (!canCreate) {
      toast.error(`Has alcanzado el límite de ${limit} portafolio(s) para tu plan.`);
      toast.info('Actualiza a Plus para tener hasta 5 portafolios.');
      return { success: false };
    }

    // ... lógica de creación
  };

  return {
    create,
    canCreate,
    limit,
    currentCount,
    remaining: limit - currentCount,
  };
}
```

**En el UI** (botón de crear portafolio):

```typescript
const { canCreate, limit, currentCount, remaining } = useCreatePortfolio();

<div>
  <p className="text-sm text-muted-foreground mb-2">
    {currentCount} / {limit} portafolios usados
  </p>
  
  <Button disabled={!canCreate}>
    Crear Nuevo Portafolio
  </Button>
  
  {!canCreate && (
    <p className="text-xs text-destructive mt-1">
      Límite alcanzado. <a href="/plans" className="underline">Actualizar plan</a>
    </p>
  )}
</div>
```

#### Día 5: Validación de Símbolos (Básico)

**Archivos**:
1. `src/features/search/*`
2. `src/features/dashboard/providers/dashboard-provider.tsx` (ya tiene algo)
3. Cualquier lugar donde se agregue un símbolo

**En búsqueda** (search component):

```typescript
export function SearchResults({ results }: SearchResultsProps) {
  const { profile } = useAuth();
  const config = useConfig();
  const currentRole = profile?.role ?? 'basico';
  const freeTierSymbols = config.plans.freeTierSymbols;

  return (
    <div>
      {results.map((result) => {
        const isLocked = currentRole === 'basico' && 
                        !freeTierSymbols.includes(result.symbol);

        return (
          <div key={result.symbol} className="flex items-center justify-between">
            <span>{result.symbol} - {result.name}</span>
            {isLocked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Plus
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

**Al intentar acceder** (en navigation o detail page):

```typescript
export function AssetDetailPage() {
  const { symbol } = useParams();
  const { profile } = useAuth();
  const config = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    const currentRole = profile?.role ?? 'basico';
    const freeTierSymbols = config.plans.freeTierSymbols;
    const isLocked = currentRole === 'basico' && !freeTierSymbols.includes(symbol);

    if (isLocked) {
      toast.error(`${symbol} solo está disponible en planes Plus o Premium.`);
      navigate('/plans');
    }
  }, [symbol, profile, config, navigate]);

  // ... resto
}
```

---

### Fase 3: Testing (DÍA 6)

#### Checklist de Testing

**Para cada plan**:

| Plan | Test | Resultado Esperado |
|------|------|-------------------|
| **Básico** | Intentar exportar PDF | ❌ Botón disabled + modal |
| | Ver tab Stock Grades | ❌ Tab locked o modal |
| | Ver tab Segmentación | ❌ Tab locked o modal |
| | Crear 2do portafolio | ❌ Error + mensaje de límite |
| | Agregar 6to activo a watchlist | ❌ Error + mensaje |
| | Buscar símbolo no gratuito (ej: COIN) | 🔒 Badge "Plus" |
| | Acceder a /asset/COIN | ❌ Redirect a /plans |
| **Plus** | Todo lo anterior | ✅ Todo permitido |
| | Crear 6to portafolio | ❌ Error (límite 5) |
| | Comparar 6 activos | ❌ Error (límite 5) |
| **Premium** | Todo | ✅ Sin límites (excepto 10 portafolios) |

---

## 6. Código de Ejemplo Completo

### Ejemplo 1: Portfolio PDF Export

```typescript
// portfolio-page.tsx
import { useState } from 'react';
import { FileDown, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { usePlanFeature } from '../../../hooks/use-plan-feature';
import { UpgradeModal } from '../../../components/shared/upgrade-modal';
import { exportPortfolioToPdf } from '../../../utils/export-pdf';

export default function PortfolioPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { hasAccess: canExportPdf, upgradeMessage } = usePlanFeature('exportPdf');

  const handleExportClick = () => {
    if (!canExportPdf) {
      setShowUpgradeModal(true);
      return;
    }
    void handleExportPdf();
  };

  const handleExportPdf = async () => {
    // ... lógica actual de exportación
  };

  return (
    <div>
      {/* ... resto del contenido ... */}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportClick}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        Exportar a PDF
        {!canExportPdf && <Lock className="h-3 w-3 text-muted-foreground" />}
      </Button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Exportar Portfolio a PDF"
        requiredPlan="plus"
        description="Descarga reportes profesionales de tus portafolios con gráficos y métricas detalladas."
      />
    </div>
  );
}
```

### Ejemplo 2: Stock Grades Tab

```typescript
// asset-grades-tab.tsx
import { usePlanFeature } from '../../../../hooks/use-plan-feature';
import { FeatureLocked } from '../../../../components/shared/feature-locked';

export function AssetGradesTab({ symbol }: AssetGradesTabProps) {
  const { hasAccess } = usePlanFeature('stockGrades');
  const config = useConfig();
  const endpoint = config.api.fmpProxyEndpoints.stockGrades;

  // Verificar acceso primero
  if (!hasAccess) {
    return (
      <FeatureLocked
        featureName="Calificaciones de Analistas"
        requiredPlan="plus"
        description="Accede al historial completo de upgrades, downgrades y cambios de calificación de las principales firmas como Goldman Sachs, Morgan Stanley y más."
      />
    );
  }

  // ... resto del código normal (queries, paginación, etc.)
  const { data: grades, isLoading } = useQuery<StockGrade[]>({
    queryKey: ['stockGrades', symbol],
    queryFn: () => fetchStockGrades(symbol, endpoint),
  });

  // ... render normal
}
```

### Ejemplo 3: Crear Portafolio con Límite

```typescript
// create-portfolio-modal.tsx
import { usePlanLimits } from '../../../hooks/use-plan-limits';

export function CreatePortfolioModal() {
  const { 
    portfolioLimit, 
    portfolioCount, 
    canCreatePortfolio 
  } = usePlanLimits();

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>Crear Nuevo Portafolio</DialogTitle>
        <DialogDescription>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">
              Portafolios usados: {portfolioCount} / {portfolioLimit}
            </span>
            {!canCreatePortfolio && (
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3 w-3" />
                Límite alcanzado
              </Badge>
            )}
          </div>
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        {!canCreatePortfolio ? (
          <div className="text-center py-8 space-y-4">
            <Crown className="h-12 w-12 mx-auto text-primary" />
            <div>
              <h3 className="font-semibold">Alcanzaste el límite</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tu plan permite {portfolioLimit} portafolio(s). Actualiza a Plus para tener hasta 5.
              </p>
            </div>
            <Button asChild className="w-full">
              <a href="/plans">Ver Planes</a>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate}>
            {/* ... formulario normal ... */}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. Resumen de Archivos a Crear/Modificar

### 📄 Archivos NUEVOS a Crear

1. ✅ `src/hooks/use-plan-feature.ts` - Hook principal
2. ✅ `src/hooks/use-plan-limits.ts` - Hook para límites numéricos
3. ✅ `src/components/shared/upgrade-modal.tsx` - Modal de upgrade
4. ✅ `src/components/shared/feature-locked.tsx` - Componente de feature bloqueada
5. ✅ `src/utils/plan-validators.ts` - Funciones de validación

### 📝 Archivos a MODIFICAR

1. ❌ `src/features/portfolio/pages/portfolio-page.tsx` - PDF export
2. ❌ `src/features/asset-detail/components/asset-detail-tabs.tsx` - Tabs con locks
3. ❌ `src/features/asset-detail/components/ratings/asset-grades-tab.tsx` - Validar acceso
4. ❌ `src/features/asset-detail/components/revenue/revenue-geographic-tab.tsx` - Validar
5. ❌ `src/features/asset-detail/components/revenue/revenue-product-tab.tsx` - Validar
6. ❌ `src/features/portfolio/hooks/use-portfolios.ts` - Límite de portafolios
7. ❌ `src/features/watchlist/*` - Límite de watchlist
8. ❌ `src/features/search/*` - Marcar símbolos premium
9. ❌ `src/features/asset-detail/pages/asset-detail-page.tsx` - Validar símbolo
10. ❌ `src/features/retirement/*` - Funciones avanzadas (opcional)

---

## 8. Estimación de Tiempo

| Fase | Duración | Descripción |
|------|----------|-------------|
| **Fase 1** | 4-6 horas | Crear hooks y componentes compartidos |
| **Fase 2** | 8-12 horas | Implementar restricciones en todos los features |
| **Fase 3** | 4-6 horas | Testing exhaustivo con los 3 planes |
| **Fase 4** | 2-3 horas | Documentación y fixes finales |
| **TOTAL** | **18-27 horas** | **3-4 días de trabajo** |

---

## 9. Priorización Sugerida

### 🔴 Hacer AHORA (Crítico)
1. PDF Export
2. Stock Grades
3. Segmentación Geográfica/Productos
4. Límite de Portafolios

### 🟡 Hacer PRONTO (Importante)
5. Validación de Símbolos (Básico)
6. Límite de Watchlist

### 🟢 Hacer DESPUÉS (Nice to have)
7. Calculadora Retiro Avanzada
8. Features futuras (API, Alertas, IA)

---

## 10. Siguientes Pasos

1. **APROBAR este plan** - Revisión y ajustes
2. **Crear branch**: `feature/plan-restrictions`
3. **Implementar Fase 1** - Utilidades compartidas
4. **PR y Review** - Fase 1
5. **Implementar Fase 2** - Restricciones por feature
6. **PR y Review** - Fase 2
7. **Testing exhaustivo** - Los 3 planes
8. **Deploy y monitoreo**

¿Comenzamos con la implementación?
