# Actualización de Edge Function: fmp-proxy

## Problema

El endpoint `stable/grades` no está configurado en la Edge Function `fmp-proxy` de Supabase, causando errores 500 cuando el componente `AssetGradesTab` intenta obtener calificaciones de analistas.

## Error Observado

```
POST https://itgwuzzqcreoqjksegop.supabase.co/functions/v1/fmp-proxy 500 (Internal Server Error)
```

## Solución

Necesitas actualizar la Edge Function `fmp-proxy` en Supabase para incluir soporte para el endpoint `stable/grades`.

### Pasos para actualizar la Edge Function

1. **Accede al Dashboard de Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Navega a Edge Functions**
   - En el menú lateral, haz clic en "Edge Functions"
   - Encuentra la función `fmp-proxy`

3. **Edita el código de la función**

La función debe incluir el endpoint `stable/grades` en su configuración. Aquí está el código actualizado:

```typescript
// supabase/functions/fmp-proxy/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const FMP_API_KEY = Deno.env.get('FMP_API_KEY');
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Mapeo de endpoints internos a endpoints de FMP.
 * Añade 'stable/grades' para obtener calificaciones de analistas.
 */
const ENDPOINT_MAP: Record<string, string> = {
  // Perfil y datos básicos
  'stable/profile': '/profile',
  'stable/quote': '/quote',
  'stable/key-metrics-ttm': '/key-metrics-ttm',
  
  // Datos históricos
  'stable/historical-price-eod/full': '/historical-price-full',
  
  // Price Targets y Ratings
  'stable/price-target-summary': '/price-target-summary',
  'stable/price-target-latest-news': '/upgrades-downgrades-consensus',
  'stable/grades-latest-news': '/upgrades-downgrades-consensus',
  'stable/grades': '/upgrades-downgrades', // NUEVO: Calificaciones completas
  'stable/ratings-snapshot': '/rating',
  
  // Dividendos
  'stable/dividends-calendar': '/stock_dividend_calendar',
  
  // Análisis financiero
  'stable/market-risk-premium': '/market-risk-premium',
  'stable/custom-discounted-cash-flow': '/discounted-cash-flow',
  
  // Segmentación
  'stable/revenue-geographic-segmentation': '/revenue-geographic-segmentation',
  'stable/revenue-product-segmentation': '/revenue-product-segmentation',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();

    // Validar que el endpoint existe
    if (!ENDPOINT_MAP[endpoint]) {
      return new Response(
        JSON.stringify({ error: `Endpoint no soportado: ${endpoint}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Construir URL con parámetros
    const fmpEndpoint = ENDPOINT_MAP[endpoint];
    const url = new URL(`${FMP_BASE_URL}${fmpEndpoint}`);
    
    // Añadir parámetros de query
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    // Añadir API key
    url.searchParams.append('apikey', FMP_API_KEY || '');

    // Realizar petición a FMP
    const response = await fetch(url.toString());
    const data = await response.json();

    // Registrar para debugging (opcional)
    console.log(`FMP Proxy: ${endpoint} -> ${fmpEndpoint}`, {
      symbol: params?.symbol,
      statusCode: response.status,
      dataLength: Array.isArray(data) ? data.length : 'N/A',
    });

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('FMP Proxy Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
```

4. **Archivo CORS (si no existe)**

Si no tienes el archivo `_shared/cors.ts`, créalo:

```typescript
// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

5. **Despliega la función actualizada**

Desde la terminal, en la raíz de tu proyecto:

```bash
# Asegúrate de tener Supabase CLI instalado
npm install -g supabase

# Login a Supabase
supabase login

# Link a tu proyecto (solo la primera vez)
supabase link --project-ref <your-project-ref>

# Despliega la función
supabase functions deploy fmp-proxy
```

6. **Verifica las variables de entorno**

Asegúrate de que la variable `FMP_API_KEY` esté configurada en Supabase:

```bash
supabase secrets set FMP_API_KEY=your_api_key_here
```

O desde el Dashboard:
- Ve a "Project Settings" → "Edge Functions" → "Secrets"
- Añade `FMP_API_KEY` con tu clave de Financial Modeling Prep

## Verificación

Después de actualizar la función, prueba el endpoint directamente:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/fmp-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-anon-key" \
  -d '{
    "endpoint": "stable/grades",
    "params": {
      "symbol": "AAPL"
    }
  }'
```

Deberías recibir un array con las calificaciones del activo.

## Endpoints de FMP para Grades

La API de Financial Modeling Prep tiene dos endpoints principales para grades:

1. **`/upgrades-downgrades`** (recomendado para `stable/grades`)
   - Devuelve historial completo de upgrades/downgrades
   - Ejemplo: `https://financialmodelingprep.com/api/v3/upgrades-downgrades?symbol=AAPL&apikey=XXX`

2. **`/upgrades-downgrades-consensus`** (usado en `stable/grades-latest-news`)
   - Devuelve consenso y últimas noticias
   - Más enfocado a noticias recientes

Para el componente `AssetGradesTab`, se recomienda usar `/upgrades-downgrades` ya que muestra un historial más completo.

## Solución Temporal (Sin actualizar Edge Function)

Si no puedes actualizar la Edge Function inmediatamente, puedes cambiar temporalmente el endpoint en `config.json`:

```json
{
  "api": {
    "fmpProxyEndpoints": {
      "stockGrades": "stable/grades-latest-news"
    }
  }
}
```

Nota: Esto usará el endpoint de noticias que tiene menos datos históricos pero funciona con la configuración actual.

## Estructura de Datos Esperada

El endpoint `/upgrades-downgrades` de FMP devuelve datos en este formato:

```typescript
interface FMPGrade {
  symbol: string;
  publishedDate: string;        // "2024-01-15 10:30:00"
  newsURL: string;
  newsTitle: string;
  newsBaseURL: string;
  newsPublisher: string;
  newGrade: string;             // "Buy", "Hold", "Sell", etc.
  previousGrade: string;
  gradingCompany: string;       // "Goldman Sachs", "Morgan Stanley", etc.
  action: string;               // "upgrade", "downgrade", "initiated", etc.
  priceWhenPosted: number;
}
```

El componente mapea `publishedDate` a `date` y usa los demás campos directamente.

## Contacto

Si tienes problemas actualizando la Edge Function, contacta al equipo de desarrollo.
