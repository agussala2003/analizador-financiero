# Financytics: Analizador Financiero Inteligente

Financytics es una aplicación web moderna construida con React, TypeScript y Vite, diseñada para ofrecer a los inversores herramientas de análisis financiero de nivel profesional a través de una interfaz de usuario intuitiva y potente.

![Captura de pantalla del Dashboard de Financytics]

## 🚀 Características Principales

* **Dashboard de Análisis Comparativo:** Añade múltiples activos y compáralos en diferentes dimensiones:
    * **Precios y Volatilidad:** Rendimientos diarios, mensuales y anuales.
    * **Indicadores Fundamentales:** Métricas clave de valoración, rentabilidad y salud financiera.
    * **Matriz de Correlación:** Visualiza cómo se mueven los activos entre sí.
    * **Gráfico Radar y de Rendimiento Histórico.**
    * **Resumen con IA:** Un veredicto cuantitativo que destaca el activo más robusto.
* **Gestión de Portafolio:** Registra tus transacciones de compra/venta y obtén un análisis completo de tu rendimiento, incluyendo estadísticas del día, G/P total y distribución de activos.
* **Detalle de Activos:** Páginas dedicadas para cada activo con información de la compañía, métricas financieras, calificaciones (DCF y Scorecard) y gráficos de segmentación de ingresos.
* **Herramientas de Mercado:** Calendario de dividendos, noticias financieras y visualizador de Riesgo País.
* **Seguridad y Roles:** Sistema de autenticación completo con rutas protegidas y roles de usuario (Básico, Plus, Administrador).

## 🛠️ Stack Tecnológico

* **Framework:** React 19 + Vite
* **Lenguaje:** TypeScript
* **UI y Estilado:** shadcn/ui, Tailwind CSS, Recharts, Framer Motion
* **Manejo de Estado y Datos:** React Query (TanStack Query)
* **Backend & Base de Datos:** Supabase (Auth, PostgreSQL, Edge Functions)
* **Enrutamiento:** React Router
* **Testing:** Vitest + React Testing Library

## 📋 Instalación y Uso Local

### **Requisitos**

* Node.js (v18 o superior)
* npm o pnpm
* Una cuenta de Supabase

### **Pasos de Instalación**

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/analizador-financiero.git](https://github.com/tu-usuario/analizador-financiero.git)
    cd analizador-financiero
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    * Crea una copia del archivo de ejemplo: `cp .env.example .env`
    * Abre el archivo `.env` y rellena las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con las credenciales de tu proyecto de Supabase.

4.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura modular basada en "features" para mejorar la escalabilidad y mantenibilidad.

```
src/
├── features/         # Módulos por dominio de negocio (la lógica principal)
│   ├── dashboard/    # Todo lo relacionado con el Dashboard
│   ├── portfolio/    # Gestión de portafolio
│   ├── auth/         # Autenticación, login, registro
│   └── ...           # Otras features como admin, news, etc.
│
├── components/       # Componentes de UI compartidos y reutilizables
│   └── ui/           # Componentes base de shadcn/ui
│
├── hooks/            # Hooks personalizados y globales
├── lib/              # Clientes de librerías (Supabase, React Query)
├── providers/        # Proveedores de contexto globales (Auth, Config)
├── services/         # Lógica de negocio y llamadas a API
├── types/            # Definiciones de tipos y interfaces globales
└── utils/            # Funciones de utilidad puras
```

## 🧪 Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo.
* `npm run build`: Compila la aplicación para producción.
* `npm run lint`: Analiza el código con ESLint.
* `npm run test`: Ejecuta todos los tests con Vitest.