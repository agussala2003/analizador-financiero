# 🎨 Guía Rápida de Design System

## 🚀 Quick Start para Desarrolladores

Esta guía te permite empezar a usar el design system en **menos de 5 minutos**.

---

## 📦 Utility Classes Disponibles

### 1. **Layout Containers**

```tsx
// Dashboard, Blog, Admin tables (contenido amplio)
<div className="container-wide">
  {/* max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 */}
</div>

// Forms, Profiles (contenido centrado)
<div className="container-narrow">
  {/* max-w-4xl mx-auto px-4 py-8 sm:px-6 */}
</div>

// Admin tables (full width)
<div className="container-full">
  {/* w-full px-4 py-6 sm:px-6 lg:px-8 */}
</div>
```

---

### 2. **Typography Scale**

```tsx
// Títulos principales
<h1 className="heading-1">Dashboard Principal</h1>
{/* text-4xl lg:text-5xl font-bold tracking-tight */}

<h2 className="heading-2">Sección Importante</h2>
{/* text-3xl lg:text-4xl font-bold tracking-tight */}

<h3 className="heading-3">Subsección</h3>
{/* text-2xl lg:text-3xl font-semibold tracking-tight */}

<h4 className="heading-4">Título Card</h4>
{/* text-xl lg:text-2xl font-semibold tracking-tight */}

// Texto de cuerpo
<p className="body-lg">Párrafo destacado</p>
<p className="body">Párrafo normal</p>
<p className="body-sm">Texto pequeño</p>
<p className="caption">Metadata (fecha, autor)</p>
```

---

### 3. **Card Variants**

```tsx
// Card clicable con hover effect
<Card className="card-interactive">
  {/* hover:scale-[1.01] hover:shadow-lg cursor-pointer */}
</Card>

// Card estática (solo información)
<Card className="card-static">
  {/* transition-shadow duration-200 */}
</Card>

// Card destacada
<Card className="card-highlight">
  {/* border-primary/50 bg-primary/5 */}
</Card>
```

---

### 4. **Grid Patterns**

```tsx
// 3 columnas responsive (blogs, watchlist)
<div className="grid-cards-3">
  {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 */}
</div>

// 2 columnas (comparativas)
<div className="grid-cards-2">
  {/* grid grid-cols-1 lg:grid-cols-2 gap-6 */}
</div>

// 4 columnas (métricas pequeñas)
<div className="grid-cards-4">
  {/* grid grid-cols-2 lg:grid-cols-4 gap-4 */}
</div>
```

---

### 5. **Spacing Utilities**

```tsx
// Vertical spacing
<div className="stack-4">  {/* space-y-4 (1rem) */}
<div className="stack-6">  {/* space-y-6 (1.5rem) */}
<div className="stack-8">  {/* space-y-8 (2rem) */}

// Horizontal spacing
<div className="row-4">    {/* flex flex-wrap gap-4 */}
<div className="row-6">    {/* flex flex-wrap gap-6 */}

// Section divider
<div className="section-divider">
  {/* mb-6 border-b pb-4 */}
</div>
```

---

### 6. **Interaction Enhancements**

```tsx
// Button press effect
<Button className="btn-press">
  {/* active:scale-[0.98] transition-transform */}
  Click Me
</Button>

// Link hover
<a className="link-hover">
  {/* transition-colors duration-200 hover:text-primary */}
  Link Text
</a>

// Smooth transition (general)
<div className="transition-smooth">
  {/* transition-all duration-300 ease-in-out */}
</div>

// Enhanced focus ring
<input className="focus-ring-enhanced" />
{/* focus-visible:outline-none focus-visible:ring-2 ... */}
```

---

### 7. **Animations**

