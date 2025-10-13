# Profile Feature

## 📋 Descripción General

La feature de **Profile** permite a los usuarios gestionar su información personal y preferencias de inversión. Incluye la actualización de nombre y apellido, selección de perfil de inversor, nivel de experiencia y áreas de interés para personalizar la experiencia en la plataforma.

## 🏗️ Arquitectura

Esta feature sigue el patrón **Feature-Sliced Design**:

```
profile/
├── types/                    # Definiciones de tipos TypeScript
│   └── profile.types.ts      # Tipos de props y perfil
├── lib/                      # Lógica de negocio y utilidades
│   └── profile.utils.ts      # Funciones de validación y formato
├── components/               # Componentes React
│   ├── forms/               # Componentes de formularios
│   │   ├── personal-info-form.tsx           # Formulario de info personal
│   │   └── investment-preferences-form.tsx  # Formulario de preferencias
│   ├── skeleton/            # Estados de carga
│   │   └── profile-skeleton.tsx             # Skeleton de la página
│   └── index.ts             # Barrel export
└── pages/                   # Páginas de la feature
    └── profile-page.tsx     # Página principal del perfil
```

## 📦 Componentes

### Forms

#### PersonalInfoForm
**Ubicación**: `components/forms/personal-info-form.tsx`

Formulario para actualizar información personal básica.

**Props**:
```typescript
interface PersonalInfoFormProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}
```

**Características**:
- Card con icono de User
- Dos campos de input (nombre y apellido)
- Placeholders informativos
- Transiciones y focus ring animados
- Grid responsive (1 columna en mobile, 2 en desktop)

**Ejemplo de uso**:
```tsx
<PersonalInfoForm
  firstName={firstName}
  lastName={lastName}
  onFirstNameChange={setFirstName}
  onLastNameChange={setLastName}
/>
```

---

#### InvestmentPreferencesForm
**Ubicación**: `components/forms/investment-preferences-form.tsx`

Formulario para configurar preferencias de inversión.

**Props**:
```typescript
interface InvestmentPreferencesFormProps {
  investorProfile: string;
  experience: string;
  interests: Record<string, boolean>;
  onInvestorProfileChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onInterestChange: (interestId: string) => void;
}
```

**Campos incluidos**:

1. **Perfil de Inversor** (Select):
   - Conservador
   - Moderado
   - Agresivo

2. **Nivel de Experiencia** (Select):
   - Principiante
   - Intermedio
   - Avanzado

3. **Áreas de Interés** (Checkboxes):
   - Análisis Fundamental
   - Análisis Técnico
   - Inversión por Dividendos
   - Acciones de Crecimiento
   - Acciones de Valor
   - ETFs y Fondos Indexados
   - Noticias de Mercado

**Características**:
- Card con icono de Target
- Grid de 2 columnas para selects
- Grid de 3 columnas para checkboxes (responsive)
- Fondo muted para sección de intereses
- Iconos Heart para mejor UX
- Todos los intereses con labels clickeables

**Ejemplo de uso**:
```tsx
<InvestmentPreferencesForm
  investorProfile={investorProfile}
  experience={experience}
  interests={interests}
  onInvestorProfileChange={setInvestorProfile}
  onExperienceChange={setExperience}
  onInterestChange={handleInterestChange}
/>
```

---

### Skeleton

#### ProfileSkeleton
**Ubicación**: `components/skeleton/profile-skeleton.tsx`

Estado de carga para la página de perfil.

**Estructura**:
- Header con icono circular y títulos
- Card de información personal (2 inputs)
- Card de preferencias (2 selects + 7 checkboxes)
- Botón de acción

**Características**:
- Alturas consistentes con contenido real
- Grid responsive
- Animaciones de skeleton de shadcn/ui

**Ejemplo de uso**:
```tsx
if (!isLoaded) {
  return (
    <div className="p-4 sm:p-6">
      <ProfileSkeleton />
    </div>
  );
}
```

---

## 🔧 Utilidades

### profile.utils.ts

**Constantes**:

```typescript
// Opciones de áreas de interés
export const interestOptions: InterestOption[] = [
  { id: "fundamental_analysis", label: "Análisis Fundamental" },
  { id: "technical_analysis", label: "Análisis Técnico" },
  { id: "dividends", label: "Inversión por Dividendos" },
  { id: "growth_investing", label: "Acciones de Crecimiento" },
  { id: "value_investing", label: "Acciones de Valor" },
  { id: "etfs", label: "ETFs y Fondos Indexados" },
  { id: "market_news", label: "Noticias de Mercado" },
];
```

**Funciones de extracción y formato**:

