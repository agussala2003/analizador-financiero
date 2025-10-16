# Sistema de Formulario de Contacto

## 📋 Resumen

Se ha implementado un sistema completo de formulario de contacto que permite a los usuarios enviar mensajes que se almacenan en la base de datos de Supabase. El sistema incluye validaciones, almacenamiento seguro, y está preparado para integración con servicios de email.

## 🎯 Funcionalidades Implementadas

### 1. **Formulario de Contacto**
- Campos: Nombre, Email, Mensaje
- Validaciones frontend
- Feedback visual con toasts
- Estado de carga durante envío
- Limpieza automática tras envío exitoso

### 2. **Almacenamiento en Base de Datos**
- Tabla `contact_messages` con todos los campos necesarios
- Relación opcional con usuario autenticado
- Estados: pending, read, replied, archived
- Timestamps automáticos
- Metadatos (user_agent, ip_address)

### 3. **Políticas de Seguridad (RLS)**
- Cualquiera puede enviar mensajes (incluso anónimos)
- Usuarios ven solo sus mensajes
- Administradores ven y gestionan todos los mensajes
- Funciones SQL para cambiar estados

### 4. **Panel de Administración (Preparado)**
- Vista con información del usuario
- Funciones para marcar como leído/respondido
- Estadísticas de mensajes
- Tiempo promedio de respuesta

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

1. **`src/services/contact-service.ts`** (295 líneas)
   - Servicio completo para gestionar mensajes de contacto
   - Métodos para enviar, obtener, actualizar mensajes
   - Integración con Supabase
   - TypeScript con tipos completos

2. **`docs/create-contact-messages-table.sql`** (370 líneas)
   - Script SQL para crear tabla `contact_messages`
   - 5 políticas RLS configuradas
   - Vista para administradores
   - Funciones SQL útiles
   - Índices para mejor performance

3. **`docs/CONTACT_SYSTEM_SETUP.md`** (este archivo)
   - Documentación completa del sistema
   - Guía de configuración
   - Instrucciones de integración con email

### Archivos Modificados:

1. **`src/features/contact/pages/contact-page.tsx`**
   - Integrado con `contactService`
   - Mensajes de éxito mejorados
   - Mejor manejo de errores

## 🗄️ Estructura de la Base de Datos

### Tabla: `contact_messages`

```sql
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del remitente
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Contenido
  message TEXT NOT NULL,
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Usuario asociado (opcional)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  
  -- Metadatos
  user_agent TEXT,
  ip_address INET,
  admin_notes TEXT
);
```

### Estados Posibles:

- **`pending`**: Mensaje nuevo, sin leer
- **`read`**: Mensaje leído por un administrador
- **`replied`**: Mensaje respondido
- **`archived`**: Mensaje archivado

### Índices Creados:

```sql
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
```

## 🔐 Políticas de Seguridad (RLS)

### 1. Insert - Cualquiera puede enviar mensajes
```sql
CREATE POLICY "Users can insert their own messages"
ON public.contact_messages FOR INSERT
TO public WITH CHECK (true);
```

### 2. Select - Usuarios ven sus mensajes
```sql
CREATE POLICY "Users can view their own messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### 3. Select - Admins ven todos
```sql
CREATE POLICY "Admins can view all messages"
ON public.contact_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrador'
  )
);
```

### 4. Update - Solo admins
```sql
CREATE POLICY "Admins can update messages"
ON public.contact_messages FOR UPDATE
TO authenticated
USING (role = 'administrador')
WITH CHECK (role = 'administrador');
```

### 5. Delete - Solo admins
```sql
CREATE POLICY "Admins can delete messages"
ON public.contact_messages FOR DELETE
TO authenticated
USING (role = 'administrador');
```

## 🔧 Configuración Requerida

### Paso 1: Crear la Tabla en Supabase

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `docs/create-contact-messages-table.sql`
4. Ejecuta el script
5. Verifica que la tabla se creó correctamente:

```sql
SELECT * FROM public.contact_messages LIMIT 5;
```

### Paso 2: Verificar Políticas RLS

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY policyname;
```

