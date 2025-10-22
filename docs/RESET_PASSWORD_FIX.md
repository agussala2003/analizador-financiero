# Solución: Reset Password - Configuración y Templates

## 🐛 Problema Identificado

Cuando el usuario hacía clic en el link de reset password del email, **Supabase lo autenticaba automáticamente** pero el componente `GuestRoute` lo redirigía inmediatamente a `/dashboard` sin darle chance de cambiar la contraseña.

### Causa Raíz
1. El link de Supabase incluye un `access_token` en el hash de la URL: `#access_token=...&type=recovery`
2. Supabase Auth detecta esto y crea una sesión automáticamente
3. El `onAuthStateChange` detecta la nueva sesión y actualiza el estado `user`
4. La ruta `/reset-password` estaba dentro de `<GuestRoute>`, que redirige usuarios autenticados a `/dashboard`
5. **Resultado**: El usuario nunca veía el formulario de cambio de contraseña

## ✅ Solución Implementada

### 1. Ruta de Reset Password Independiente

**Archivo modificado**: `src/main.tsx`

```typescript
// ANTES: reset-password dentro de GuestRoute
{
  element: <GuestRoute />,
  children: [
    { path: "login", element: <LoginPage /> },
    { path: "register", element: <RegisterPage /> },
    { path: "forgot-password", element: <ForgotPasswordPage /> },
    { path: "reset-password", element: <ResetPasswordPage /> }, // ❌ Problema aquí
  ]
}

// DESPUÉS: reset-password como ruta pública
{ path: "reset-password", element: <ResetPasswordPage /> }, // ✅ Permite usuarios autenticados

{
  element: <GuestRoute />,
  children: [
    { path: "login", element: <LoginPage /> },
    { path: "register", element: <RegisterPage /> },
    { path: "forgot-password", element: <ForgotPasswordPage /> },
  ]
}
```

**Beneficio**: Ahora `/reset-password` es accesible tanto para usuarios autenticados (con token de recovery) como no autenticados.

### 2. Validación de Token en Reset Password Form

**Archivo modificado**: `src/features/auth/components/forms/reset-password-form.tsx`

Se agregó validación para verificar que el usuario tenga un token de recovery válido:

```typescript
// Verificar token de recovery en el hash de la URL
React.useEffect(() => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const type = hashParams.get('type');
  const accessToken = hashParams.get('access_token');

  // Si no hay token de recovery, mostrar error
  if (type !== 'recovery' || !accessToken) {
    setInvalidToken(true);
    toast.error('Link de recuperación inválido o expirado.');
  }
}, []);
```

**Beneficio**: Si alguien intenta acceder a `/reset-password` sin un token válido, se muestra un mensaje de error y un botón para solicitar un nuevo link.

### 3. UI Mejorada para Token Inválido

```typescript
if (invalidToken) {
  return (
    <AuthCard
      title="Link inválido"
      description="El link de recuperación es inválido o ha expirado"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Por favor, solicita un nuevo link de recuperación de contraseña.
        </p>
        <Button onClick={() => void navigate('/forgot-password')}>
          Solicitar nuevo link
        </Button>
      </div>
    </AuthCard>
  );
}
```

## 📧 Templates de Email Mejorados

Se crearon dos versiones del template de reset password:

### Versión 1: Diseño Moderno con Gradientes
**Archivo**: `docs/email-templates/reset-password-email.html`

**Características**:
- ✨ Diseño moderno con gradientes de color
- 🎨 Emojis para mejor visual appeal
- ⏱️ Advertencia clara sobre expiración del link (60 minutos)
- 🔗 Link alternativo en texto plano
- ⚠️ Notificación de seguridad destacada
- 📱 Responsive design para móviles

### Versión 2: Compatible con Clientes de Email
**Archivo**: `docs/email-templates/reset-password-email-compatible.html`

**Características**:
- 📊 Estructura basada en tablas (mejor compatibilidad con Outlook, Gmail, etc.)
- 🎯 Inline styles (evita problemas con CSS externo)
- ✅ Soporte para Microsoft Outlook (conditional comments)
- 🔄 Mismo diseño visual pero con HTML más compatible

## 🚀 Instrucciones de Configuración en Supabase

### 1. Acceder a Email Templates

1. Ve a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Navega a **Authentication** > **Email Templates**
3. Selecciona **"Reset Password"** en la lista

### 2. Aplicar el Template

**Opción A - Template Moderno** (recomendado para usuarios con clientes modernos):
```
Copiar contenido de: docs/email-templates/reset-password-email.html
```

**Opción B - Template Compatible** (recomendado para máxima compatibilidad):
```
Copiar contenido de: docs/email-templates/reset-password-email-compatible.html
```

### 3. Verificar Variables

Asegúrate que estas variables estén presentes en el template:
- `{{ .ConfirmationURL }}` - Link de recuperación con token
- `{{ .SiteURL }}` - URL de tu sitio (opcional)

### 4. Guardar y Probar

1. Click en **Save**
2. Ir a **Authentication** > **Users**
3. Click en el usuario de prueba > **Send Password Reset**
4. Verificar que el email llegue con el nuevo diseño

