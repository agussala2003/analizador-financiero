# Loading Skeleton System

## 📊 Resumen

Implementación completa de skeleton loaders para mejorar la percepción de velocidad y UX durante la carga de contenido.

## 🎯 Objetivo

Reemplazar los loading spinners genéricos con skeletons que coinciden con el layout real del contenido, dando al usuario una mejor indicación de lo que está por cargar.

## 📦 Componentes Implementados

### Base Components

#### 1. `Skeleton` (Base)
```tsx
// src/components/ui/skeleton.tsx
<Skeleton className="h-4 w-32" />
```
- Componente primitivo con animación pulse
- Usado por todos los demás skeletons
- Personalizable con className

#### 2. `PageSkeleton`
```tsx
// src/components/ui/page-skeleton.tsx
<PageSkeleton />
```
- **Uso**: Fallback genérico para páginas
- Layout estándar: header + card + grid
- Usado en: News, Dividends, Profile, Risk Premium, Suggestions, Retirement, Admin

#### 3. `AuthPageSkeleton`
```tsx
<AuthPageSkeleton />
```
- **Uso**: Páginas de autenticación (Login, Register, Forgot Password, Reset Password)
- Layout centrado con formulario
- Más minimalista que PageSkeleton

#### 4. `TableSkeleton`
```tsx
// src/components/ui/table-skeleton.tsx
<TableSkeleton rows={5} columns={4} showHeader={true} />
```
- **Props**:
  - `rows`: Número de filas (default: 5)
  - `columns`: Número de columnas (default: 4)
  - `showHeader`: Mostrar header (default: true)
  - `showCard`: Envolver en Card (default: true)
- **Uso**: Tablas de datos genéricas
- Efecto fade en filas para mejor visual

### Feature-Specific Skeletons

#### 5. `DashboardSkeleton`
```tsx
// src/features/dashboard/components/skeleton/dashboard-skeleton.tsx
<DashboardSkeleton />
```
- **Layout**:
  - Header con título y botón de acción
  - 4 KPI cards en grid
  - Chart principal grande (2 columnas)
  - 2 analysis charts
  - Tabla de assets con 5 filas
- **Usado en**: `/dashboard`

#### 6. `PortfolioSkeleton`
```tsx
// src/features/portfolio/components/skeleton/portfolio-skeleton.tsx
<PortfolioSkeleton />
```
- **Layout**:
  - Header con icono y texto
  - 12 stats cards en grid responsive
  - 2 charts grandes
  - Tabla de holdings
  - Historial de transacciones
- **Usado en**: `/portfolio`

#### 7. `AssetDetailSkeleton`
```tsx
// src/features/asset-detail/components/skeleton/asset-detail-skeleton.tsx
<AssetDetailSkeleton />
```
- **Layout**:
  - Breadcrumb navigation
  - Header con logo y detalles
  - 6 métricas clave en grid
  - 2 tarjetas de valoración
  - Tabs
  - Contenido principal
- **Usado en**: `/asset/:symbol`

#### 8. `DividendsSkeleton`
```tsx
// src/features/dividends/components/skeleton/dividends-skeleton.tsx
<DividendsSkeleton />
```
- **Layout**:
  - Filtros (4 elementos)
  - Tabla con 10 filas
- **Usado en**: `/dividends`

#### Otros skeletons existentes:
- `NewsSkeleton` - Para artículos de noticias
- `ProfileSkeleton` - Para página de perfil
- `RiskPremiumSkeleton` - Para cálculo de prima de riesgo
- `SuggestionsSkeleton` - Para sugerencias de inversión

## 🎨 Patrones de Diseño

### 1. Layout Matching
Los skeletons deben coincidir con el layout real:
```tsx
// ✅ Bueno: Coincide con el contenido real
<Skeleton className="h-8 w-48" /> // Title
<Skeleton className="h-4 w-64" /> // Subtitle

// ❌ Malo: No refleja la estructura
<Skeleton className="h-20 w-full" /> // Bloque genérico
```

### 2. Progresión Visual
```tsx
// Array.from para crear múltiples elementos
{Array.from({ length: 4 }).map((_, i) => (
  <Skeleton key={i} className="h-24 w-full" />
))}
```

### 3. Responsive Design
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Skeletons responsive */}
</div>
```

### 4. Fade Effect (Opcional)
```tsx
<Skeleton 
  style={{ opacity: 1 - (index * 0.1) }} 
  className="h-4 w-full"
