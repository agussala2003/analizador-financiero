# Auth Feature

## 📋 Descripción

Feature que maneja toda la autenticación y autorización de usuarios en la aplicación. Incluye login, registro, recuperación de contraseña y protección de rutas.

## 🏗️ Estructura del Feature

```
auth/
├── components/
│   ├── forms/                    # Formularios de autenticación
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   ├── shared/                   # Componentes compartidos
│   │   ├── auth-card.tsx
│   │   ├── form-input.tsx
│   │   ├── form-footer.tsx
│   │   └── auth-button.tsx
│   ├── admin-route.tsx           # Guard para rutas de admin
│   ├── guest-route.tsx           # Guard para rutas de invitados
│   ├── protected-route.tsx       # Guard para rutas protegidas
│   └── index.ts                  # Barrel export
├── lib/                          # Utilidades
│   └── auth-utils.ts             # Funciones de autenticación
├── pages/                        # Páginas
│   ├── login-page.tsx
│   ├── register-page.tsx
│   ├── forgot-password-page.tsx
│   └── reset-password-page.tsx
├── types/                        # Tipos TypeScript
│   └── auth.types.ts
└── README.md
```

## 🎯 Componentes Principales

### Formularios (forms/)
- **LoginForm**: Inicio de sesión con email/contraseña
- **RegisterForm**: Registro de nuevos usuarios
- **ForgotPasswordForm**: Solicitud de recuperación de contraseña
- **ResetPasswordForm**: Establecer nueva contraseña

### Componentes Compartidos (shared/)
- **AuthCard**: Tarjeta wrapper con título y descripción
- **FormInput**: Input con label reutilizable
- **FormFooter**: Footer con link a otra página
- **AuthButton**: Botón con estado de loading

### Route Guards
- **ProtectedRoute**: Protege rutas que requieren autenticación
- **GuestRoute**: Rutas solo para usuarios no autenticados
- **AdminRoute**: Rutas solo para administradores

## 📦 Tipos Principales

```typescript
// Locales en types/auth.types.ts
AuthCardProps       # Props para AuthCard
FormInputProps      # Props para FormInput
FormFooterProps     # Props para FormFooter
AuthFormState       # Estado del formulario
AuthResult          # Resultado de operación de auth
```

## 🛠️ Utilidades

### auth-utils.ts

#### Funciones de Autenticación
- `loginUser(email, password)`: Autentica usuario
- `registerUser(email, password)`: Registra nuevo usuario
- `sendPasswordResetEmail(email)`: Envía email de recuperación
- `updatePassword(newPassword)`: Actualiza contraseña

#### Validaciones
- `validateEmail(email)`: Valida formato de email
- `validatePassword(password)`: Valida requisitos de contraseña

Todas las funciones manejan logging automático con `logger` y retornan `AuthResult` con estructura consistente.

## 🔗 Dependencias

### Internas
- `src/lib/supabase.ts`: Cliente de Supabase para autenticación
- `src/lib/logger.ts`: Sistema de logging
- `src/components/ui/*`: Componentes de shadcn/ui

### Externas
- `@supabase/supabase-js`: Autenticación y gestión de usuarios
- `react-router-dom`: Navegación y guards de rutas
- `sonner`: Notificaciones toast
- `framer-motion`: Animaciones de entrada

## 📊 Métricas del Feature

### Antes de la refactorización
- **7 archivos** (5 componentes + 2 páginas)
- **~200 líneas** de código
- Lógica duplicada en formularios
- Sin componentes compartidos
- Sin páginas de recuperación de contraseña

### Después de la refactorización
- **17 archivos** organizados modularmente
- **4 formularios** completos
- **4 componentes** compartidos reutilizables
- **1 archivo de utilidades** con 6 funciones
- **1 archivo de tipos** con 6 interfaces
- **4 páginas** completas (login, register, forgot, reset)
- **1 README** con documentación completa

