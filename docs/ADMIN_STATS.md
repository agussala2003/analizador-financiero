# Panel de Estadísticas - Documentación

## 📊 Descripción General

El Panel de Estadísticas es un sistema completo de métricas y análisis que proporciona información detallada sobre el uso y rendimiento de la plataforma Financytics.

## 🎯 Características Principales

### Filtros Temporales
- **Últimas 24 horas**: Datos en tiempo casi real
- **Últimos 7 días**: Tendencias semanales
- **Últimos 30 días**: Análisis mensual (por defecto)
- **Últimos 3 meses**: Tendencias trimestrales
- **Último año**: Análisis anual
- **Todo el tiempo**: Histórico completo

### Secciones de Estadísticas

#### 1. 👥 Usuarios
**Métricas Principales:**
- Total de usuarios registrados
- Nuevos usuarios en el período
- Usuarios activos (con actividad en logs)
- Usuarios con permiso para crear blogs

**Visualizaciones:**
- Distribución por roles (basico, plus, premium, administrador)
- Gráfico de barras con porcentajes
- Badges con códigos de color por rol

#### 2. 📝 Blog
**Métricas Principales:**
- Total de artículos publicados
- Total de likes en todos los artículos
- Total de comentarios
- Total de guardados (bookmarks)

**Visualizaciones:**
- **Artículos por Estado:**
  - Borrador (gris)
  - En Revisión (amarillo)
  - Aprobado (verde)
  - Rechazado (rojo)
- **Top Autores:** Los 5 autores con más artículos publicados

#### 3. 💼 Portfolio
**Métricas Principales:**
- Total de transacciones registradas
- Símbolos únicos negociados
- Usuarios con portafolios activos

**Visualizaciones:**
- **Top 10 Símbolos:** Activos más negociados con conteo de transacciones
- Ranking con badges

#### 4. ⭐ Watchlist
**Métricas Principales:**
- Total de items en watchlists
- Símbolos únicos guardados
- Usuarios con watchlists

**Visualizaciones:**
- **Símbolos Más Guardados:** Top 5 activos en watchlists
- Conteo de usuarios por símbolo

#### 5. 💡 Sugerencias
**Métricas Principales:**
- Total de sugerencias recibidas
- Distribución por estado (pending, reviewed, implemented)

**Visualizaciones:**
- **Sugerencias Recientes:** Últimas 5 sugerencias con estado y fecha
- Badges de estado

#### 6. 🔒 Actividad y Seguridad
**Métricas de Autenticación:**
- Intentos de login totales
- Logins exitosos
- Logins fallidos (seguridad)
- Nuevos registros

**Métricas de Logs:**
- Total de eventos registrados
- Errores (nivel ERROR)
- Advertencias (nivel WARN)
- Tipos de eventos únicos

**Visualizaciones:**
- **Logs por Nivel:** Distribución INFO/WARN/ERROR/DEBUG con colores
- **Eventos Más Frecuentes:** Top 8 tipos de eventos
- **Errores Más Frecuentes:** Errores agrupados con:
  - Tipo de evento
  - Mensaje descriptivo
  - Número de ocurrencias
  - Última ocurrencia (fecha y hora)

## 🎨 Diseño de UI

### Componentes Utilizados

#### StatCard
Tarjeta de métrica individual con:
- Título descriptivo
- Valor destacado (grande y bold)
- Descripción contextual
- Ícono representativo
- Soporte para tendencias (opcional)

```tsx
<StatCard
  title="Total Usuarios"
  value={1250}
  icon={Users}
  description="Registrados"
/>
```

#### Cards de Detalles
Tarjetas con información expandida:
- Headers con títulos
- Listas con datos tabulados
- Gráficos de barras integrados
- Badges para categorías

### Paleta de Colores

**Niveles de Log:**
- 🔵 INFO: Azul (`bg-blue-500`)
- 🟡 WARN: Amarillo (`bg-yellow-500`)
- 🔴 ERROR: Rojo (`bg-red-500`)
- ⚫ DEBUG: Gris (`bg-gray-500`)