/>
```

## 🔄 Implementación en Rutas

### Antes
```tsx
// main.tsx
{ 
  path: "dashboard", 
  element: <Suspense fallback={<LoadingScreen />}>
    <DashboardPage />
  </Suspense> 
}
```

### Después
```tsx
// main.tsx
{ 
  path: "dashboard", 
  element: <Suspense fallback={<DashboardSkeleton />}>
    <DashboardPage />
  </Suspense> 
}
```

## 📊 Mapeo de Rutas → Skeletons

| Ruta | Skeleton | Componente |
|------|----------|------------|
| `/` | `PageSkeleton` | `InfoPage` |
| `/login` | `AuthPageSkeleton` | `LoginPage` |
| `/register` | `AuthPageSkeleton` | `RegisterPage` |
| `/forgot-password` | `AuthPageSkeleton` | `ForgotPasswordPage` |
| `/reset-password` | `AuthPageSkeleton` | `ResetPasswordPage` |
| `/dashboard` | `DashboardSkeleton` | `DashboardPage` |
| `/asset/:symbol` | `AssetDetailSkeleton` | `AssetDetailPage` |
| `/portfolio` | `PortfolioSkeleton` | `PortfolioPage` |
| `/dividends` | `PageSkeleton` | `DividendsPage` |
| `/news` | `PageSkeleton` | `NewsPage` |
| `/profile` | `PageSkeleton` | `ProfilePage` |
| `/risk-premium` | `PageSkeleton` | `RiskPremiumPage` |
| `/suggestions` | `PageSkeleton` | `SuggestionsPage` |
| `/retirement-calculator` | `PageSkeleton` | `RetirementCalculatorPage` |
| `/admin` | `PageSkeleton` | `AdminPage` |
| `*` | `PageSkeleton` | `NotFoundPage` |

## 🚀 Beneficios

### 1. Mejor UX
- ✅ Usuario ve la estructura del contenido inmediatamente
- ✅ No hay pantallas en blanco
- ✅ Reduce la percepción de tiempo de carga
- ✅ Más profesional que un spinner

### 2. Performance
- ✅ Los skeletons cargan instantáneamente (son componentes simples)
- ✅ No impactan el bundle size significativamente
- ✅ Reutilizables en múltiples páginas

### 3. Consistencia
- ✅ Todos los loading states son consistentes
- ✅ Fácil de mantener (componentes centralizados)
- ✅ Escalable para nuevas páginas

## 📈 Métricas

### Bundle Impact
```
Antes: 
- LoadingScreen usado en todas las rutas
- Bundle: Sin cambio significativo

Después:
- Skeletons específicos por ruta
- Bundle: +5.52 kB (index aumentó de 239.40kB → 244.92kB)
- Impact: +2.3% (aceptable por mejor UX)
```

### Build Time
```
Antes: 5.64s
Después: 5.08s ✅ (-0.56s)
```

## 🎯 Mejores Prácticas

### 1. Crear Skeleton Específico
Para componentes complejos o muy usados:
```tsx
// src/features/myfeature/components/skeleton/myfeature-skeleton.tsx
export function MyFeatureSkeleton() {
  return (
    <div className="space-y-4">
      {/* Layout específico */}
    </div>
  );
}
```

### 2. Usar PageSkeleton como Fallback
Para páginas simples o poco frecuentes:
```tsx
<Suspense fallback={<PageSkeleton />}>
  <SimpleComponent />
</Suspense>
```

### 3. TableSkeleton para Datos Tabulares
```tsx
<TableSkeleton rows={10} columns={6} showHeader={true} />
```

### 4. Composición
Combina skeletons primitivos para crear layouts complejos:
```tsx
export function ComplexSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid gap-4 md:grid-cols-2">
        <TableSkeleton rows={5} />
        <Card>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 🔧 Mantenimiento

### Actualizar un Skeleton
1. Identifica el archivo en `src/features/[feature]/components/skeleton/`
2. Ajusta el layout para que coincida con el componente real
3. Prueba con lazy loading lento: Chrome DevTools → Network → Slow 3G

### Crear Nuevo Skeleton
```bash
# 1. Crear archivo
touch src/features/myfeature/components/skeleton/myfeature-skeleton.tsx

# 2. Implementar
export function MyFeatureSkeleton() {
  return <div>...</div>;
}

# 3. Exportar desde index
// src/features/myfeature/components/index.ts
export { MyFeatureSkeleton } from './skeleton/myfeature-skeleton';

# 4. Usar en ruta
import { MyFeatureSkeleton } from './features/myfeature/components';
<Suspense fallback={<MyFeatureSkeleton />}>
```

## 🧪 Testing

### Manual Testing
```bash
# 1. Dev mode con throttling
npm run dev

# 2. Chrome DevTools
# Network → Slow 3G
# Navega entre páginas

# 3. Verifica
# - Skeletons aparecen instantáneamente
# - Layout coincide con contenido real
# - Transición suave skeleton → contenido
```

### Automated Testing (Futuro)
```tsx
describe('DashboardSkeleton', () => {
  it('renders without crashing', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container).toMatchSnapshot();
  });
});
```

## 📝 Changelog

### v1.0.0 - 13 Oct 2025
- ✅ Mejorado `DashboardSkeleton` con layout detallado
- ✅ Creado `PageSkeleton` y `AuthPageSkeleton`
- ✅ Creado `TableSkeleton` reutilizable
- ✅ Reemplazado `LoadingScreen` en todas las rutas de `main.tsx`
- ✅ Documentación completa
- ✅ Build time mejorado: 5.64s → 5.08s
- ✅ 0 errores TypeScript

## 🔗 Referencias

- [Skeleton UI Pattern](https://www.nngroup.com/articles/skeleton-screens/)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [shadcn/ui Skeleton](https://ui.shadcn.com/docs/components/skeleton)

---

**Fecha**: 13 de Octubre, 2025  
**Versión**: 1.0.0  
**Build time**: 5.08s  
**Bundle size**: +2.3% (mejor UX justifica el aumento)
