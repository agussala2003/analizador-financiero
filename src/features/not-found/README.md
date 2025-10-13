# Not Found Feature

Página 404 minimalista con animaciones suaves.

## 📋 Estructura

```
not-found/
├── types/
│   └── not-found.types.ts            # Tipos de variantes de animación
├── lib/
│   └── animation-config.ts           # Configuración de animaciones
└── pages/
    └── not-found-page.tsx             # Página 404
```

## 🎯 Componente Principal

### `not-found-page.tsx`
Página de error 404 con diseño centrado y animaciones secuenciales.

**Características:**
- **Layout fullscreen:** min-h-svh (small viewport height)
- **Centrado perfecto:** flex items-center justify-center
- **Animaciones Framer Motion:**
  - Container con stagger children
  - Items con fade-in + translateY
  - Easing personalizado: [0.04, 0.62, 0.23, 0.98]
- **Gradiente en título:** bg-gradient-to-r from-primary to-primary/60
- **Responsive:** Texto adaptativo (7xl → 9xl en lg)

**Estructura:**
```tsx
<section> (fullscreen)
  <motion.div> (container con stagger)
    <motion.h1>404</motion.h1> (gradiente)
    <motion.p>Página no encontrada</motion.p>
    <motion.p>Descripción amigable</motion.p>
    <motion.div>
      <NavLink to="/">
        <Button>Volver al Inicio</Button>
      </NavLink>
    </motion.div>
  </motion.div>
</section>
```

## 🛠️ Configuración de Animaciones

### `animation-config.ts`

```typescript
// Container con animación stagger
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 200ms entre cada hijo
    },
  },
};

// Items individuales con fade-in vertical
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.04, 0.62, 0.23, 0.98], // Custom cubic-bezier
    },
  },
};
```

## 📦 Tipos

### `not-found.types.ts`

```typescript
// Configuración de variantes del contenedor
interface ContainerVariants {
  hidden: { opacity: number };
  visible: {
    opacity: number;
    transition: {
      staggerChildren: number;
    };
  };
}

// Variantes de items (re-export de Framer Motion)
type ItemVariants = Variants;
```

## 🎨 Características de Diseño

### Tipografía
- **Título "404":**
  - text-7xl (móvil) → text-9xl (desktop)
  - font-extrabold
  - Gradiente de color con bg-clip-text
  
- **Subtítulo:**
  - text-3xl (móvil) → text-4xl (desktop)
  - font-bold tracking-tight
  - color: text-foreground
  
- **Descripción:**
  - text-lg
  - color: text-muted-foreground

### Espaciado
- mb-4 entre título y subtítulo
- mb-4 entre subtítulo y descripción
- mb-8 entre descripción y botón

### Botón
- size="lg"
- Dentro de NavLink para navegación
- Redirección a "/" (home)

## 🎭 Animaciones Explicadas

### Stagger Children
El contenedor anima a sus hijos secuencialmente con un delay de 200ms entre cada uno:

```
1. "404" aparece primero (0ms)
2. "Página no encontrada" (200ms)
3. "Oops! Parece que..." (400ms)
4. Botón "Volver al Inicio" (600ms)
```

### Easing Personalizado
`[0.04, 0.62, 0.23, 0.98]` es una curva cubic-bezier que:
- Inicia lento (0.04)
- Acelera rápido (0.62)
- Desacelera suave (0.23)
- Finaliza casi completo (0.98)

Produce una animación más natural y agradable que el ease-in-out estándar.

## 🧪 Dependencias Clave

```json
{
  "react": "^19.0.0",
  "react-router-dom": "^7.1.3",
  "framer-motion": "^11.x"
}
```

## 📊 Métricas

- **Archivos totales:** 3
- **Componentes:** 1 (NotFoundPage)
- **Elementos animados:** 4
- **Líneas de código:** ~75
- **Tamaño compilado:** 1.13 kB (0.60 kB gzip)

## 🚀 Uso

```tsx
import { NotFoundPage } from '@/features/not-found/pages/not-found-page';

// En router (catch-all route)
<Route path="*" element={<NotFoundPage />} />
```

**O importar directamente:**
```tsx
import NotFoundPage from '@/features/not-found/pages/not-found-page';
```

## 🔍 Consideraciones

### Routing
- **Debe ser la última ruta:** `path="*"` captura cualquier URL no coincidente
- **NavLink vs Link:** Se usa NavLink para mantener consistencia
- **Redirección:** Siempre va a "/" (home), no a la página anterior

### Accesibilidad
- **Semántica HTML:** Usa `<section>` para el contenedor principal
- **Jerarquía de encabezados:** h1 para el código de error
- **Navegación clara:** Botón prominente para volver
- **Texto descriptivo:** Mensaje amigable en lugar de técnico

### Performance
- **Animaciones GPU:** Usa `opacity` y `transform` (aceleradas por hardware)
- **Sin layout shifts:** Todo el contenido está centrado desde el inicio
- **Carga inmediata:** No hay dependencias externas de datos

### Responsive Design
- **Viewport units:** min-h-svh en lugar de min-h-screen para móviles
- **Tipografía adaptativa:** text-7xl → text-9xl con breakpoint lg
- **Padding responsive:** p-4 para evitar contenido pegado en móviles
- **Max-width:** max-w-screen-sm para legibilidad en desktop

### UX
- **Mensaje amigable:** Tono casual y no técnico
- **Acción clara:** Un solo botón para reducir decisiones
- **Feedback visual:** Animaciones suaves indican que la página está funcionando
- **Gradiente llamativo:** El "404" destaca visualmente

## 📝 Notas de Refactorización

**Cambios realizados:**
1. Extracción de configuración de animaciones a `lib/animation-config.ts`
2. Creación de tipos en `not-found.types.ts`
3. Documentación JSDoc en el componente
4. Organización consistente con otras features

**Antes:** 1 archivo con configuración inline (50 líneas)  
**Después:** 3 archivos con separación de concerns (~75 líneas total)

**Beneficios:**
- Configuración de animaciones reutilizable
- Tipos explícitos para Framer Motion
- Más fácil de modificar animaciones sin tocar JSX
- Consistencia con el resto de la arquitectura

**Consideraciones:**
Esta feature es intencionalmente simple (página estática sin lógica de negocio), por lo que la refactorización es mínima pero mantiene consistencia estructural.

---

**Última actualización:** Enero 2025  
**Versión:** 2.0 (Refactorización completa)