**Estados de Blog:**
- ⚫ Borrador: Gris (`bg-gray-500`)
- 🟡 En Revisión: Amarillo (`bg-yellow-500`)
- 🟢 Aprobado: Verde (`bg-green-500`)
- 🔴 Rechazado: Rojo (`bg-red-500`)

## 🔧 Implementación Técnica

### Arquitectura

```
src/features/admin/
├── hooks/
│   └── use-admin-stats.ts          # Hook principal con queries
├── components/
│   └── stats/
│       ├── stat-card.tsx            # Componente de tarjeta
│       └── admin-stats-section.tsx  # Panel completo
└── admin-tabs.tsx                   # Integración en tabs
```

### Hook: `useAdminStats`

**Parámetros:**
- `dateRange: DateRange` - Rango temporal para filtrar datos

**Retorna:**
```typescript
{
  stats: AdminStats | null,
  isLoading: boolean,
  error: string | null,
  refetch: () => Promise<void>
}
```

**Queries Ejecutadas:**
1. `fetchUserStats()` - Estadísticas de usuarios
2. `fetchBlogStats()` - Estadísticas del blog
3. `fetchPortfolioStats()` - Estadísticas de portafolios
4. `fetchWatchlistStats()` - Estadísticas de watchlists
5. `fetchSuggestionStats()` - Estadísticas de sugerencias
6. `fetchLogStats()` - Análisis de logs
7. `fetchActivityStats()` - Actividad de autenticación

**Optimización:**
- Todas las queries se ejecutan en paralelo usando `Promise.all`
- Uso de `count: 'exact'` para conteos eficientes
- Agregaciones en JavaScript para métricas complejas

### Tablas de Supabase Utilizadas

| Tabla | Uso |
|-------|-----|
| `profiles` | Usuarios, roles, permisos |
| `blogs` | Artículos del blog |
| `blog_likes` | Likes en artículos |
| `blog_comments` | Comentarios |
| `blog_bookmarks` | Artículos guardados |
| `transactions` | Transacciones de portfolio |
| `watchlist` | Símbolos guardados |
| `suggestions` | Sugerencias de usuarios |
| `logs` | Eventos del sistema |

## 📈 Métricas Calculadas

### Usuarios Activos
Usuarios que tienen al menos un evento en la tabla `logs` dentro del rango temporal seleccionado.

```typescript
const { data: activeLogs } = await supabase
  .from('logs')
  .select('user_id')
  .gte('created_at', dateRange.start.toISOString())
  .lte('created_at', dateRange.end.toISOString());

const activeUsers = new Set(activeLogs.map(log => log.user_id)).size;
```

### Top Símbolos
Agregación de símbolos más frecuentes:

```typescript
const symbolCounts: Record<string, number> = {};
symbolsData.forEach((item) => {
  symbolCounts[item.symbol] = (symbolCounts[item.symbol] || 0) + 1;
});
const topSymbols = Object.entries(symbolCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10);
```

### Errores Agrupados
Errores agrupados por tipo con conteo:

```typescript
const errorCounts: Record<string, { message, created_at, count }> = {};
errorData.forEach((item) => {
  if (!errorCounts[item.event_type]) {
    errorCounts[item.event_type] = { 
      message: item.message, 
      created_at: item.created_at, 
      count: 0 
    };
  }
  errorCounts[item.event_type].count++;
});
```

## 🚀 Performance

### Optimizaciones Implementadas

1. **Queries Paralelas:**
   - 7 queries ejecutadas simultáneamente
   - Tiempo total ≈ tiempo de la query más lenta

2. **Conteos Eficientes:**
   ```typescript
   .select('id', { count: 'exact', head: true })
   ```

3. **Agregaciones Client-Side:**
   - Grouping y sorting en JavaScript
   - Reduce carga en la base de datos

4. **Memoización:**
   - `useMemo` para cálculo de `dateRange`
   - Evita re-renders innecesarios

### Tiempos Estimados