### Mejoras Clave
- ✅ Componentes compartidos reutilizables
- ✅ Lógica de autenticación centralizada
- ✅ Validaciones consistentes
- ✅ Sistema completo de recuperación de contraseña
- ✅ Tipos TypeScript estrictos
- ✅ JSDoc completo en todos los exports
- ✅ Logging automático de todas las operaciones
- ✅ Manejo consistente de errores

## 🚀 Uso

### Rutas de Autenticación

```typescript
// En tu router
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

### Protección de Rutas

```typescript
// Ruta protegida (requiere autenticación)
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>

// Ruta de invitado (solo usuarios no autenticados)
<Route
  path="/login"
  element={
    <GuestRoute>
      <LoginPage />
    </GuestRoute>
  }
/>

// Ruta de admin (requiere rol admin)
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminPage />
    </AdminRoute>
  }
/>
```

### Uso de Utilidades

```typescript
import { loginUser, validateEmail } from './lib/auth-utils';

// Validar email
if (!validateEmail(email)) {
  toast.error('Email inválido');
  return;
}

// Login
const result = await loginUser(email, password);
if (result.success) {
  navigate('/dashboard');
} else {
  toast.error('Error al iniciar sesión');
}
```

## 🎨 Diseño y UX

### Animaciones
- Fade in + scale (0.5s) al cargar páginas
- Estados de loading en botones
- Transiciones suaves entre estados

### Estados
- **Loading**: Botón con texto "Cargando..." y disabled
- **Success**: Toast de éxito + navegación automática
- **Error**: Toast de error con mensaje descriptivo
- **Email Sent**: Pantalla de confirmación en forgot password

### Responsive Design
- Formularios centrados verticalmente
- Max width de 28rem (448px)
- Espaciado consistente
- Compatible con móviles, tablets y desktop

## 📝 Flujos de Usuario

### Login
1. Usuario ingresa email y contraseña
2. Click en "Iniciar Sesión"
3. Validación y autenticación
4. Redirección a dashboard
5. Reload para actualizar estado

### Registro
1. Usuario ingresa email y contraseña
2. Click en "Crear Cuenta"
3. Registro en Supabase
4. Toast de éxito
5. Toast secundario: verificar email

### Recuperación de Contraseña
1. Usuario en login click "¿Olvidaste tu contraseña?"
2. Ingresa email
3. Click en "Enviar enlace de recuperación"
4. Pantalla de confirmación
5. Usuario recibe email con link
6. Click en link → redirección a /reset-password
7. Ingresa nueva contraseña (2 veces)
8. Click en "Actualizar Contraseña"
9. Redirección a login

## 🔐 Seguridad

### Validaciones
- Email: formato válido (regex)
- Contraseña: mínimo 6 caracteres
- Confirmación: coincidencia de contraseñas

### Supabase Auth
- Autenticación segura con JWT
- Email verification
- Password reset con tokens temporales
- Row Level Security (RLS) en base de datos

### Logging
- Todos los intentos de login/registro
- Errores de autenticación
- Recuperación de contraseñas
- Actualizaciones de contraseña

## 🧪 Testing

### Casos de Prueba Recomendados
- [ ] Login exitoso
- [ ] Login con credenciales incorrectas
- [ ] Registro exitoso
- [ ] Registro con email duplicado
- [ ] Forgot password con email válido
- [ ] Forgot password con email no registrado
- [ ] Reset password exitoso
- [ ] Reset password con contraseñas no coincidentes
- [ ] Protección de rutas (authenticated/guest)
- [ ] Redirección automática post-login

## 🔄 Próximas Mejoras

- [ ] Login con Google/GitHub (OAuth)
- [ ] Remember me checkbox
- [ ] Mostrar/ocultar contraseña
- [ ] Indicador de fortaleza de contraseña
- [ ] Rate limiting en formularios
- [ ] 2FA (Two-Factor Authentication)
- [ ] Cambio de contraseña desde perfil
- [ ] Cambio de email
- [ ] Eliminación de cuenta

## 📚 Referencias

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Router v6](https://reactrouter.com/)
- [Sonner Toast](https://sonner.emilkowal.ski/)
- [Framer Motion](https://www.framer.com/motion/)