```typescript
// Extrae y valida el perfil de onboarding desde datos raw
extractOnboardingProfile(raw: unknown): OnboardingProfile
// Ejemplo: extractOnboardingProfile(profile.onboarding_profile)

// Formatea un error de Supabase a string legible
formatSupabaseError(error: unknown): string
// Ejemplo: formatSupabaseError(error) → "User not found"
```

**Funciones de validación**:

```typescript
// Valida si los campos obligatorios están completos
validateProfileForm(firstName: string, lastName: string): {
  isValid: boolean;
  errors: string[];
}
// Ejemplo: 
// validateProfileForm("", "Doe") 
// → { isValid: false, errors: ["El nombre es obligatorio"] }
```

**Funciones de traducción**:

```typescript
// Traduce el perfil de inversor a texto legible
translateInvestorProfile(profile: string): string
// Ejemplo: translateInvestorProfile("conservative") → "Conservador"

// Traduce el nivel de experiencia a texto legible
translateExperience(experience: string): string
// Ejemplo: translateExperience("intermediate") → "Intermedio"
```

**Funciones de manipulación de intereses**:

```typescript
// Cuenta el número de intereses seleccionados
countSelectedInterests(interests: Record<string, boolean>): number
// Ejemplo: countSelectedInterests({ dividends: true, etfs: true }) → 2

// Obtiene los IDs de los intereses seleccionados
getSelectedInterestIds(interests: Record<string, boolean>): string[]
// Ejemplo: getSelectedInterestIds({ dividends: true, etfs: false }) → ["dividends"]

// Convierte un array de IDs a un objeto Record
interestIdsToRecord(ids: string[]): Record<string, boolean>
// Ejemplo: interestIdsToRecord(["dividends", "etfs"]) 
// → { dividends: true, etfs: true }
```

---

## 📊 Tipos

### profile.types.ts

```typescript
// Perfil de onboarding del usuario
interface OnboardingProfile {
  investorProfile?: string;
  experience?: string;
  interests?: Record<string, boolean>;
}

// Perfil completo del usuario
interface UserProfile {
  first_name?: string;
  last_name?: string;
  onboarding_profile?: OnboardingProfile | null;
}

// Opción de interés para checkboxes
interface InterestOption {
  id: string;
  label: string;
}

// Props para PersonalInfoForm
interface PersonalInfoFormProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

// Props para InvestmentPreferencesForm
interface InvestmentPreferencesFormProps {
  investorProfile: string;
  experience: string;
  interests: Record<string, boolean>;
  onInvestorProfileChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onInterestChange: (interestId: string) => void;
}

// Estado del formulario de perfil
interface ProfileFormState {
  firstName: string;
  lastName: string;
  investorProfile: string;
  experience: string;
  interests: Record<string, boolean>;
}
```

---

## 📄 Página Principal

### ProfilePage
**Ubicación**: `pages/profile-page.tsx`

Página principal que orquesta todos los componentes del perfil.

**Hooks utilizados**:
```typescript
const { user, profile, refreshProfile, isLoaded } = useAuth();
```

**Estado local**:
```typescript
const [loading, setLoading] = useState(false);
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [investorProfile, setInvestorProfile] = useState("");
const [experience, setExperience] = useState("");
const [interests, setInterests] = useState<Record<string, boolean>>({});
```

**Estructura de la página**:

```tsx
<motion.div> {/* Animación de entrada */}
  {/* Header con icono UserCircle */}
  
  <form onSubmit={handleSubmit}>
    {/* Información Personal */}
    <PersonalInfoForm />
    
    {/* Preferencias de Inversión */}
    <InvestmentPreferencesForm />
    
    {/* Botón Guardar Cambios */}
    <Button type="submit" disabled={loading} />
  </form>
</motion.div>
```

**Características**:
- Animación de entrada con Framer Motion (fade + translateY)
- Skeleton durante carga inicial
- Extracción de datos de onboarding con `extractOnboardingProfile()`
- Toast notifications para éxito/error
- Logging de eventos con logger
- Refresh automático del perfil tras actualización

---

## 🔄 Flujo de Datos

### 1. Carga Inicial
```
useAuth() 
  → profile cargado desde context
  → useEffect extrae campos
  → extractOnboardingProfile(profile.onboarding_profile)
  → setState para cada campo
  → Renderizado de formularios
```

### 2. Modificación de Campo
```
Usuario cambia input
  → onChange handler
  → setState actualiza campo específico
  → Re-render del componente afectado
```

### 3. Toggle de Interés
```
Usuario hace click en checkbox
  → handleInterestChange(interestId)
  → setInterests con spread y toggle
  → Re-render de InvestmentPreferencesForm
```

### 4. Guardar Cambios
```
Usuario hace submit del form
  → handleSubmit()
  → Construir OnboardingProfile object
  → Supabase: UPDATE profiles table
  → refreshProfile() del auth context
  → Toast notification de éxito
  → Logger registra evento
```

