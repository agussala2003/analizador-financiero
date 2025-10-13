# Suspense Boundaries

## 📖 Qué es Suspense

**React Suspense** es una característica de React que permite manejar de forma declarativa los estados de carga mientras se esperan datos o componentes lazy-loaded.

### Beneficios

✅ **Código más limpio**: No más `if (isLoading)` en cada componente  
✅ **Mejor UX**: Fallbacks consistentes y predecibles  
✅ **Composición**: ErrorBoundary + Suspense = manejo completo de estados  
✅ **Performance**: Code splitting automático con lazy()  
✅ **Accesibilidad**: Estados de carga semánticamente correctos  

---

## 🎯 Implementación

### 1. Componentes de Fallback

Creamos fallbacks reutilizables para diferentes contextos:

\`\`\`tsx
// src/components/suspense/suspense-fallback.tsx

export function SuspenseFallback({ 
  type = 'spinner', 
  message = 'Cargando...' 
}: SuspenseFallbackProps) {
  switch (type) {
    case 'minimal':
      return <Loader2 className="h-6 w-6 animate-spin" />;
      
    case 'spinner':
      return (
        <div className="flex flex-col items-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p>{message}</p>
        </div>
      );
      
    case 'skeleton':
      // Layout skeleton completo
      return <SkeletonLayout />;
      
    case 'page':
      // Página completa con skeleton
      return <PageSkeleton />;
  }
}
\`\`\`

**Tipos disponibles:**
- **minimal**: Solo spinner pequeño
- **spinner**: Spinner centrado con mensaje
- **skeleton**: Layout skeleton completo  
- **page**: Página completa con header + content skeleton

---

### 2. Suspense en Rutas (Router)

Combinamos Suspense + ErrorBoundary en la configuración de rutas:

\`\`\`tsx
// src/main.tsx

import { ErrorBoundary } from './components/error-boundary';
import { SuspenseFallback } from './components/suspense';

const DashboardPage = React.lazy(() => import('./features/dashboard/pages/dashboard-page'));

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "dashboard",
        element: (
          // ✨ ErrorBoundary envuelve todo
          <ErrorBoundary level="feature" featureName="Dashboard">
            {/* Suspense maneja el lazy loading */}
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardPage />
            </Suspense>
          </ErrorBoundary>
        )
      }
    ]
  }
]);
\`\`\`

**Ventajas:**
1. Si falla el fetch del chunk → ErrorBoundary lo captura
2. Mientras carga el chunk → Suspense muestra fallback
3. Si el componente falla al renderizar → ErrorBoundary lo captura

---

### 3. Suspense en el Layout Principal

App.tsx con Suspense en el Outlet:

\`\`\`tsx
// src/App.tsx

import { SuspenseFallback } from './components/suspense';

export default function App() {
  return (
    <ErrorBoundary level="root">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header>{/* Header */}</header>
          
          <main className="flex-1">
            {/* ✨ Suspense captura lazy routes */}
            <React.Suspense fallback={<SuspenseFallback type="page" />}>
              <Outlet />
            </React.Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
\`\`\`

**Cobertura:**
- Todas las rutas lazy-loaded automáticamente
- Fallback consistente en toda la app
- ErrorBoundary en root captura errores de cualquier ruta

---

### 4. Suspense en Componentes

Para componentes específicos con lazy loading:

\`\`\`tsx
import { Suspense } from 'react';
import { ChartSuspenseFallback } from '@/components/suspense';

// ✨ Lazy load de gráfico pesado
const HeavyChart = React.lazy(() => import('./components/heavy-chart'));

export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Suspense solo para el gráfico */}
      <Suspense fallback={<ChartSuspenseFallback />}>
        <HeavyChart data={data} />
      </Suspense>
      
      {/* Resto del contenido renderiza sin esperar */}
      <StatsSummary />
    </div>
  );
}
\`\`\`

**Beneficio clave:**  
El resto de la página renderiza inmediatamente, solo el gráfico muestra loading.

---

## 🧪 Patrones de Uso

### Pattern 1: Ruta Completa

**Cuándo**: Páginas completas lazy-loaded  
**Estrategia**: ErrorBoundary + Suspense + Skeleton específico  

\`\`\`tsx
{
  path: "portfolio",
  element: (
    <ErrorBoundary level="feature" featureName="Portfolio">
      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioPage />
      </Suspense>
    </ErrorBoundary>
  )
}
\`\`\`

### Pattern 2: Componente Pesado

**Cuándo**: Componente grande dentro de una página  
**Estrategia**: Suspense local con fallback específico  

\`\`\`tsx
function AnalysisSection() {
  return (
    <section>
      <h2>Análisis Técnico</h2>
      <Suspense fallback={<ChartSuspenseFallback />}>
        <TechnicalAnalysisChart />
      </Suspense>
    </section>
  );
}
\`\`\`

### Pattern 3: Múltiples Componentes

**Cuándo**: Varios componentes lazy cargando en paralelo  
**Estrategia**: Suspense individual para cada uno  

\`\`\`tsx
<div className="grid grid-cols-2 gap-4">
  {/* Cargan en paralelo, muestran fallback independiente */}
  <Suspense fallback={<CardSkeleton />}>
    <StatsCard />
  </Suspense>
  
  <Suspense fallback={<CardSkeleton />}>
    <TrendsCard />
  </Suspense>
</div>
\`\`\`

### Pattern 4: Suspense Anidado

**Cuándo**: Diferentes niveles de granularidad  
**Estrategia**: Suspense en layout + Suspense en componentes  

\`\`\`tsx
// Layout level
<Suspense fallback={<PageSkeleton />}>
  <DashboardLayout>
    {/* Component level */}
    <Suspense fallback={<ChartSkeleton />}>
      <Chart />
    </Suspense>
    
    <Suspense fallback={<TableSkeleton />}>
      <DataTable />
    </Suspense>
  </DashboardLayout>
</Suspense>
\`\`\`

---

## 🎨 Fallbacks Especializados

### Para Tablas

\`\`\`tsx
import { TableSuspenseFallback } from '@/components/suspense';

<Suspense fallback={<TableSuspenseFallback rows={8} />}>
  <DataTable />
</Suspense>
\`\`\`

### Para Gráficos

\`\`\`tsx
import { ChartSuspenseFallback } from '@/components/suspense';

<Suspense fallback={<ChartSuspenseFallback />}>
  <LineChart data={data} />
</Suspense>
\`\`\`

### Para Formularios

\`\`\`tsx
import { FormSuspenseFallback } from '@/components/suspense';

<Suspense fallback={<FormSuspenseFallback />}>
  <ProfileForm />
</Suspense>
\`\`\`

---

## 🔄 Integración con TanStack Query

Suspense funciona nativamente con TanStack Query v5:

\`\`\`tsx
// Habilitar Suspense en el query
const { data } = useQuery({
  queryKey: ['asset', symbol],
  queryFn: () => fetchAsset(symbol),
  suspense: true, // ✨ Activa Suspense mode
});

// No necesitas if (isLoading), Suspense lo maneja
return <AssetDetails asset={data} />;
\`\`\`

**Ventajas:**
- No más `isLoading` checks
- Suspense se activa automáticamente
- Datos siempre están disponibles (tipo no-nullable)

**Alternativa moderna (React Query v5+):**

\`\`\`tsx
import { useSuspenseQuery } from '@tanstack/react-query';

function AssetDetails({ symbol }) {
  // ✨ useSuspenseQuery en lugar de useQuery
  const { data } = useSuspenseQuery({
    queryKey: ['asset', symbol],
    queryFn: () => fetchAsset(symbol),
  });
  
  // data nunca es undefined aquí
  return <div>{data.name}</div>;
}

// Envolver con Suspense en el padre
<Suspense fallback={<Skeleton />}>
  <AssetDetails symbol="AAPL" />
</Suspense>
\`\`\`

---

## ⚠️ Consideraciones

### Cuándo NO usar Suspense

❌ **Mutaciones**: Suspense es solo para fetching/loading  
❌ **Interacciones usuario**: Botones, formularios (usar loading states locales)  
❌ **Polling frecuente**: Suspense resetea cada refetch  
❌ **Datos opcionales**: Si el componente puede renderizar sin datos  

### Best Practices

✅ **Suspense + ErrorBoundary**: Siempre juntos para cobertura completa  
✅ **Fallbacks específicos**: Usar skeleton que coincida con el contenido  
✅ **Granularidad apropiada**: No demasiado alto ni demasiado bajo  
✅ **Streaming**: Para SSR, considerar Suspense streaming  
✅ **Accesibilidad**: Fallbacks con ARIA labels apropiados  

### Niveles de Granularidad

**Demasiado alto (❌):**
\`\`\`tsx
<Suspense fallback={<Spinner />}>
  <EntireApp />
</Suspense>
// Toda la app esperando cualquier lazy load
\`\`\`

**Demasiado bajo (❌):**
\`\`\`tsx
<Suspense fallback={<Spinner />}>
  <div>Title</div>
</Suspense>
// No hay beneficio, solo overhead
\`\`\`

**Apropiado (✅):**
\`\`\`tsx
<Suspense fallback={<PageSkeleton />}>
  <DashboardPage />
</Suspense>
// Página completa, skeleton específico
\`\`\`

---

## 🐛 Debugging

### React DevTools

En DevTools, los componentes en Suspense se marcan con indicador especial:

\`\`\`
⏸ Suspense (fallback: <Spinner />)
  ⏳ LazyComponent (suspended)
\`\`\`

### Console Logging

\`\`\`tsx
<Suspense 
  fallback={
    console.log('[Suspense] Showing fallback') || <Spinner />
  }
>
  <LazyComponent />
</Suspense>
\`\`\`

### Performance Profiler

Usar React Profiler para medir:
- Tiempo en Suspense
- Número de re-suspensions
- Waterfall de lazy loads

---

## 📊 Impacto en Performance

### Antes de Suspense
\`\`\`tsx
function Dashboard() {
  if (isLoading) return <Spinner />;
  if (isError) return <Error />;
  return <Content data={data} />;
}
\`\`\`

**Problemas:**
- Lógica de loading en cada componente
- Inconsistencias en UX
- Código repetitivo

### Después de Suspense
\`\`\`tsx
<ErrorBoundary>
  <Suspense fallback={<Skeleton />}>
    <Dashboard />
  </Suspense>
</ErrorBoundary>

function Dashboard() {
  const { data } = useSuspenseQuery(...)
  return <Content data={data} />;
}
\`\`\`

**Beneficios:**
- ✅ 40-60% menos código
- ✅ Loading states consistentes
- ✅ Mejor separación de concerns
- ✅ Tipos más simples (no nullable)

---

## 🔗 Referencias

- [React Docs - Suspense](https://react.dev/reference/react/Suspense)
- [TanStack Query - Suspense](https://tanstack.com/query/latest/docs/react/guides/suspense)
- [Patterns.dev - Suspense Pattern](https://www.patterns.dev/react/suspense/)

---

## 🎓 Siguiente Paso

Después de Suspense, considera:
- **React 19 Transitions**: Para updates que no bloquean UI
- **Concurrent Features**: useTransition, useDeferredValue
- **Server Components**: Para SSR con Suspense streaming