```tsx
// Fade in (elementos que aparecen)
<div className="animate-fade-in">Content</div>

// Slide up (contenido principal)
<div className="animate-slide-up">Page Content</div>

// Slide down (mensajes error/success)
{error && (
  <p className="animate-slide-down text-destructive">{error}</p>
)}

// Scale in (modals, dialogs)
<DialogContent className="animate-scale-in">

// Shimmer (loading)
<Skeleton className="animate-shimmer h-20 w-full" />

// Pulse glow (CTAs importantes)
<Button className="animate-pulse-glow">¡Oferta!</Button>

// Bounce subtle (elementos interactivos)
<div className="animate-bounce-subtle">
  <ArrowDown />
</div>
```

---

## 📝 Patrones Comunes

### Página Típica

```tsx
export default function MyPage() {
  return (
    <div className="container-wide stack-8">
      {/* Header */}
      <div className="section-divider">
        <h1 className="heading-1">Título de Página</h1>
        <p className="body text-muted-foreground">
          Descripción de la página
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid-cards-3">
        <Card className="card-interactive">
          <CardHeader>
            <CardTitle className="heading-4">Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="body">Content here</p>
          </CardContent>
        </Card>
        {/* Más cards... */}
      </div>
    </div>
  );
}
```

---

### Form con Validación

```tsx
import { FormInput } from '@/features/auth/components/shared/form-input';

function MyForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  return (
    <form className="container-narrow stack-6">
      <h2 className="heading-2">Formulario</h2>
      
      <FormInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={emailError}  // Muestra border rojo + mensaje
        required
      />

      <Button type="submit" className="btn-press">
        Enviar
      </Button>
    </form>
  );
}
```

---

### Card Interactiva

```tsx
<Card 
  className="card-interactive"
  onClick={() => navigate(`/detail/${id}`)}
>
  <CardHeader>
    <CardTitle className="heading-4">Título</CardTitle>
    <CardDescription className="body-sm">
      Descripción
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="body">Contenido de la card</p>
  </CardContent>
</Card>
```

---

### Dashboard con Stats

```tsx
<div className="container-wide stack-8">
  <h1 className="heading-1">Dashboard</h1>

  {/* Stats Grid - 4 columnas */}
  <div className="grid-cards-4">
    <Card className="card-static">
      <CardContent className="pt-6">
        <p className="caption">Total Assets</p>
        <p className="heading-3">$125,000</p>
      </CardContent>
    </Card>
    {/* Más stats... */}
  </div>

  {/* Main Content Grid - 3 columnas */}
  <div className="grid-cards-3">
    {/* Cards principales */}
  </div>
</div>
```

---

### Loading State

```tsx
{isLoading ? (
  <div className="container-wide stack-6">
    <Skeleton className="h-12 w-64 animate-shimmer" />
    <div className="grid-cards-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-48 animate-shimmer" />
      ))}
    </div>
  </div>
) : (
  <div className="container-wide stack-6 animate-slide-up">
    {/* Contenido real */}
  </div>
)}
```

---

### Empty State

```tsx
<div className="container-wide">
  <div className="text-center py-20 border-2 border-dashed rounded-lg">
    <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
    <h2 className="heading-4 mb-2">No hay elementos</h2>
    <p className="body text-muted-foreground mb-6">
      Comienza agregando tu primer elemento
    </p>
    <Button size="lg" className="btn-press">
      Agregar Elemento
    </Button>
  </div>
</div>
```

---

## 🎨 Reglas de Uso

### ✅ DO (Hacer)

```tsx
✅ <div className="container-wide stack-8">
✅ <h1 className="heading-1">
✅ <Card className="card-interactive">
✅ <Button className="btn-press">
✅ <p className="body text-muted-foreground">
```

### ❌ DON'T (No hacer)

```tsx
❌ <div className="container mx-auto p-4 sm:p-6">
   // Usa: container-wide

❌ <h1 className="text-4xl font-bold">
   // Usa: heading-1

❌ <Card className="hover:shadow-lg transition">
   // Usa: card-interactive

❌ <div className="space-y-6">
   // Usa: stack-6

❌ <p className="text-sm text-muted-foreground">
   // Usa: body-sm text-muted-foreground
```

