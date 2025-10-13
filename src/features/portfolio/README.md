# Portfolio Feature

## 📋 Descripción General

La feature de **Portfolio** permite a los usuarios gestionar su cartera de inversiones de manera completa. Incluye registro de transacciones (compra/venta), visualización de posiciones actuales, análisis de rendimiento, métricas de riesgo, gráficos interactivos y un historial detallado de todas las operaciones.

## 🏗️ Arquitectura

Esta feature sigue el patrón **Feature-Sliced Design**:

```
portfolio/
├── types/                    # Definiciones de tipos TypeScript
│   └── portfolio.types.ts    # Tipos de props y datos
├── lib/                      # Lógica de negocio y utilidades
│   └── portfolio.utils.ts    # Funciones de cálculo y formato
├── components/               # Componentes React
│   ├── modals/              # Modales de transacciones
│   │   ├── add-transaction-modal.tsx    # Modal para compras
│   │   └── sell-transaction-modal.tsx   # Modal para ventas
│   ├── stats/               # Componentes de estadísticas
│   │   └── portfolio-stats.tsx          # Tarjetas de métricas
│   ├── charts/              # Componentes de gráficos
│   │   └── portfolio-charts.tsx         # Gráficos de torta y barras
│   ├── table/               # Componentes de tablas
│   │   ├── portfolio-view.tsx           # Tabla de posiciones
│   │   └── transaction-history.tsx      # Tabla de transacciones
│   ├── skeleton/            # Estados de carga
│   │   └── portfolio-skeleton.tsx       # Skeleton del portfolio
│   └── index.ts             # Barrel export
├── hooks/                   # Custom hooks
│   └── use-portfolio-mutations.ts       # Mutaciones optimistas
└── pages/                   # Páginas de la feature
    └── portfolio-page.tsx   # Página principal del portfolio
```

## 📦 Componentes

### Modals

#### AddTransactionModal
**Ubicación**: `components/modals/add-transaction-modal.tsx`

Modal para registrar nuevas compras de activos.

**Props**:
```typescript
interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string | null;
  currentPrice: number | null;
}
```

**Características**:
- Soporte para CEDEARs con conversión automática de ratio
- Validación de fecha futura
- Cálculo automático de cantidad y precio según tipo de activo
- Integración con TanStack Query para actualizaciones optimistas
- Uso del hook `useTransactionForm` para manejo de estado

**Ejemplo de uso**:
```tsx
<AddTransactionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  ticker="AAPL"
  currentPrice={175.50}
/>
```

---

#### SellTransactionModal
**Ubicación**: `components/modals/sell-transaction-modal.tsx`

Modal para registrar ventas de activos existentes.

**Props**:
```typescript
interface SellTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: HoldingWithMetrics | null;
}
```

**Características**:
- Validación de cantidad máxima vendible
- Soporte para CEDEARs
- Cálculo automático de valor total
- Prevención de ventas de cantidades superiores a las poseídas
- Tolerancia para errores de punto flotante

**Ejemplo de uso**:
```tsx
<SellTransactionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  holding={selectedHolding}
/>
```

---

### Stats

#### PortfolioStats
**Ubicación**: `components/stats/portfolio-stats.tsx`

Muestra 12 tarjetas de métricas clave del portfolio organizadas en 3 filas.

**Props**:
```typescript
{
  holdings: Holding[];
  totalPerformance: PortfolioContextType['totalPerformance'];
  portfolioData: Record<string, PortfolioAssetData>;
}
```

**Métricas mostradas**:

**Fila 1 - Métricas Actuales**:
- Valor Actual
- G/P Posiciones Actuales
- Rendimiento Actual (%)
- G/P del Día

**Fila 2 - Métricas Históricas**:
- G/P Total (con histórico)
- Rendimiento Total (%)
- Posiciones Totales
- Costo Total

**Fila 3 - Análisis de Riesgo y Performance**:
- Beta Ponderado
- Ratio de Sharpe Ponderado
- Mejor Activo (G/P %)
- Peor Activo (G/P %)

