# Arquitectura del Proyecto: Financytics

Este documento describe los principios de diseño, patrones y decisiones técnicas que conforman la arquitectura de la aplicación Financytics.

## 1. Principios de Diseño Fundamentales

* **Estructura Basada en Features (Feature-Sliced Design):** El código se organiza por dominio de negocio (`dashboard`, `portfolio`, `auth`) en lugar de por tipo de archivo (`pages`, `components`). Esto mejora la cohesión, reduce el acoplamiento y hace que el proyecto sea más fácil de escalar.
* **Separación de Responsabilidades (SoC):** Se busca una clara distinción entre la capa de UI (componentes), la capa de estado/lógica (hooks) y la capa de servicios (llamadas a API, cálculos).
* **Seguridad de Tipos de Extremo a Extremo:** TypeScript se utiliza en modo estricto. Las respuestas de APIs externas son validadas (idealmente con Zod) para garantizar la integridad de los datos en toda la aplicación.
* **Rendimiento Primero:** Se priorizan técnicas como el *lazy loading* de rutas y la memoización de componentes para asegurar una experiencia de usuario rápida y fluida.

## 2. Flujo de Datos y Manejo de Estado

La aplicación utiliza un modelo de estado híbrido:

1.  **Estado Global del Servidor (Server State):** Gestionado por **TanStack Query (React Query)**. Es la fuente de verdad para todos los datos que provienen de una API (datos de activos, noticias, dividendos). React Query se encarga del cacheo, la revalidación en segundo plano y los estados de carga/error.

2.  **Estado Global del Cliente (Client State):** Gestionado a través de **React Context** (`Providers`). Se limita a datos que definen el estado de la UI global y no son asíncronos, como:
    * `AuthProvider`: Estado de la sesión del usuario.
    * `ConfigProvider`: Configuración de la aplicación cargada desde `config.json`.
    * `DashboardProvider`: La lista de `selectedTickers` (un simple array de strings).

3.  **Estado Local del Componente:** Gestionado con `useState` y `useReducer` para estados que solo afectan a un único componente (ej: el valor de un input en un formulario).

### Flujo Típico de una Petición de Datos

```
1. Componente de UI -> Llama al hook `useAssetData('AAPL')`.
2. `useAssetData` (React Query) -> Comprueba si hay datos frescos en caché.
   - Si los hay: Devuelve los datos cacheados instantáneamente.
   - Si no los hay (o están obsoletos):
     3. Llama a la `queryFn` (ej: `fetchTickerData`).
     4. `fetchTickerData` (Capa de Servicio) -> Realiza la llamada a la Supabase Edge Function.
     5. Supabase -> Llama a la API externa (FMP).
     6. Los datos regresan, son procesados y cacheados por React Query.
7. El componente se actualiza con los nuevos datos.
```

## 3. Decisiones Técnicas Clave

### ¿Por qué Vite en lugar de Create React App?
Vite ofrece un arranque en desarrollo casi instantáneo (HMR) y un proceso de build optimizado gracias al uso de esbuild, lo que acelera significativamente el ciclo de desarrollo.

### ¿Por qué Supabase?
Supabase fue elegido como un backend-as-a-service integral que proporciona:
* **Autenticación:** Solución completa y segura para la gestión de usuarios.
* **Base de Datos PostgreSQL:** Una base de datos relacional robusta y escalable.
* **Edge Functions:** Permiten crear un proxy seguro para ocultar las claves de API de servicios externos (FMP) y controlar el rate-limiting desde el servidor.

### ¿Por qué TanStack Query (React Query)?
Reemplaza la gestión manual de estado asíncrono. Resuelve de forma nativa problemas complejos como:
* Cacheo y deduplicación de peticiones.
* Revalidación de datos en segundo plano.
* Gestión de estados de `isLoading`, `isError`, `isSuccess`.
* Paginación y consultas de datos infinitas.

### ¿Por qué shadcn/ui y Tailwind CSS?
Esta combinación ofrece la máxima flexibilidad. No es una librería de componentes tradicional, sino una colección de componentes reutilizables que se copian en el proyecto. Esto permite una personalización total del estilo a través de Tailwind CSS sin estar atado a las opiniones de diseño de una librería externa.