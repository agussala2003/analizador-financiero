# Sistema de Reseteo Diario de API Calls

## 📋 Descripción

Este sistema garantiza que los contadores de uso de API de todos los usuarios se reseteen automáticamente cada día a medianoche (UTC), permitiendo que todos los usuarios comiencen con un contador limpio cada 24 horas.

## 🔧 Componentes del Sistema

### 1. **Reseteo Automático en el Cliente** (Ya implementado ✅)

**Archivo**: `src/services/api/apiLimiter.ts`

El sistema actual ya verifica si la fecha actual es diferente a `last_api_call_date` y resetea el contador automáticamente cuando un usuario hace una petición:

```typescript
// Si la última llamada fue en un día anterior, reiniciamos el contador
if (typedDbProfile.last_api_call_date !== today) {
    calls = 0;
}
```

**Ventaja**: Funciona sin necesidad de configuración adicional.  
**Limitación**: Solo resetea cuando el usuario hace una petición.

### 2. **Reseteo Programado con Cron Job** (Nueva implementación 🆕)

**Archivo**: `supabase/setup-daily-reset-cron.sql`

Un trabajo programado (cron job) que se ejecuta automáticamente en Supabase cada día a las 00:00 UTC.

**Ventajas**:
- ✅ Resetea TODOS los usuarios simultáneamente
- ✅ No depende de que el usuario haga una petición
- ✅ Ejecuta automáticamente en el servidor de base de datos
- ✅ Mantiene estadísticas consistentes

### 3. **Edge Function (Alternativa)** (Nueva implementación 🆕)

**Archivo**: `supabase/functions/reset-daily-api-calls/index.ts`

Una función serverless que puede ser llamada manualmente o mediante un cron externo.

**Ventajas**:
- ✅ Mayor control y logging
- ✅ Puede ser llamada desde servicios externos (GitHub Actions, Vercel Cron, etc.)
- ✅ Mejor para debugging y monitoreo

## 🚀 Implementación

### Opción 1: Cron Job de Supabase (Recomendada)

1. **Ejecuta el script SQL en Supabase**:
   ```sql
   -- Copia el contenido de supabase/setup-daily-reset-cron.sql
   -- y ejecútalo en el SQL Editor de Supabase
   ```

2. **Verifica que el job se creó**:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'reset-daily-api-calls';
   ```

3. **Monitorea las ejecuciones**:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'reset-daily-api-calls') 
   ORDER BY start_time DESC LIMIT 10;
   ```

### Opción 2: Edge Function + Cron Externo

#### A. Despliega la Edge Function

```bash
# Desde la raíz del proyecto
cd supabase/functions/reset-daily-api-calls

# Despliega la función
supabase functions deploy reset-daily-api-calls
```

#### B. Configura las variables de entorno

En el dashboard de Supabase → Settings → Edge Functions:

```
CRON_SECRET_KEY=tu_clave_secreta_aqui
```

#### C. Configura el cron externo

**Opción C.1: GitHub Actions**

Crea `.github/workflows/reset-api-calls.yml`:

```yaml
name: Reset Daily API Calls

on:
  schedule:
    - cron: '0 0 * * *'  # Todos los días a medianoche UTC
  workflow_dispatch:  # Permite ejecución manual

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            https://YOUR_PROJECT_ID.supabase.co/functions/v1/reset-daily-api-calls \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_KEY }}" \
            -H "Content-Type: application/json"
```

**Opción C.2: Vercel Cron** (si usas Vercel)

Crea `api/cron/reset-api-calls.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const response = await fetch(
    `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co/functions/v1/reset-daily-api-calls`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();
  return res.status(200).json(data);
}

export const config = {
  schedule: '0 0 * * *'  // Todos los días a medianoche UTC
};
```

## 📊 Verificación del Sistema

### Ver usuarios que necesitan reset

```sql
SELECT 
  id, 
  email, 
  role, 
  api_calls_made, 
  last_api_call_date,
  CURRENT_DATE as today
FROM profiles
WHERE last_api_call_date < CURRENT_DATE
   OR last_api_call_date IS NULL;
```