**Características**:
- Tooltips informativos en cada métrica
- Colores dinámicos (verde para ganancias, rojo para pérdidas)
- Formato de moneda y porcentajes consistente
- Cálculo de métricas usando `calculatePortfolioMetrics()`

**Ejemplo de uso**:
```tsx
<PortfolioStats
  holdings={holdings}
  totalPerformance={totalPerformance}
  portfolioData={portfolioData}
/>
```

---

### Charts

#### PortfolioCharts
**Ubicación**: `components/charts/portfolio-charts.tsx`

Dos gráficos interactivos usando Recharts:

**Gráficos incluidos**:

1. **Gráfico de Torta - Distribución de Activos**:
   - Muestra el porcentaje de cada activo en el portfolio
   - Colores dinámicos (hasta 6 colores diferentes)
   - Tooltip con valor en USD y porcentaje
   - Leyenda con símbolos y porcentajes

2. **Gráfico de Barras - G/P por Activo (%)**:
   - Barras verdes para ganancias, rojas para pérdidas
   - Etiquetas con símbolos de activos
   - Eje Y con formato de porcentaje
   - Dominio fijo de -30% a 80%

**Props**:
```typescript
{ holdings: Holding[] }
```

**Características**:
- Uso de hook `useChartData` para procesamiento optimizado
- Colores CSS variables para consistencia con el tema
- Responsive (grid de 1 columna en mobile, 2 en desktop)
- Integración con shadcn/ui ChartContainer

**Ejemplo de uso**:
```tsx
<PortfolioCharts holdings={holdings} />
```

---

### Table

#### PortfolioView
**Ubicación**: `components/table/portfolio-view.tsx`

Tabla interactiva de posiciones abiertas usando TanStack Table.

**Props**:
```typescript
interface PortfolioViewProps {
  holdings: HoldingWithMetrics[];
  onDeleteAsset: (symbol: string) => void;
  onAddMore: (ticker: string, price: number) => void;
  onSell: (holding: HoldingWithMetrics) => void;
}
```

**Columnas**:
- Activo
- Cantidad (formato con 2-4 decimales)
- Precio Promedio
- Precio Actual
- Valor Mercado
- G/P ($) - con color dinámico
- G/P (%) - con color dinámico
- Acciones (agregar, vender, eliminar)

**Características**:
- Ordenamiento por columna
- Botones de acción con iconos (PlusCircle, MinusCircle, Trash2)
- AlertDialog para confirmar eliminación
- Estado vacío con mensaje informativo
- Formato de números con `formatCurrency()` y `formatQuantity()`

**Ejemplo de uso**:
```tsx
<PortfolioView
  holdings={holdingsWithMetrics}
  onDeleteAsset={handleDelete}
  onAddMore={handleAdd}
  onSell={handleSell}
/>
```

---

#### TransactionHistory
**Ubicación**: `components/table/transaction-history.tsx`

Tabla paginada del historial de transacciones.

**Props**:
```typescript
{ transactions: Transaction[] }
```

**Columnas**:
- Fecha (formato DD/MM/YYYY)
- Activo
- Tipo (Compra/Venta con color)
- Cantidad
- Precio
- Valor Total (calculado)

**Características**:
- Reutiliza `DataTable` de la feature dividends
- Paginación automática
- Color verde para compras, rojo para ventas
- Se oculta si no hay transacciones
- Formato de fecha en español

**Ejemplo de uso**:
```tsx
<TransactionHistory transactions={transactions} />
```

---

### Skeleton

#### PortfolioSkeleton
**Ubicación**: `components/skeleton/portfolio-skeleton.tsx`

Estado de carga del portfolio completo.

**Estructura**:
- Header con icono y títulos
- 12 tarjetas de estadísticas (grid 4 columnas)
- 2 gráficos (grid 2 columnas)
- Tabla de posiciones
- Tabla de historial

**Características**:
- Responsive (adapta columnas según breakpoint)
- Alturas consistentes con contenido real
- Uso de Skeleton de shadcn/ui

**Ejemplo de uso**:
```tsx
if (loading) return <PortfolioSkeleton />;
```

---

## 🔧 Utilidades

### portfolio.utils.ts