---

## 🎨 Estilos y Temas

### Colores y Efectos

**Cards**:
- `border-border/50`: Bordes sutiles
- `shadow-sm`: Sombra suave por defecto
- `hover:shadow-md`: Sombra más pronunciada al hover
- `transition-shadow`: Transición suave

**Inputs y Selects**:
- `focus:ring-2 focus:ring-primary/20`: Focus ring animado
- `transition-all duration-200`: Transiciones suaves

**Botón de Submit**:
- `hover:scale-[1.02]`: Escala ligeramente al hover
- `active:scale-100`: Vuelve a escala normal al click
- `transition-all`: Animación de todas las propiedades

**Checkboxes de Intereses**:
- `bg-muted/30`: Fondo sutil para el container
- `border-border/50`: Borde suave
- `rounded-lg`: Bordes redondeados
- `text-foreground/90 hover:text-foreground`: Opacidad animada en labels

### Responsive Design

**Breakpoints**:
- `sm`: 640px (tablets)
- `lg`: 1024px (desktops)

**Grid de Información Personal**:
- Mobile: 1 columna
- Tablet+: 2 columnas

**Grid de Preferencias (Selects)**:
- Mobile: 1 columna
- Tablet+: 2 columnas

**Grid de Áreas de Interés**:
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

---

## 🔌 Integraciones

### Supabase

**Tabla**: `profiles`

**Columnas**:
- `id` (UUID, FK a auth.users)
- `first_name` (text)
- `last_name` (text)
- `onboarding_profile` (jsonb)

**Estructura de onboarding_profile**:
```json
{
  "investorProfile": "moderate",
  "experience": "intermediate",
  "interests": {
    "fundamental_analysis": true,
    "dividends": true,
    "etfs": false
  }
}
```

**Query de actualización**:
```typescript
await supabase
  .from("profiles")
  .update({
    first_name: firstName,
    last_name: lastName,
    onboarding_profile: { investorProfile, experience, interests }
  })
  .eq("id", user.id);
```

### Auth Context

**Hook useAuth**:
- `user`: Usuario autenticado actual
- `profile`: Perfil completo del usuario
- `refreshProfile()`: Función para refrescar perfil
- `isLoaded`: Boolean indicando si el perfil está cargado

### Logger

**Eventos registrados**:

```typescript
// Éxito
logger.info("PROFILE_UPDATE_SUCCESS", `User ${user.id} updated their profile.`);

// Error
logger.error("PROFILE_UPDATE_FAILED", `Failed to update profile for user ${user.id}`, {
  error: errorMessage
});
```

---

## 🧪 Casos de Uso

### 1. Actualizar nombre y apellido

**Flujo**:
1. Usuario ingresa a /profile
2. Modifica firstName y lastName
3. Click en "Guardar Cambios"
4. Toast loading aparece
5. Supabase actualiza la tabla
6. refreshProfile() actualiza el contexto
7. Toast success reemplaza al loading
8. Logger registra PROFILE_UPDATE_SUCCESS

### 2. Cambiar perfil de inversor

**Flujo**:
1. Usuario abre dropdown "Perfil de Inversor"
2. Selecciona "Agresivo"
3. `onInvestorProfileChange("aggressive")` se llama
4. Estado se actualiza inmediatamente
5. Click en "Guardar Cambios"
6. Actualización en Supabase
7. Confirmación con toast

### 3. Seleccionar múltiples intereses

**Flujo**:
1. Usuario hace click en checkbox "Análisis Fundamental"
2. `handleInterestChange("fundamental_analysis")` se ejecuta
3. Estado: `{ fundamental_analysis: true }`
4. Usuario hace click en "Inversión por Dividendos"
5. Estado: `{ fundamental_analysis: true, dividends: true }`
6. Click en "Guardar Cambios"
7. JSON completo se guarda en `onboarding_profile.interests`

### 4. Perfil vacío (nuevo usuario)

**Flujo**:
1. Nuevo usuario sin datos en profile
2. extractOnboardingProfile retorna valores por defecto
3. Formularios muestran placeholders
4. Usuario completa información
5. Submit guarda todos los campos
6. Próxima visita muestra datos guardados

---

## ⚡ Optimizaciones

### Performance

1. **useEffect con dependencia única**:
   ```typescript
   useEffect(() => {
     // Extracción de datos
   }, [profile]); // Solo se ejecuta cuando profile cambia
   ```

2. **Componentes separados**:
   - PersonalInfoForm y InvestmentPreferencesForm
   - Re-renders aislados cuando cambian sus props específicas

3. **Estado local en vez de controlled components complejos**:
   - Cada campo tiene su propio estado
   - No hay objeto profile intermedio que cause re-renders innecesarios

### Bundle Size

