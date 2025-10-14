# 📝 Estados de Sugerencias - Actualización

## ✅ Estados Correctos

Los estados de las sugerencias son:

| Estado | Descripción | Ícono | Color Badge |
|--------|-------------|-------|-------------|
| `nueva` | Sugerencia recién creada, sin revisar | 🕐 Clock | Outline (gris) |
| `en revisión` | Sugerencia siendo evaluada por el equipo | 🕐 Clock | Secondary (azul claro) |
| `planeada` | Sugerencia aprobada, planificada para implementar | 📅 Calendar | Default (azul) |
| `completada` | Sugerencia implementada y completada | ✅ CheckCircle | Default (azul) |
| `rechazada` | Sugerencia rechazada, no se implementará | ❌ XCircle | Destructive (rojo) |

## 🔄 Flujo de Estados

```
nueva → en revisión → planeada → completada
  ↓          ↓           ↓
rechazada  rechazada  rechazada
```

## 🎨 Componentes Actualizados

### Interface TypeScript
```typescript
interface Suggestion {
  id: string;
  content: string;
  status: 'nueva' | 'en revisión' | 'planeada' | 'completada' | 'rechazada';
  upvotes: number;
  created_at: string;
  user_id: string | null;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}
```

### Badges
- **Nueva**: Badge outline con ícono Clock
- **En Revisión**: Badge secondary con ícono Clock
- **Planeada**: Badge default con ícono Calendar
- **Completada**: Badge default con ícono CheckCircle
- **Rechazada**: Badge destructive con ícono XCircle

## 📦 Enum en Supabase

Tu enum `suggestion_status` debe tener estos valores:

```sql
CREATE TYPE public.suggestion_status AS ENUM (
    'nueva',
    'en revisión',
    'planeada',
    'completada',
    'rechazada'
);
```

**Nota**: Si tu enum actual tiene `'en_revision'` o `'aprobada'` en lugar de `'en revisión'` y `'planeada'`, necesitarás actualizar los datos existentes o recrear el enum.

## 🔍 Verificación

Para verificar los valores actuales del enum en Supabase:

```sql
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'suggestion_status'
ORDER BY e.enumsortorder;
```

## 🛠️ Migración de Datos (Si es necesario)

Si tus datos actuales usan valores antiguos, ejecuta estas queries:

```sql
-- Si tienes 'en_revision' en lugar de 'en revisión'
UPDATE public.suggestions 
SET status = 'en revisión' 
WHERE status = 'en_revision';

-- Si tienes 'aprobada' en lugar de 'planeada'  
UPDATE public.suggestions 
SET status = 'planeada' 
WHERE status = 'aprobada';
```

**⚠️ IMPORTANTE**: Solo ejecuta esto si tu enum actual tiene valores diferentes. Verifica primero con la query de arriba.

## 📋 Testing

Para probar que todo funciona:

1. ✅ Ve al Panel de Admin → Sugerencias
2. ✅ Verifica que los badges muestren los estados correctos
3. ✅ Cambia el estado de una sugerencia usando el dropdown
4. ✅ Verifica que el badge se actualice correctamente
5. ✅ Filtra por cada estado y verifica que funcione
6. ✅ Los 5 estados deben aparecer en el dropdown:
   - Nueva
   - En Revisión
   - Planeada
   - Completada
   - Rechazada

## 🎯 Cambios Aplicados

### Archivos Modificados

1. **`admin-suggestions-section.tsx`**:
   - ✅ Interface `Suggestion` actualizada
   - ✅ Función `updateStatus` usa el tipo correcto
   - ✅ Función `getStatusBadge` incluye los 5 estados
   - ✅ Select de filtros incluye los 5 estados
   - ✅ Select de cambio de estado incluye los 5 estados
   - ✅ Importado ícono `Calendar` de lucide-react

2. **`supabase-verify-suggestions.sql`**:
   - ✅ Script para verificar enum actual
   - ✅ Comentarios con código para recrear enum si es necesario
   - ✅ Query para ver distribución de estados

---

**Última actualización**: 14 de Octubre, 2025