**Funciones de formato**:

```typescript
// Formatea número como moneda USD
formatCurrency(value: number): string
// Ejemplo: formatCurrency(1234.56) → "$1,234.56"

// Formatea número como porcentaje
formatPercent(value: number): string
// Ejemplo: formatPercent(12.345) → "12.35%"

// Formatea cantidad con precisión
formatQuantity(value: number): string
// Ejemplo: formatQuantity(15.5678) → "15.5678"

// Formatea fecha en español
formatDate(dateString: string): string
// Ejemplo: formatDate("2024-10-12") → "12/10/2024"

// Formatea número o retorna 'N/A'
formatNumber(value: number | string): string
// Ejemplo: formatNumber(1.234) → "1.23"
```

**Funciones de cálculo**:

```typescript
// Calcula todas las métricas del portfolio
calculatePortfolioMetrics(
  holdings: Holding[],
  portfolioData: Record<string, PortfolioAssetData>
): PortfolioMetrics

// Calcula datos de alocación para gráfico de torta
calculateAllocationData(holdings: Holding[]): {
  allocationData: AllocationDatum[];
  totalValue: number;
}

// Calcula datos de P&L para gráfico de barras
calculatePlData(holdings: Holding[]): PlDatum[]

// Genera configuración de colores para gráficos
generateChartConfig(allocationData: AllocationDatum[]): ChartConfigFixed

// Calcula P&L diario en porcentaje
calculateDailyPlPercent(currentValue: number, dailyPL: number): number

// Determina clase de color según valor
getColorClass(value: number): string
// Retorna 'text-green-500' si >= 0, 'text-red-500' si < 0
```

**Funciones de validación y transformación**:

```typescript
// Valida si una fecha es futura
isFutureDate(dateString: string): boolean

// Calcula cantidad final considerando CEDEARs
calculateFinalQuantity(
  enteredQuantity: number,
  isCedears: boolean,
  ratio: number | null | undefined
): number

// Calcula precio final considerando CEDEARs
calculateFinalPrice(
  enteredPrice: number,
  isCedears: boolean,
  ratio: number | null | undefined
): number
```

---

## 📊 Tipos

### portfolio.types.ts

```typescript
// Props de modales
interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string | null;
  currentPrice: number | null;
}

interface SellTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: HoldingWithMetrics | null;
}

// Info del modal de agregar
interface AddModalInfo {
  isOpen: boolean;
  ticker: string | null;
  price: number | null;
}

// Props de componentes
interface PortfolioViewProps {
  holdings: HoldingWithMetrics[];
  onDeleteAsset: (symbol: string) => void;
  onAddMore: (ticker: string, price: number) => void;
  onSell: (holding: HoldingWithMetrics) => void;
}

// Datos para gráficos
interface AllocationDatum {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

interface PlDatum {
  symbol: string;
  pl: number;
}

// Configuración de gráficos
type ChartConfigFixed = Record<
  string,
  { label?: React.ReactNode; color?: string; icon?: React.ComponentType }
>;

// Métricas del portfolio
interface PortfolioMetrics {
  totalInvested: number;
  currentValue: number;
  currentPL: number;
  currentPLPercent: number;
  dailyPL: number;
  bestPerformer: { symbol: string; plPercent: number };
  worstPerformer: { symbol: string; plPercent: number };
  positionsCount: number;
  portfolioBeta: number | "N/A";
  sharpeRatio: number | "N/A";
}
```

---

## 🎣 Custom Hooks

### use-portfolio-mutations.ts

**Ubicación**: `hooks/use-portfolio-mutations.ts`

Hook para mutaciones con actualizaciones optimistas usando TanStack Query.

**Retorna**:
```typescript
{
  addTransaction: UseMutationResult<Transaction, Error, ...>
}
```

**Características**:
- **Actualizaciones optimistas**: UI se actualiza inmediatamente
- **Rollback automático**: Si falla, revierte los cambios
- **Invalidación de cache**: Refresca datos del servidor tras mutación
- **Manejo de errores**: Toast notifications con descripciones
- **Logging**: Integración con logger para debugging

