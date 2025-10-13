# News Feature

Página de noticias financieras con filtros, paginación y animaciones.

## 📋 Estructura

```
news/
├── types/
│   └── news.types.ts                 # Interfaces de props
├── lib/
│   └── news.utils.ts                 # 9 utilidades
├── components/
│   ├── card/                         # Tarjeta de noticia (1)
│   │   └── news-card.tsx
│   ├── filters/                      # Filtros (1)
│   │   └── news-filters.tsx
│   ├── skeleton/                     # Loading (1)
│   │   └── news-skeleton.tsx
│   └── index.ts                      # Barrel export
└── pages/
    └── news-page.tsx                  # Página principal
```

## 🎯 Componentes Principales

### Card Components

#### `news-card.tsx`
Tarjeta individual de noticia con animación de entrada.

**Props:**
```typescript
interface NewsCardProps {
  news: NewsItem;
  index: number;
}
```

**Características:**
- Animación de entrada escalonada (delay basado en index)
- Card con hover effect (shadow)
- Enlace externo a la noticia (target="_blank")
- Badge con símbolo del activo
- Campos condicionales:
  - Calificación (newGrade)
  - Precio objetivo (priceTarget)
  - Nombre del analista (analystName)
- Footer con compañía y fecha formateada

**Layout:**
- Header: Título + Badge
- Content: Datos opcionales (calificación, precio, analista)
- Footer: Compañía + Fecha (es-AR)

### Filters Components

#### `news-filters.tsx`
Barra de filtros para símbolo y compañía.

**Props:**
```typescript
interface NewsFiltersProps {
  symbolFilter: string;
  onSymbolFilterChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  onClearFilters: () => void;
}
```

**Características:**
- **Input de símbolo:** Búsqueda case-insensitive
- **Input de compañía:** Búsqueda por gradingCompany o analystCompany
- **Botón limpiar:** Resetea ambos filtros
- Icon descriptivo (ListFilter)
- Layout responsive (column en móvil, row en desktop)

### Skeleton Components

#### `news-skeleton.tsx`
Skeleton de carga con 6 tarjetas placeholder.

**Características:**
- Grid responsive (1-3 columnas)
- Estructura similar a NewsCard
- 6 skeletons (header, content, footer)
- Animación pulse automática

## 🛠️ Utilidades

### `news.utils.ts`

```typescript
// Formateo de fechas localizado
formatNewsDate(date: string): string  // es-AR: día mes año hora:minuto

// Obtener nombre de compañía
getCompanyName(news: NewsItem): string  // gradingCompany ?? analystCompany ?? 'N/A'

// Filtrar noticias por símbolo y compañía
filterNews(news: NewsItem[], symbolFilter: string, companyFilter: string): NewsItem[]

// Paginar items genéricos
paginateItems<T>(items: T[], currentPage: number, itemsPerPage: number): T[]

// Calcular total de páginas
calculateTotalPages(totalItems: number, itemsPerPage: number): number

// Validar caché reciente (6 horas)
isCacheValid(lastUpdated: string): boolean

// Ordenar por fecha descendente
sortNewsByDate(news: NewsItem[]): NewsItem[]

// Combinar resultados de múltiples endpoints
combineNewsResults(results: { data?: unknown; error?: unknown }[]): NewsItem[]
```

## 📦 Tipos

### `news.types.ts`

```typescript
// Props para NewsCard
interface NewsCardProps {
  news: NewsItem;
  index: number;
}

// Props para NewsFilters
interface NewsFiltersProps {
  symbolFilter: string;
  onSymbolFilterChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

// Re-export de NewsItem global
export type { NewsItem } from '../../../types/news';
```

**NewsItem (global):**
```typescript
interface NewsItem {
  symbol: string;
  newsTitle: string;
  newsURL: string;
  publishedDate: string;
  newGrade?: string;
  priceTarget?: number;
  analystName?: string;
  gradingCompany?: string;
  analystCompany?: string;
}
```

## 🔄 Flujo de Datos

```
NewsPage
  ├─ useConfig() → Config (endpoints, pageSize)
  ├─ useState → news: NewsItem[]
  ├─ useState → loading: boolean
  ├─ useState → filters (symbol, company)
  ├─ useState → currentPage
  ├─ useEffect → fetchNews()
  │   ├─ Lee caché (CACHE_KEY: 'news_page')
  │   ├─ Valida con isCacheValid() (6h TTL)
  │   ├─ Si no válido:
  │   │   ├─ Fetch 2 endpoints paralelos (priceTarget, grades)
  │   │   ├─ combineNewsResults()
  │   │   ├─ sortNewsByDate()
  │   │   └─ Guarda en caché
  │   └─ Filtra con isNewsItem() type guard
  ├─ useMemo → filteredNews
  │   └─ filterNews(news, symbolFilter, companyFilter)
  ├─ useMemo → currentItems
  │   └─ paginateItems(filteredNews, currentPage, itemsPerPage)
  └─ Renderizado condicional:
      ├─ loading → NewsSkeleton
      └─ !loading →
          ├─ NewsFilters (motion.div)
          ├─ Grid de NewsCard con AnimatePresence
          ├─ Mensaje de "No resultados"
          └─ PaginationDemo
```

