# Dividends Feature

Calendario de dividendos con filtros avanzados, paginación y modal de cálculo.

## 📋 Estructura

```
dividends/
├── types/
│   └── dividends.types.ts            # Interfaces y tipos
├── lib/
│   └── dividends.utils.ts            # 10 utilidades
├── components/
│   ├── table/                        # Componentes de tabla (2)
│   │   ├── columns.tsx
│   │   └── data-table.tsx
│   ├── filters/                      # Filtros (1)
│   │   └── dividends-filters.tsx
│   ├── skeleton/                     # Loading (1)
│   │   └── dividends-skeleton.tsx
│   └── index.ts                      # Barrel export
└── pages/
    └── dividends-page.tsx             # Página principal
```

## 🎯 Componentes Principales

### Table Components

#### `columns.tsx`
Definición de columnas para react-table con columnas tipo calculables y filtros personalizados.

**Exports:**
```typescript
export const columns: ColumnDef<Dividend>[];
```

**Características:**
- 7 columnas: Symbol, Ex-Date, Payment Date, Declaration Date, Dividend, Yield, Frequency
- Modal de calculadora integrado en columna Symbol
- Ordenamiento en columnas de cabecera
- Filtro personalizado de rango de fechas en Payment Date
- Formateo localizado (es-ES) para fechas
- Formateo de moneda y porcentajes
- Capitalización de frecuencia

**Uso de utilidades:**
- `dateInRangeFilterFn` - Filtro custom para DateRange
- `formatDateES` - Formato dd/mm/aaaa en español
- `formatCurrency` - $XX.XX
- `formatPercentage` - XX.XX%
- `capitalizeFrequency` - Lowercase con capitalize CSS

#### `data-table.tsx`
Tabla genérica reutilizable con paginación.

**Props:**
```typescript
interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}
```

**Características:**
- Componente genérico con `<TData>`
- Renderizado condicional de filas
- Mensaje de "No hay resultados" cuando está vacío
- Paginación integrada con `PaginationDemo`
- Contador de resultados filtrados
- Responsive con horizontal scroll

**Nota:** Este componente es **reutilizado** en otras features:
- `admin` (logs y users tables)
- `portfolio` (transaction history)
- `risk-premium` (tabla de países)

### Filters Components

#### `dividends-filters.tsx`
Barra de filtros completa con todos los controles.

**Props:**
```typescript
interface DividendsFiltersProps {
  symbolFilter: string;
  onSymbolFilterChange: (value: string) => void;
  paymentDateRange: DateRange | undefined;
  onPaymentDateRangeChange: (range: DateRange | undefined) => void;
  frequencyFilter: string;
  onFrequencyFilterChange: (value: string) => void;
  frequencyOptions: string[];
  activeFiltersCount: number;
  onClearAllFilters: () => void;
}
```

**Características:**
- **Input de símbolo:** Búsqueda por ticker
- **Rango de fechas (2 calendarios):**
  - Fecha desde (paymentDateRange.from)
  - Fecha hasta (paymentDateRange.to)
  - Formato dd/MM/yy
  - Locale español (es)
- **Select de frecuencia:** Quarterly, Annual, Monthly, etc.
- **Botón limpiar:** Aparece solo si hay filtros activos
- Layout responsive (column en móvil, row en desktop)

### Skeleton Components

#### `dividends-skeleton.tsx`
Skeleton de carga para la tabla completa.

**Características:**
- Card con CardHeader (4 skeletons de filtros)
- CardContent (10 skeletons de filas)
- Alturas variables para simular UI real
- Animación pulse automática de shadcn/ui

## 🛠️ Utilidades

### `dividends.utils.ts`

```typescript
// Filtro personalizado de rango de fechas
dateInRangeFilterFn(row, columnId, filterValue: DateRange): boolean

// Formateo de fechas a español
formatDateES(value: string | number | Date): string

// Formateo de moneda USD
formatCurrency(value: unknown): string

// Formateo de porcentaje
formatPercentage(value: unknown): string

// Capitalización de frecuencia
capitalizeFrequency(frequency: unknown): string

// Extracción de frecuencias únicas
extractUniqueFrequencies(dividends: Dividend[]): string[]

// Validación de configuración
validateConfig(config: unknown): boolean

// Obtener endpoint de dividendos
getDividendsEndpoint(config: unknown): string
```

## 📦 Tipos

### `dividends.types.ts`

```typescript
// Tipo principal de dividendo
interface Dividend {
  symbol: string;
  date: string;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
  adjDividend: number;
  dividend: number;
  yield: number;
  frequency: string;
}

// Props de DataTable genérica
interface DataTableProps<TData> {
  table: TanstackTable<TData>;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Props de filtros
interface DividendsFiltersProps { ... }

// Cache de Supabase
interface AssetDataCacheRow {
  data?: unknown;
  last_updated_at: string;
}
```

## 🔄 Flujo de Datos