---

## 🎯 Cuando Usar Cada Container

| Tipo | Cuándo Usar | Max Width |
|------|-------------|-----------|
| `container-wide` | Dashboard, Blog, Portfolio, Watchlist | 7xl (1280px) |
| `container-narrow` | Profile, Forms, Login, Register | 4xl (896px) |
| `container-full` | Admin tables, Data grids | 100% |

---

## 📐 Cuando Usar Cada Grid

| Grid | Columnas | Uso Típico |
|------|----------|-----------|
| `grid-cards-3` | 1 → 2 → 3 | Blog cards, Watchlist, Product grid |
| `grid-cards-2` | 1 → 2 | Comparativas, Features, Testimonials |
| `grid-cards-4` | 2 → 4 | Stats pequeñas, Métricas, Tags |

---

## 🎨 Cuando Usar Cada Typography

| Clase | Uso | Ejemplo |
|-------|-----|---------|
| `heading-1` | Título principal de página | "Dashboard Principal" |
| `heading-2` | Secciones importantes | "Mi Portafolio" |
| `heading-3` | Subsecciones | "Últimas Transacciones" |
| `heading-4` | Títulos de cards | "Asset Details" |
| `body-lg` | Intro paragraphs destacados | Hero descriptions |
| `body` | Texto normal | Contenido general |
| `body-sm` | Texto secundario | Card descriptions |
| `caption` | Metadata | Fechas, autores, tags |

---

## ⚡ Performance Tips

1. **Usa utility classes en lugar de custom CSS**
   ```tsx
   ✅ className="container-wide stack-6"
   ❌ style={{ maxWidth: '1280px', marginX: 'auto', ... }}
   ```

2. **Aprovecha las animations CSS** (GPU accelerated)
   ```tsx
   ✅ className="animate-slide-up"
   ❌ motion.div con config compleja
   ```

3. **Reutiliza patterns**
   ```tsx
   ✅ className="grid-cards-3"
   ❌ className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
   ```

---

## ♿ Accessibility Checklist

- [ ] Usa semantic HTML (`<main>`, `<nav>`, `<header>`)
- [ ] Agrega `aria-label` en iconos sin texto
- [ ] Usa `heading-*` en orden jerárquico (h1 → h2 → h3)
- [ ] Focus indicators visibles (`.focus-ring-enhanced`)
- [ ] Touch targets > 44px en mobile
- [ ] Contraste de colores WCAG AA (ya garantizado con OKLCH)

---

## 🐛 Troubleshooting

### "Las utility classes no funcionan"
- ✅ Verifica que estés en `src/index.css`
- ✅ Reinicia el dev server (`npm run dev`)
- ✅ Limpia cache (`npm run build`)

### "Animaciones muy lentas"
- ✅ Verifica que uses `duration: 0.3s` (no 0.5s)
- ✅ Usa `animate-*` classes CSS en lugar de JS

### "Spacing inconsistente"
- ✅ Usa `stack-*` o `row-*` en lugar de `space-y-*` manual
- ✅ Verifica que uses `gap-4/6` consistentemente

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `docs/UI_AUDIT.md` - Análisis exhaustivo
- `docs/UI_IMPROVEMENTS_CHANGELOG.md` - Todos los cambios
- `docs/PHASE_2_ANIMATIONS_FORMS.md` - Animations y forms
- `docs/RESPONSIVE_TESTING_REPORT.md` - Responsive testing

---

## 🎉 ¡Listo!

Con esta guía rápida puedes empezar a usar el design system inmediatamente.

**Recuerda:**
- 🎨 Usa utility classes consistentes
- ⚡ Aprovecha las animations CSS
- 📱 Piensa mobile-first
- ♿ Mantén la accesibilidad

**Happy coding! 🚀**