| Cantidad de Datos | Tiempo de Carga |
|-------------------|-----------------|
| < 1000 registros  | ~500ms          |
| 1000-10000        | ~1-2s           |
| > 10000           | ~2-4s           |

## 🎯 Casos de Uso

### Para Administradores
1. **Monitoreo de Crecimiento:**
   - Usuarios nuevos vs activos
   - Tendencias mensuales/anuales

2. **Engagement del Blog:**
   - Artículos más populares (likes/comentarios)
   - Autores más prolíficos
   - Estado de moderación

3. **Seguridad:**
   - Intentos de login fallidos
   - Errores frecuentes
   - Actividad sospechosa

4. **Performance:**
   - Tipos de errores más comunes
   - Features más utilizados
   - Cuellos de botella

### Para Toma de Decisiones
1. **Product Management:**
   - Features más usadas (portfolio vs watchlist)
   - Símbolos de mayor interés

2. **Content Strategy:**
   - Engagement del blog
   - Tipos de contenido populares

3. **Technical Debt:**
   - Errores recurrentes
   - Áreas problemáticas

## 🔮 Futuras Mejoras

### Próximas Funcionalidades
1. **Gráficos Visuales:**
   - Integración con Recharts o Chart.js
   - Gráficos de líneas para tendencias temporales
   - Gráficos de torta para distribuciones

2. **Exportación de Datos:**
   - Descarga en CSV/Excel
   - Generación de reportes PDF

3. **Alertas Automáticas:**
   - Notificaciones de errores críticos
   - Alertas de caída en métricas

4. **Comparativas:**
   - Comparación entre períodos
   - Benchmarking histórico

5. **Drill-down:**
   - Click en métricas para ver detalles
   - Filtros adicionales por usuario/feature

### Optimizaciones Pendientes
1. **Caching:**
   - Cache de estadísticas con TTL
   - Invalidación selectiva

2. **Queries Incrementales:**
   - Solo cargar datos nuevos
   - Delta updates

3. **Lazy Loading:**
   - Cargar secciones bajo demanda
   - Scroll infinito para listas

## 📝 Mantenimiento

### Agregar Nueva Métrica

1. **Actualizar interfaces en `use-admin-stats.ts`:**
```typescript
export interface NewFeatureStats {
  total: number;
  // ... otras métricas
}
```

2. **Crear función fetch:**
```typescript
const fetchNewFeatureStats = async (): Promise<NewFeatureStats> => {
  const { count: total } = await supabase
    .from('new_table')
    .select('id', { count: 'exact', head: true });
  
  return { total: total ?? 0 };
};
```

3. **Agregar a Promise.all:**
```typescript
const [
  // ... existing,
  newFeatureData
] = await Promise.all([
  // ... existing,
  fetchNewFeatureStats()
]);
```

4. **Actualizar UI en `admin-stats-section.tsx`:**
```tsx
<StatCard
  title="Nueva Métrica"
  value={stats.newFeature.total}
  icon={NewIcon}
/>
```

## 🐛 Debugging

### Logs de Desarrollo
```typescript
console.log('Stats loaded:', stats);
console.log('Date range:', dateRange);
console.log('Error:', error);
```

### Errores Comunes

**Error: "No errors found" en logs**
- Verificar que existan eventos ERROR en el período
- Revisar tabla `logs` en Supabase

**Error: "Cannot read property 'length' of null"**
- Agregar validaciones de null: `data ?? []`
- Usar optional chaining: `data?.length`

**Queries lentas:**
- Revisar índices en Supabase
- Considerar agregar índices en: `created_at`, `user_id`, `event_type`

## ✅ Testing

### Checklist de Verificación
- [ ] Todas las métricas muestran valores correctos
- [ ] Filtros temporales funcionan correctamente
- [ ] No hay errores de TypeScript
- [ ] UI responsive en móvil
- [ ] Loading states visibles
- [ ] Error states manejados
- [ ] Todos los gráficos renderizan
- [ ] Performance aceptable (< 5s)

---

**Versión:** 1.0  
**Última actualización:** Octubre 13, 2025  
**Autor:** Sistema de Administración Financytics