**Flujo de mutación optimista**:

1. **onMutate**: 
   - Cancela refetches en curso
   - Guarda snapshot del estado actual
   - Actualiza cache optimísticamente
   - Muestra toast de confirmación

2. **onError**:
   - Restaura snapshot previo
   - Muestra toast de error
   - Registra error en logger

3. **onSettled**:
   - Invalida query del portfolio
   - Fuerza refetch para sincronizar con servidor

**Ejemplo de uso**:
```typescript
const { addTransaction } = usePortfolioMutations();

addTransaction.mutate({
  symbol: 'AAPL',
  quantity: 10,
  purchase_price: 175.50,
  purchase_date: '2024-10-12',
  transaction_type: 'buy',
  userId: user.id
});
```

---

## 📄 Página Principal

### PortfolioPage
**Ubicación**: `pages/portfolio-page.tsx`

Página principal que orquesta todos los componentes del portfolio.

**Estado local**:
```typescript
const [addModalInfo, setAddModalInfo] = useState<AddModalInfo>({
  isOpen: false,
  ticker: null,
  price: null,
});
const [sellModalHolding, setSellModalHolding] = useState<HoldingWithMetrics | null>(null);
```

**Datos del hook usePortfolio**:
- `holdings`: Posiciones actuales
- `transactions`: Historial de transacciones
- `totalPerformance`: Rendimiento total histórico
- `portfolioData`: Datos de mercado de cada activo
- `deleteAsset`: Función para eliminar activo
- `loading`: Estado de carga

**Estructura de la página**:

```tsx
<motion.div> {/* Animación de entrada */}
  {/* Header con icono y título */}
  
  {/* 12 tarjetas de estadísticas */}
  <PortfolioStats />
  
  {/* 2 gráficos (torta y barras) */}
  <PortfolioCharts />
  
  {/* Tabla de posiciones con acciones */}
  <PortfolioView />
  
  {/* Tabla de historial de transacciones */}
  <TransactionHistory />
</motion.div>

{/* Modales */}
<AddTransactionModal />
<SellTransactionModal />
```

**Características**:
- Animación de entrada con Framer Motion
- Skeleton durante carga
- Cálculo de `holdingsWithMetrics` con useMemo
- Manejo de errores con toast notifications
- Integración con TanStack Query

---

## 🔄 Flujo de Datos

### 1. Carga Inicial
```
usePortfolio() 
  → TanStack Query fetch
  → Supabase: transactions + asset_data
  → Procesamiento en hook
  → Estado actualizado
  → Renderizado de componentes
```

### 2. Agregar Transacción
```
AddTransactionModal (submit)
  → usePortfolioMutations().addTransaction.mutate()
  → onMutate: Actualización optimista del cache
  → mutationFn: Insert en Supabase
  → onSuccess: Cache ya actualizado
  → onSettled: Invalidate query
  → Refetch automático de TanStack Query
```

### 3. Vender Activo
```
SellTransactionModal (submit)
  → Validación de cantidad máxima
  → addTransaction.mutate() con type='sell'
  → Mismo flujo que agregar transacción
```

### 4. Eliminar Activo
```
PortfolioView (click eliminar)
  → AlertDialog confirmación
  → deleteAsset(symbol)
  → Supabase: DELETE transactions WHERE symbol
  → Invalidate query
  → Refetch
```

---

## 🎨 Estilos y Temas

### Colores Dinámicos

**Ganancias/Pérdidas**:
- `text-green-500`: Valores positivos
- `text-red-500`: Valores negativos

**Gráficos (CSS Variables)**:
```css
--chart-1 /* Color primario */
--chart-2 /* Verde (ganancias) */
--chart-3 /* Azul */
--chart-4 /* Rojo (pérdidas) */
--chart-5 /* Amarillo */
--chart-6 /* Púrpura */
```

### Responsive Design

**Breakpoints**:
- `sm`: 640px (tablets)
- `md`: 768px (tablets landscape)
- `lg`: 1024px (desktops)

**Grid de Stats**:
- Mobile: 2 columnas
- Tablet: 2 columnas
- Desktop: 4 columnas