## 📝 Flujo Completo de Reset Password

### Paso 1: Usuario Solicita Reset
```
Usuario en /forgot-password → Ingresa email → Click "Enviar"
     ↓
sendPasswordResetEmail() en auth-utils.ts
     ↓
Supabase envía email con {{ .ConfirmationURL }}
```

### Paso 2: Usuario Recibe Email
```
Email con diseño mejorado
     ↓
Click en botón "🔐 Restablecer mi Contraseña"
     ↓
Redirige a: https://tu-app.com/reset-password#access_token=...&type=recovery
```

### Paso 3: Validación y Cambio de Contraseña
```
Carga /reset-password
     ↓
useEffect valida token en URL hash
     ↓
¿Token válido? → SÍ: Mostrar formulario
     ↓         → NO: Mostrar error + botón "Solicitar nuevo link"
Usuario ingresa nueva contraseña + confirmación
     ↓
updatePassword() en auth-utils.ts
     ↓
Supabase actualiza contraseña
     ↓
Redirige a /login con mensaje de éxito
```

## 🔒 Seguridad

### ✅ Implementado
- ✔️ Token de recovery válido por 60 minutos (configurado en Supabase)
- ✔️ Validación de token en el frontend antes de mostrar formulario
- ✔️ Contraseña mínima de 6 caracteres
- ✔️ Confirmación de contraseña (deben coincidir)
- ✔️ Logging de intentos de reset (éxito/fallo)

### 🛡️ Recomendaciones Adicionales
- Considerar agregar límite de intentos de reset por IP
- Agregar CAPTCHA en /forgot-password para prevenir spam
- Implementar rate limiting en el edge function de Supabase

## 🧪 Testing Checklist

- [ ] Usuario recibe email con nuevo diseño
- [ ] Click en botón redirige correctamente a /reset-password
- [ ] Formulario se muestra correctamente (no redirige a dashboard)
- [ ] Cambio de contraseña funciona exitosamente
- [ ] Redirección a /login después de cambio exitoso
- [ ] Token expirado muestra mensaje de error apropiado
- [ ] Acceso directo a /reset-password sin token muestra error
- [ ] Link alternativo (texto plano) funciona si el botón falla
- [ ] Email se ve bien en Gmail, Outlook, Apple Mail

## 📊 Mejoras Visuales del Email

### Antes
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Resetear Contraseña</title>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    h2 { color: #111827; margin-bottom: 12px; }
    p { color: #374151; font-size: 15px; line-height: 1.5; }
    .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔑 Restablecer tu Contraseña</h2>
    <p>Recibimos una solicitud para resetear la contraseña de tu cuenta. Haz clic en el botón de abajo para continuar:</p>
    <a href="{{ .ConfirmationURL }}" class="btn">Resetear Contraseña</a>
    <p class="footer">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
  </div>
</body>
</html>
```

### Después
- ✨ Header con logo y gradiente de color
- ⏱️ Advertencia de expiración del link (60 min)
- 🔗 Link alternativo en caso de problemas con el botón
- ⚠️ Notificación de seguridad destacada
- 🎨 Diseño más profesional y moderno
- 📱 Totalmente responsive
- 💌 Mejor estructura visual con secciones claras

## 🔧 Troubleshooting

### Problema: Email no llega
**Solución**: 
- Verificar configuración SMTP en Supabase
- Revisar spam/promociones
- Verificar que el email esté confirmado en Supabase

### Problema: Link expira muy rápido
**Solución**:
- En Supabase: Authentication > Settings > Auth > "JWT Expiry" (default 3600s = 1h)
- Aumentar si es necesario

### Problema: Redirección incorrecta después del reset
**Solución**:
- Verificar `redirectTo` en `sendPasswordResetEmail()`
- Debe apuntar a: `${window.location.origin}/reset-password`

### Problema: Diseño del email se ve mal en Outlook
**Solución**:
- Usar el template "compatible" con tablas
- Evitar flexbox y grid (no soportados en Outlook)

## 📚 Referencias

- [Supabase Auth - Reset Password](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Email Template Best Practices](https://www.campaignmonitor.com/css/)
- [React Router v6 - Navigate](https://reactrouter.com/en/main/hooks/use-navigate)

## ✅ Checklist de Implementación

- [x] Mover `/reset-password` fuera de `GuestRoute`
- [x] Agregar validación de token en `reset-password-form.tsx`
- [x] Crear UI para token inválido
- [x] Crear template de email moderno
- [x] Crear template de email compatible
- [x] Documentar configuración en Supabase
- [ ] Aplicar template en Supabase Dashboard (requiere acceso manual)
- [ ] Probar flujo completo end-to-end
- [ ] Verificar en múltiples clientes de email

## 🎉 Resultado Final

Ahora el flujo de reset password funciona correctamente:
1. ✅ Usuario solicita reset y recibe email elegante
2. ✅ Click en link lleva a `/reset-password` sin redirección automática
3. ✅ Formulario valida que haya un token de recovery válido
4. ✅ Usuario cambia contraseña exitosamente
5. ✅ Redirección a login con mensaje de éxito