## 🎨 Características UX

### Animaciones (Framer Motion)
- **Header:** fade-in desde arriba (0.5s)
- **Filtros:** fade-in desde arriba (0.5s, delay 0.1s)
- **Cards individuales:** fade-in + translateY (delay escalonado por index * 0.05s)
- **Cambio de página:** AnimatePresence con fade (0.2s)

### Filtros
- **Búsqueda en tiempo real:** Sin botón submit
- **Case-insensitive:** Búsqueda flexible
- **Doble filtro:** Símbolo Y compañía (AND logic)
- **Reseteo completo:** Botón limpiar vuelve a página 1

### Paginación
- Tamaño configurable (config.news.pageSize, default 20)
- Navegación con números
- Contador de resultados filtrados
- Reseteo a página 1 al filtrar

### Loading States
- Skeleton de 6 cards durante carga inicial
- Sin indicadores durante filtrado (instantáneo)

### Error Handling
- **Caché fallback:** Si fetch falla, usa caché antiguo + warning toast
- **Sin caché:** Error toast + array vacío
- **Validación de datos:** Type guard isNewsItem()

### Responsive Design
- Grid adaptativo: 1 columna (móvil) → 2 (tablet) → 3 (desktop)
- Filtros: stack vertical (móvil) → horizontal (desktop)
- Cards con altura completa (flex-col h-full)

## 🧪 Dependencias Clave

```json
{
  "react": "^19.0.0",
  "framer-motion": "^11.x",
  "@supabase/supabase-js": "^2.x",
  "sonner": "^1.x"
}
```

## 📊 Métricas

- **Componentes totales:** 3
- **Utilidades:** 8 funciones
- **Tipos locales:** 2 interfaces
- **Endpoints consumidos:** 2 (priceTarget, grades)
- **Líneas de código:** ~350
- **Caché TTL:** 6 horas

## 🚀 Uso

```tsx
import { NewsPage } from '@/features/news/pages/news-page';

// En router
<Route path="/news" element={<NewsPage />} />
```

**O con barrel export:**
```tsx
import { 
  NewsCard, 
  NewsFilters, 
  NewsSkeleton,
  NewsItem // Type
} from '@/features/news/components';
```

## 🔍 Consideraciones

### Performance
- Cache de 6 horas en Supabase
- Fetch único al montar (useEffect con [config])
- Filtrado client-side con useMemo
- Paginación client-side (datos completos en memoria)
- Animaciones optimizadas (delay escalonado)

### Caché Strategy
1. **Primera carga:** Fetch desde API → Guarda en caché
2. **Cargas subsecuentes (<6h):** Lee desde caché
3. **Caché expirado:** Fetch desde API → Actualiza caché
4. **Error en fetch:** Usa caché antiguo + toast.warning
5. **Sin caché:** Error toast

### Endpoints Combinados
- **newsPriceTarget:** Noticias con price targets
- **newsGrades:** Noticias con calificaciones de analistas
- **Merge:** combineNewsResults() + sortNewsByDate()

### Type Safety
- Type guard `isNewsItem()` para validar datos de API
- Defensive checks en combinación de resultados
- Validación de campos opcionales (newGrade, priceTarget, etc.)
- Tipado estricto en utilidades genéricas

### Accesibilidad
- Enlaces externos con rel="noopener noreferrer"
- Placeholders descriptivos en inputs
- Hover states claros
- Keyboard navigation en filtros

### Mantenibilidad
- **Separación clara:** Card, Filters, Skeleton en subdirectorios
- **Utilidades reutilizables:** Formateo, filtrado, paginación genéricos
- **Props explícitas:** Todas las interacciones por callbacks
- **Animaciones centralizadas:** Configuración en componentes

## 📝 Notas de Refactorización

**Cambios realizados:**
1. Extracción de NewsCard a componente separado
2. Extracción de Filtros a componente modular
3. Extracción de Skeleton a componente reutilizable
4. Creación de `news.types.ts` (2 interfaces)
5. Extracción de 8 utilidades a `news.utils.ts`:
   - Formateo de fechas y compañías
   - Filtrado y paginación
   - Validación de caché
   - Ordenamiento y combinación
6. Barrel export en `components/index.ts`
7. Simplificación de lógica en NewsPage

**Antes:** 1 archivo monolítico (266 líneas)  
**Después:** 7 archivos modulares (~350 líneas total, mejor organizadas)

**Beneficios:**
- Componentes reutilizables (NewsCard puede usarse en otras vistas)
- Lógica de negocio centralizada en utils
- Código más testeable
- Mejor separación de concerns

---

**Última actualización:** Enero 2025  
**Versión:** 2.0 (Refactorización completa)