**Grid de Charts**:
- Mobile: 1 columna
- Desktop: 2 columnas

---

## 🔌 Integraciones

### Supabase

**Tablas**:
- `transactions`: Historial de operaciones
  - Columns: id, user_id, symbol, quantity, purchase_price, purchase_date, transaction_type
- `asset_data_cache`: Datos de mercado
  - Columns: symbol, current_price, day_change, beta, sharpe_ratio, etc.

**Edge Functions**:
- Cálculo de holdings agregados
- Actualización de datos de mercado

### TanStack Query

**Queries**:
- `['portfolio', userId]`: Datos completos del portfolio

**Mutations**:
- `addTransaction`: Agregar compra/venta

**Configuración**:
- `staleTime`: 5 minutos
- `cacheTime`: 10 minutos
- `refetchOnWindowFocus`: true

### TanStack Table

**Features usadas**:
- Core Row Model
- Sorting
- Pagination (en TransactionHistory)

### Recharts

**Componentes**:
- PieChart con Cell
- BarChart con CartesianGrid
- ResponsiveContainer
- Custom Tooltips

---

## 🧪 Casos de Uso

### 1. Usuario nuevo sin posiciones

**Flujo**:
1. Carga PortfolioPage
2. Ver mensaje "Aún no tienes posiciones abiertas"
3. Ir a Dashboard → Buscar activo → Agregar transacción
4. Volver a Portfolio → Ver nueva posición

### 2. Agregar compra a posición existente

**Flujo**:
1. En PortfolioView, click botón "+" (PlusCircle)
2. Se abre AddTransactionModal con ticker y precio precargados
3. Usuario ingresa cantidad y fecha
4. Click "Guardar Compra"
5. Actualización optimista → Tabla se actualiza inmediatamente
6. Stats se recalculan automáticamente

### 3. Vender parte de una posición

**Flujo**:
1. En PortfolioView, click botón "-" (MinusCircle)
2. Se abre SellTransactionModal con holding seleccionado
3. Modal muestra cantidad máxima vendible
4. Usuario ingresa cantidad ≤ máximo
5. Click "Confirmar Venta"
6. Validación de cantidad
7. Si válido → Actualización optimista
8. Stats se actualizan

### 4. Eliminar activo completo

**Flujo**:
1. En PortfolioView, click botón trash (Trash2)
2. AlertDialog: "¿Estás seguro?"
3. Usuario confirma
4. DELETE de todas las transacciones del símbolo
5. Portfolio se actualiza
6. Si era la única posición → Mensaje "sin posiciones"

### 5. Ver distribución y performance

**Flujo**:
1. Scroll a PortfolioCharts
2. Gráfico de torta muestra % de cada activo
3. Hover sobre slice → Tooltip con valor USD y %
4. Gráfico de barras muestra G/P % de cada activo
5. Verde = ganancia, Rojo = pérdida

---

## ⚡ Optimizaciones

### Performance

1. **useMemo** en cálculos costosos:
   ```typescript
   const metrics = useMemo(() => 
     calculatePortfolioMetrics(holdings, portfolioData), 
     [holdings, portfolioData]
   );
   ```

2. **React.memo** en componentes de tabla y gráficos:
   ```typescript
   export const PortfolioView = React.memo(function PortfolioView(...) {
     // ...
   });
   ```

3. **Actualización optimista** para UX instantánea

4. **Lazy loading** de gráficos (Recharts se carga dinámicamente)

### Bundle Size

**Archivo compilado**: `portfolio-page-DCLQY2Fs.js` → 9.21 kB (3.54 kB gzip)

**Componentes separados**:
- `portfolio-view-D0LWACMm.js` → 34.58 kB (11.76 kB gzip)

**Estrategias**:
- Code splitting por ruta
- Tree shaking de utilidades
- Componentes de UI compartidos

---

## 🐛 Manejo de Errores

### Validaciones en Modales

```typescript
// Fecha futura
if (isFutureDate(date)) {
  toast.error("La fecha de la transacción no puede ser futura.");
  return;
}

// Cantidad máxima en venta
if (finalQuantityInShares > maxShares + 1e-9) {
  throw new Error(`No puedes vender más de lo que posees...`);
}
```

