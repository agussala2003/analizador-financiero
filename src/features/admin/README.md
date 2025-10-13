# Feature: Admin

Panel de administración para gestionar usuarios, logs del sistema y contenido de la plataforma.

## 📁 Estructura

```
admin/
├── pages/
│   └── admin-page.tsx              # Orquestador principal (30 líneas)
├── components/
│   ├── index.ts                    # Barrel export
│   ├── admin-header.tsx            # Header con icono y título
│   ├── admin-tabs.tsx              # Sistema de navegación por tabs
│   ├── users/                      # Sub-feature: Gestión de Usuarios
│   │   ├── admin-users-table.tsx  # Tabla principal con búsqueda
│   │   ├── edit-user-modal.tsx    # Modal de edición de usuario
│   │   └── user-columns.tsx       # Definición de columnas (hook)
│   └── logs/                       # Sub-feature: Logs del Sistema
│       ├── admin-logs-table.tsx   # Tabla principal con filtros
│       ├── log-metadata-modal.tsx # Modal para ver metadatos JSON
│       └── log-columns.tsx        # Definición de columnas (hook)
├── hooks/
│   ├── use-admin-users.ts         # Fetch y estado de usuarios
│   └── use-admin-logs.ts          # Fetch y estado de logs
├── lib/
│   └── admin-utils.ts             # Utilidades (badge variants, formatters)
└── types/
    └── admin-local.types.ts       # Tipos específicos del feature
```

## 🎯 Componentes Principales

### AdminPage (Orquestador)
- **Responsabilidad**: Composición de header + tabs
- **Líneas**: ~30
- **Rol**: Punto de entrada, sin lógica de negocio

### AdminHeader
- **Props**: `title`, `description`
- **Uso**: Header visual consistente con icono Shield

### AdminTabs
- **Responsabilidad**: Navegación entre secciones
- **Secciones**:
  - ✅ **Usuarios**: Gestión completa de perfiles
  - 🔒 **Blogs**: Deshabilitada (próximamente)
  - ✅ **Logs**: Visor de logs del sistema
  - 🔒 **Estadísticas**: Deshabilitada (próximamente)

## 👥 Sub-feature: Users

### AdminUsersTable
- **Hook de datos**: `useAdminUsers()`
- **Funcionalidades**:
  - Búsqueda global con debounce (300ms)
  - Ordenamiento por columnas
  - Paginación
  - Edición inline vía modal
- **Columnas**:
  - Email (sortable, bold)
  - Nombre (sortable)
  - Apellido (sortable)
  - Rol (sortable, badge con variant)
  - Puede Bloggear (Sí/No)
  - Acciones (botón editar)

### EditUserModal
- **Campos editables**:
  - Nombre y Apellido
  - Rol (select: básico/plus/premium/administrador)
  - Permiso de blog (switch)
- **Validación**: Formulario controlado con estado local
- **Persistencia**: Update directo a `profiles` table

### useUserColumns (Hook)
- **Patrón**: Memoización de columnas
- **Props**: `{ onEditUser }`
- **Retorna**: `ColumnDef<AdminUser>[]`

## 📋 Sub-feature: Logs

### AdminLogsTable
- **Hook de datos**: `useAdminLogs()`
- **Funcionalidades**:
  - Búsqueda global con debounce (300ms)
  - Filtro por nivel (INFO/WARN/ERROR/DEBUG)
  - Ordenamiento por fecha (desc por defecto)
  - Paginación
  - Visualización de metadata JSON
- **Columnas**:
  - Fecha (sortable, formato localizado)
  - Nivel (badge con color según severity)
  - Tipo de Evento
  - Mensaje (truncado)
  - Metadata (botón ver, disabled si vacío)

### LogMetadataModal
- **Funcionalidad**: Muestra JSON.stringify con formato
- **Estilos**: Pre-formateado con scroll

### useLogColumns (Hook)
- **Patrón**: Memoización de columnas
- **Props**: `{ onViewMetadata }`
- **Retorna**: `ColumnDef<AdminLog>[]`

## 🎣 Hooks Personalizados

### useAdminUsers()
```typescript
const { users, loading, fetchUsers } = useAdminUsers();
```
- **Fetch**: Al montar el componente
- **Refetch**: Manual vía `fetchUsers()`
- **Error handling**: Toast notifications

### useAdminLogs()
```typescript
const { logs, loading, levelFilter, setLevelFilter } = useAdminLogs();
```
- **Fetch**: Al montar + cuando cambia `levelFilter`
- **Límite**: 1000 logs más recientes
- **Orden**: Descendente por `created_at`

## 🛠️ Utilidades

### admin-utils.ts
- `getLogLevelVariant(level)`: Badge variant según nivel
- `getUserRoleVariant(role)`: Badge variant según rol
- `formatLogDate(isoDate)`: Formato español con hora 24h

## 📊 Integraciones

### Supabase Tables
- **profiles**: CRUD de usuarios (read + update)
- **logs**: Read-only de logs del sistema

### Componentes Compartidos
- `DataTable` (de feature dividends): Tabla reutilizable con paginación
- shadcn/ui: Card, Dialog, Input, Select, Badge, Switch, Skeleton

### Hooks Compartidos
- `useDebounce`: Para búsqueda con delay
- TanStack Table: Para toda la lógica de tablas

## 🔐 Seguridad

- **Acceso**: Solo rol `administrador`
- **Route Guard**: `<AdminRoute>` en main.tsx
- **Validación**: Server-side en Supabase RLS policies

## 📝 Patrones Aplicados

1. **Orquestador**: admin-page.tsx solo compone componentes
2. **Separation of Concerns**:
   - `hooks/` → Lógica de datos
   - `components/` → UI y presentación
   - `lib/` → Funciones puras
3. **Co-location**: Sub-features (users/, logs/) agrupan archivos relacionados
4. **Memoization**: Columnas y callbacks memoizados
5. **Custom Hooks**: Encapsulación de fetch/estado
6. **JSDoc**: Todos los exports documentados

## 🚀 Uso

```tsx
// En main.tsx
import AdminPage from './features/admin/pages/admin-page';

<Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
```

## 📈 Métricas de Refactorización

| Archivo | Antes | Después | Δ |
|---------|-------|---------|---|
| admin-page.tsx | 45 líneas | **30 líneas** | -33% |
| admin-users.tsx | 201 líneas | **Eliminado** | - |
| admin-logs.tsx | 150 líneas | **Eliminado** | - |
| **Total archivos** | 3 | **17** | +467% 📦 |
| **Promedio líneas/archivo** | 132 | **45** | -66% ✨ |

## 🔄 Archivos a Eliminar

Los siguientes archivos antiguos ya no se usan y deben eliminarse:
- `src/features/admin/components/admin-users.tsx`
- `src/features/admin/components/admin-logs.tsx`

## 🎓 Aprendizajes

1. **Sub-features**: Para features complejas, agrupar componentes relacionados en carpetas
2. **Hooks de columnas**: Patrón útil para separar definición de tablas
3. **Utils para variants**: Centralizar lógica de estilos condicionales
4. **Modals auto-contained**: Cada modal es un componente independiente