**Archivo compilado**: `profile-page-6UQVqkka.js` → 8.73 kB (2.83 kB gzip)

**Tamaño comparativo**:
- Más pequeño que portfolio (9.21 kB)
- Similar a news (7.60 kB)
- Feature ligera y eficiente

**Estrategias**:
- Componentes pequeños y enfocados
- Sin dependencias pesadas
- Reutilización de shadcn/ui components

---

## 🐛 Manejo de Errores

### Validaciones

```typescript
// Validación de campos obligatorios
const { isValid, errors } = validateProfileForm(firstName, lastName);
if (!isValid) {
  errors.forEach(error => toast.error(error));
  return;
}
```

### Errores de Supabase

```typescript
try {
  const { error } = await supabase.from("profiles").update(...);
  if (error) throw new Error(formatSupabaseError(error));
} catch (error: unknown) {
  toast.error("No se pudo actualizar el perfil.");
  const errorMessage = formatSupabaseError(error);
  void logger.error("PROFILE_UPDATE_FAILED", ..., { error: errorMessage });
}
```

### Estado de Carga

```typescript
if (!isLoaded) {
  return (
    <div className="p-4 sm:p-6">
      <ProfileSkeleton />
    </div>
  );
}
```

### Datos Faltantes

```typescript
// Extracción segura con valores por defecto
const onboarding = extractOnboardingProfile(profile.onboarding_profile);
setInvestorProfile(onboarding.investorProfile ?? "");
setExperience(onboarding.experience ?? "");
setInterests(onboarding.interests ?? {});
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

**Políticas en Supabase**:
```sql
-- Solo el propietario puede ver su perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Solo el propietario puede actualizar su perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### Validación de Usuario

```typescript
const { user } = useAuth();
if (!user) return; // En handleSubmit, previene actualizaciones sin autenticación
```

### Sanitización de Datos

- Supabase maneja sanitización automática de inputs
- `onboarding_profile` es JSONB validado por Postgres
- No se permiten scripts o HTML en campos de texto

---

## 🚀 Roadmap Futuro

### Funcionalidades Pendientes

1. **Avatar del Usuario**:
   - Upload de imagen de perfil
   - Integración con Supabase Storage
   - Preview antes de subir
   - Crop y resize automático

2. **Configuraciones Adicionales**:
   - Idioma preferido
   - Zona horaria
   - Moneda por defecto (USD, ARS, EUR, etc.)

3. **Privacidad**:
   - Configurar visibilidad del perfil
   - Compartir estadísticas públicamente
   - Exportar datos personales (GDPR)

4. **Notificaciones**:
   - Preferencias de email
   - Frecuencia de newsletters
   - Alertas push

5. **Verificación**:
   - Badge de verificación
   - Vincular cuenta de broker
   - Verificación de email mejorada

6. **Seguridad**:
   - Cambiar contraseña desde perfil
   - Autenticación de dos factores (2FA)
   - Historial de sesiones activas

---

## 📚 Recursos

### Documentación Externa

- [Supabase Profiles](https://supabase.com/docs/guides/auth/managing-user-data)
- [Framer Motion - Animations](https://www.framer.com/motion/)
- [React Hook Form - Validation](https://react-hook-form.com/) (consideración futura)

### Componentes de shadcn/ui Usados

- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`
- `Button`
- `Input`
- `Label`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Checkbox`
- `Skeleton`

---

## 💡 Mejores Prácticas

### Para Desarrolladores

1. **Separación de Concerns**:
   - Forms en componentes separados
   - Utilidades en lib/
   - Tipos centralizados

2. **Validación**:
   - Siempre validar antes de enviar a Supabase
   - Usar funciones de utilidad para validaciones reutilizables
   - Mostrar errores claros al usuario

3. **Estado**:
   - Un estado por campo (en vez de objeto grande)
   - useEffect solo con dependencia `profile`
   - No actualizar estado durante render

4. **Tipos**:
   - Interfaces bien definidas para todas las props
   - Type guards para datos externos (extractOnboardingProfile)
   - Evitar `any` y `unknown` sin validación

5. **UX**:
   - Loading states con skeletons
   - Toast notifications claras
   - Transiciones suaves en todos los elementos interactivos
   - Placeholders informativos

---

## 👥 Contribución

Para contribuir a esta feature:

1. Mantén la estructura de carpetas consistente
2. Añade tipos para todas las props nuevas
3. Extrae constantes a lib/profile.utils.ts
4. Documenta funciones complejas con JSDoc
5. Usa las funciones de validación existentes
6. Mantén los componentes pequeños y enfocados
7. Añade skeletons para nuevas secciones
8. Registra eventos importantes con logger

---

**Última actualización**: Octubre 2024  
**Versión**: 2.0.0  
**Autor**: Financial Analysis Team