Deberías ver 5 políticas creadas.

## 📧 Integración con Email (Opcional pero Recomendado)

### Opción 1: Resend (Recomendado)

[Resend](https://resend.com/) es un servicio moderno de emails transaccionales con excelente DX.

#### Instalación:

```bash
npm install resend
```

#### Configuración:

1. Crear cuenta en [resend.com](https://resend.com/)
2. Obtener API Key
3. Agregar a `.env`:

```env
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Implementación:

Crea `src/services/email-service.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendContactNotification(
  name: string,
  email: string,
  message: string
) {
  try {
    await resend.emails.send({
      from: 'notificaciones@tudominio.com',
      to: 'contacto@tudominio.com', // Tu email
      subject: `Nuevo mensaje de contacto: ${name}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
```

Luego en `contact-service.ts`, después de insertar en la DB:

```typescript
// Enviar notificación por email
await sendContactNotification(
  formData.name,
  formData.email,
  formData.message
);
```

### Opción 2: Supabase Edge Functions

Crear una Edge Function para enviar emails:

```bash
supabase functions new send-contact-email
```

En `supabase/functions/send-contact-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { name, email, message } = await req.json()

  // Aquí envías el email usando el servicio que prefieras
  // (Resend, SendGrid, Mailgun, etc.)

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

### Opción 3: SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

export async function sendContactNotification(
  name: string,
  email: string,
  message: string
) {
  const msg = {
    to: 'contacto@tudominio.com',
    from: 'notificaciones@tudominio.com',
    subject: `Nuevo mensaje de contacto: ${name}`,
    html: `...`,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
```

## 📊 Panel de Administración (Futuro)

### Funciones Disponibles:

```typescript
// Ver todos los mensajes
const messages = await contactService.getAllMessages({ 
  status: 'pending',
  limit: 50 
});

// Marcar como leído
await contactService.markAsRead(messageId);

// Marcar como respondido
await contactService.markAsReplied(messageId, 'Respondido por email el...');

// Ver estadísticas
const stats = await contactService.getStats();
// {
//   total: 150,
//   pending: 12,
//   read: 8,
//   replied: 125,
//   archived: 5
// }
```

### Vista de Administración (Componente Futuro):

```tsx
// src/features/admin/pages/contact-messages-page.tsx

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  const loadMessages = async () => {
    const data = await contactService.getAllMessages({ 
      status: 'pending' 
    });
    setMessages(data);
  };

  const loadStats = async () => {
    const data = await contactService.getStats();
    setStats(data);
  };

  const handleMarkAsRead = async (id: string) => {
    await contactService.markAsRead(id);
    await loadMessages();
  };

  return (
    <div>
      <h1>Mensajes de Contacto</h1>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>Total</CardHeader>
          <CardContent>{stats?.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>Pendientes</CardHeader>
          <CardContent>{stats?.pending}</CardContent>
        </Card>
        {/* ... más stats */}
      </div>

      {/* Lista de mensajes */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((msg) => (
            <TableRow key={msg.id}>
              <TableCell>{formatDate(msg.created_at)}</TableCell>
              <TableCell>{msg.name}</TableCell>
              <TableCell>{msg.email}</TableCell>
              <TableCell>{msg.message.substring(0, 50)}...</TableCell>
              <TableCell>
                <Badge>{msg.status}</Badge>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleMarkAsRead(msg.id)}>
                  Marcar como leído
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## 🧪 Testing

### Probar el Formulario:

1. **Usuario Anónimo**:
   - Ir a `/contact`
   - Llenar formulario
   - Enviar
   - Verificar toast de éxito
   - Verificar en Supabase que se creó el registro con `user_id = null`

2. **Usuario Autenticado**:
   - Login
   - Ir a `/contact`
   - Llenar formulario
   - Enviar
   - Verificar que se creó con `user_id` del usuario

3. **Validaciones**:
   - Intentar enviar con campos vacíos → Error
   - Intentar enviar con email inválido → Error
   - Intentar enviar con mensaje < 10 caracteres → Error

### Consultas SQL Útiles:

```sql
-- Ver todos los mensajes
SELECT * FROM public.contact_messages ORDER BY created_at DESC;

-- Ver solo pendientes
SELECT * FROM public.contact_messages WHERE status = 'pending';

-- Ver mensajes con información de usuario
SELECT * FROM public.contact_messages_with_user;

-- Ver estadísticas
SELECT * FROM public.get_contact_messages_stats();

-- Marcar mensaje como leído manualmente
UPDATE public.contact_messages 
SET status = 'read', read_at = NOW() 
WHERE id = 'xxx-xxx-xxx';
```

## ✅ Checklist de Implementación

### Completado ✅

- [x] Tabla `contact_messages` diseñada
- [x] Script SQL de migración creado
- [x] Políticas RLS configuradas
- [x] Servicio `ContactService` implementado
- [x] Integración en `ContactPage`
- [x] Validaciones frontend
- [x] Validaciones backend (RLS)
- [x] TypeScript types completos
- [x] Documentación completa

### Pendiente ⏳

- [ ] Ejecutar script SQL en Supabase
- [ ] Integrar servicio de email (Resend/SendGrid/Edge Functions)
- [ ] Crear panel de administración para ver mensajes
- [ ] Agregar notificaciones en tiempo real (Supabase Realtime)
- [ ] Implementar sistema de respuestas automáticas
- [ ] Analytics de mensajes más comunes

## 🚀 Pasos Siguientes

### 1. Configurar Base de Datos (URGENTE)

```bash
# Abre Supabase Dashboard
# SQL Editor
# Ejecuta: docs/create-contact-messages-table.sql
```

### 2. Probar Funcionalidad Básica

```bash
# 1. Ir a /contact
# 2. Llenar formulario
# 3. Enviar
# 4. Verificar en Supabase Dashboard que se guardó
```

### 3. Configurar Email (OPCIONAL)

Si quieres recibir notificaciones por email:

```bash
npm install resend
# Agregar VITE_RESEND_API_KEY al .env
# Implementar sendContactNotification en contact-service.ts
```

### 4. Crear Panel Admin (FUTURO)

```bash
# Crear componente ContactMessagesPage
# Agregar ruta en router
# Restringir acceso a administradores
```

## 📧 Ejemplo de Email de Notificación

Cuando implementes el email, podrías usar este template:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9fafb; }
    .field { margin: 15px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { margin-top: 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📧 Nuevo Mensaje de Contacto</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Nombre:</div>
        <div class="value">{{name}}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">
          <a href="mailto:{{email}}">{{email}}</a>
        </div>
      </div>
      <div class="field">
        <div class="label">Mensaje:</div>
        <div class="value">{{message}}</div>
      </div>
      <div class="field">
        <div class="label">Fecha:</div>
        <div class="value">{{date}}</div>
      </div>
    </div>
    <div class="footer">
      <p>
        <a href="{{admin_url}}">Ver en Panel de Administración</a>
      </p>
    </div>
  </div>
</body>
</html>
```

## 🐛 Troubleshooting

### Error: "Error al guardar el mensaje"

**Causa**: La tabla no existe o las políticas RLS bloquean la inserción
**Solución**: Ejecutar el script SQL de migración

### Error: "Permission denied for table contact_messages"

**Causa**: RLS habilitado pero sin políticas adecuadas
**Solución**: Verificar que la política de INSERT existe y permite a `public`

### Los mensajes no aparecen en el panel admin

**Causa**: Política de SELECT para admins no configurada
**Solución**: Verificar que el usuario tiene role = 'administrador' en profiles

### Email no se envía

**Causa**: Servicio de email no configurado
**Solución**: Implementar integración con Resend/SendGrid según esta guía

---

**Fecha de Implementación**: 2025-10-15
**Última Actualización**: 2025-10-15
**Estado**: ✅ Implementado (requiere configuración de base de datos)