### Resetear manualmente (para testing)

```sql
UPDATE profiles
SET 
  api_calls_made = 0,
  last_api_call_date = CURRENT_DATE
WHERE last_api_call_date < CURRENT_DATE
   OR last_api_call_date IS NULL;
```

### Ver estadísticas de uso

```sql
SELECT 
  role,
  COUNT(*) as total_users,
  AVG(api_calls_made) as avg_calls,
  MAX(api_calls_made) as max_calls,
  MIN(api_calls_made) as min_calls
FROM profiles
WHERE last_api_call_date = CURRENT_DATE
GROUP BY role;
```

## 🔍 Monitoreo y Debugging

### Logs del Cron Job

```sql
-- Ver últimas 10 ejecuciones
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'reset-daily-api-calls')
ORDER BY start_time DESC 
LIMIT 10;
```

### Logs de la Edge Function

```bash
# Ver logs en tiempo real
supabase functions logs reset-daily-api-calls

# Ver logs históricos
supabase functions logs reset-daily-api-calls --tail=100
```

## ⚙️ Configuración de Zona Horaria

Por defecto, todo se ejecuta en **UTC**. Si necesitas ajustar a tu zona horaria:

### Para Argentina (UTC-3)

```sql
-- Ejecutar a las 3:00 AM UTC = 00:00 AM Argentina
SELECT cron.schedule(
  'reset-daily-api-calls',
  '0 3 * * *',  -- 3:00 AM UTC
  $$ UPDATE profiles SET api_calls_made = 0, last_api_call_date = CURRENT_DATE WHERE last_api_call_date < CURRENT_DATE; $$
);
```

### Para España (UTC+1)

```sql
-- Ejecutar a las 23:00 UTC del día anterior = 00:00 España
SELECT cron.schedule(
  'reset-daily-api-calls',
  '0 23 * * *',  -- 23:00 UTC
  $$ UPDATE profiles SET api_calls_made = 0, last_api_call_date = CURRENT_DATE WHERE last_api_call_date < CURRENT_DATE; $$
);
```

## 🛠️ Comandos Útiles

### Eliminar el cron job

```sql
SELECT cron.unschedule('reset-daily-api-calls');
```

### Pausar el cron job

```sql
UPDATE cron.job 
SET active = false 
WHERE jobname = 'reset-daily-api-calls';
```

### Reactivar el cron job

```sql
UPDATE cron.job 
SET active = true 
WHERE jobname = 'reset-daily-api-calls';
```

### Ejecutar manualmente (testing)

```sql
-- Ejecuta el código del cron job inmediatamente
UPDATE profiles
SET 
  api_calls_made = 0,
  last_api_call_date = CURRENT_DATE
WHERE last_api_call_date < CURRENT_DATE
   OR last_api_call_date IS NULL;
```

## 📝 Notas Importantes

1. **Zona Horaria**: Todos los cron jobs en Supabase usan UTC por defecto.

2. **Límites de Supabase**: 
   - Free tier: Hasta 2 cron jobs
   - Pro tier: Hasta 5 cron jobs

3. **Performance**: 
   - El cron job SQL es más rápido para grandes volúmenes de usuarios
   - La Edge Function ofrece mejor logging y flexibilidad

4. **Backup**: 
   - Considera mantener el sistema cliente + cron job para redundancia
   - Si el cron falla, el cliente resetea al siguiente uso

5. **Testing**: 
   - Prueba el cron job en desarrollo antes de producción
   - Usa `workflow_dispatch` en GitHub Actions para testing manual

## 🎯 Recomendación Final

**Mejor opción**: Usar el **Cron Job de Supabase** (Opción 1)

**Razones**:
- ✅ Simple y directo
- ✅ No requiere servicios externos
- ✅ Bajo costo (gratis en tier Pro)
- ✅ Confiable y rápido
- ✅ Mantiene el sistema cliente como fallback

**Mantener también**:
- ✅ El reseteo automático en `apiLimiter.ts` como sistema de respaldo
- ✅ Así si el cron falla, el usuario aún puede usar la API