### Errores de Mutación

```typescript
onError: (err, variables, context) => {
  if (context?.previousPortfolio) {
    queryClient.setQueryData(['portfolio', user?.id], context.previousPortfolio);
    toast.error('Falló la operación en el servidor. Revirtiendo cambios.', {
      description: errorToString(err),
    });
    void logger.error('ADD_TRANSACTION_FAILED', err.message, { variables });
  }
}
```

### Estados Vacíos

```typescript
if (holdings.length === 0) {
  return (
    <Card className="text-center py-10">
      <p className="text-muted-foreground">Aún no tienes posiciones abiertas.</p>
      <p className="text-sm text-muted-foreground mt-2">
        Agrega tu primera transacción desde el Dashboard.
      </p>
    </Card>
  );
}
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

**Políticas en Supabase**:
```sql
-- Solo el propietario puede ver sus transacciones
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);

-- Solo el propietario puede insertar transacciones
CREATE POLICY "Users can insert own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Solo el propietario puede eliminar transacciones
CREATE POLICY "Users can delete own transactions"
ON transactions FOR DELETE
USING (auth.uid() = user_id);
```

### Validación de Usuario

```typescript
const { user } = useAuth();
if (!user) return <Navigate to="/auth/login" />;
```

---

## 📈 Métricas Clave

### Beta Ponderado
Mide la volatilidad del portfolio vs. el mercado.
- **< 1**: Menos volátil que el mercado
- **= 1**: Volatilidad igual al mercado
- **> 1**: Más volátil que el mercado

**Cálculo**:
```typescript
portfolioBeta = Σ(beta_i * marketValue_i) / totalValue
```

### Sharpe Ratio Ponderado
Mide el retorno ajustado por riesgo.
- **< 0**: Retorno menor que tasa libre de riesgo
- **0-1**: Retorno bajo por unidad de riesgo
- **1-2**: Retorno aceptable
- **> 2**: Retorno excelente

**Cálculo**:
```typescript
sharpeRatio = Σ(sharpe_i * marketValue_i) / totalValue
```

### P&L Diario (%)
Cambio porcentual del valor del portfolio en el día.

**Cálculo**:
```typescript
dailyPlPercent = (dailyPL / (currentValue - dailyPL)) * 100
```

---

## 🚀 Roadmap Futuro

### Funcionalidades Pendientes

1. **Filtros Avanzados**:
   - Filtrar por tipo de activo (CEDEARs, acciones US, etc.)
   - Filtrar por rango de G/P
   - Ordenar por diferentes métricas

2. **Exportación de Datos**:
   - Exportar historial a CSV
   - Generar reportes PDF
   - Capturas de gráficos

3. **Alertas y Notificaciones**:
   - Alertas de precio objetivo
   - Notificaciones de dividendos próximos
   - Rebalanceo sugerido

4. **Análisis Avanzado**:
   - Comparación con benchmarks (S&P 500, etc.)
   - Análisis de correlación entre activos
   - Simulación de escenarios

5. **Integración con Brokers**:
   - Importar transacciones automáticamente
   - Sincronización de precios en tiempo real

---

## 📚 Recursos

### Documentación Externa

- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [TanStack Table - Sorting](https://tanstack.com/table/latest/docs/guide/sorting)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Componentes de shadcn/ui Usados

- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `DialogDescription`
- `Input`
- `Label`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`
- `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogTrigger`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`
- `Skeleton`
- `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`

---

## 👥 Contribución

Para contribuir a esta feature:

1. Mantén la estructura de carpetas consistente
2. Añade tipos para todas las props nuevas
3. Extrae lógica compleja a utilidades en `lib/`
4. Documenta funciones complejas con JSDoc
5. Usa las funciones de formato existentes
6. Mantén los componentes pequeños y reutilizables
7. Añade validaciones apropiadas en los modales
8. Escribe tests para nuevas utilidades

---

**Última actualización**: Octubre 2024
**Versión**: 2.0.0
**Autor**: Financial Analysis Team