```
DividendsPage
  ├─ useConfig() → Config (API endpoints)
  ├─ useState → data: Dividend[]
  ├─ useState → loading: boolean
  ├─ useState → filters (symbol, dateRange, frequency)
  ├─ useEffect → fetchDividends()
  │   ├─ Intenta leer caché (24h TTL)
  │   ├─ Si no hay caché o está expirado:
  │   │   ├─ validateConfig(config)
  │   │   ├─ getDividendsEndpoint(config)
  │   │   ├─ supabase.functions.invoke('fmp-proxy')
  │   │   └─ Guarda en caché
  │   └─ Filtra con isDividend() type guard
  ├─ useReactTable() → table instance
  │   ├─ sorting, columnFilters, pagination
  │   └─ 4 row models (core, sorted, filtered, paginated)
  └─ Renderizado condicional:
      ├─ loading → DividendsSkeleton
      └─ !loading →
          ├─ Card > CardHeader > DividendsFilters
          └─ Card > CardContent > DataTable
```

## 🎨 Características UX

### Filtros
- **3 tipos de filtros:**
  1. Texto libre (símbolo)
  2. Rango de fechas (desde/hasta)
  3. Select (frecuencia)
- **Persistencia de estado:** Filtros se mantienen al ordenar o paginar
- **Indicador visual:** Botón "Limpiar" solo aparece cuando hay filtros activos

### Paginación
- Controlada por react-table
- 10 resultados por página (configurable)
- Contador de resultados filtrados
- Navegación con números de página

### Loading States
- Skeleton en carga inicial
- Sin indicadores durante filtrado (instantáneo)

### Modal de Calculadora
- Botón en cada fila (columna Symbol)
- Abre `<CalculateDividendModal>` desde `@/components/ui`
- Permite calcular dividendos estimados por cantidad de acciones

### Responsive Design
- Tabla con horizontal scroll en móvil
- Filtros apilados verticalmente en móvil
- Input de símbolo full-width en móvil, max-width en desktop

## 🧪 Dependencias Clave

```json
{
  "react": "^19.0.0",
  "@tanstack/react-table": "^8.x",
  "react-day-picker": "^9.x",
  "date-fns": "^3.x",
  "framer-motion": "^11.x",
  "@supabase/supabase-js": "^2.x"
}
```

## 📊 Métricas

- **Componentes totales:** 4
- **Utilidades:** 8 funciones
- **Tipos:** 4 interfaces
- **Líneas de código:** ~500
- **Columnas de tabla:** 7
- **Filtros disponibles:** 3

## 🚀 Uso

```tsx
import { DividendsPage } from '@/features/dividends/pages/dividends-page';

// En router
<Route path="/dividends" element={<DividendsPage />} />
```

**O con barrel export:**
```tsx
import { 
  columns, 
  DataTable, 
  DividendsFilters, 
  DividendsSkeleton,
  Dividend // Type
} from '@/features/dividends/components';
```

## 🔍 Consideraciones

### Performance
- Cache de 24 horas en Supabase (`asset_data_cache`)
- Fetch único al montar (useEffect con [config])
- Filtrado client-side (react-table)
- Paginación client-side (datos completos en memoria)

### Caché Strategy
1. **Primera carga:** Fetch desde API → Guarda en caché
2. **Cargas subsecuentes (<24h):** Lee desde caché
3. **Caché expirado:** Fetch desde API → Actualiza caché
4. **Error en fetch:** Usa caché antiguo + toast.warning

### Type Safety
- Type guard `isDividend()` para validar datos de API
- Defensive checks en configuración
- `unknown` types con validación explícita
- Strict null checks en formateo de fechas

### Accesibilidad
- Labels implícitos en inputs
- Placeholders descriptivos
- Tooltips en botones de acción (Calculator icon)
- Keyboard navigation en filtros

### Mantenibilidad
- **DataTable genérica:** Reutilizada en 4 features diferentes
- **Utilidades centralizadas:** Formateo y validación en `lib/`
- **Tipos explícitos:** Todas las props tipadas
- **Separación de concerns:** Filters, Table, Skeleton en subdirectorios

## 📝 Notas de Refactorización

**Cambios realizados:**
1. Reorganización en subdirectorios por tipo (table/, filters/, skeleton/)
2. Creación de `dividends.types.ts` (4 interfaces)
3. Extracción de 8 utilidades a `dividends.utils.ts`
4. Modularización de filtros en componente separado
5. Modularización de skeleton en componente separado
6. Barrel export en `components/index.ts`
7. Actualización de imports en archivos dependientes:
   - `admin` (logs y users)
   - `portfolio` (transaction-history)
   - `risk-premium` (tabla de países)
   - `utils/type-guards.ts`

**Antes:** 2 componentes en `components/`  
**Después:** 4 componentes en 3 subdirectorios + types + lib

**Reusabilidad:** `DataTable` es utilizada por 4 features distintas, justificando su ubicación en `dividends` como feature base de tablas.

---

**Última actualización:** Enero 2025  
**Versión:** 2.0 (Refactorización completa)
