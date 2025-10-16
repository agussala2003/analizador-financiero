-- =============================================================================
-- TABLA DE MENSAJES DE CONTACTO
-- =============================================================================
-- Esta migración crea la tabla para almacenar los mensajes enviados desde
-- el formulario de contacto de la aplicación.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CREAR TABLA: contact_messages
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del remitente
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Contenido del mensaje
  message TEXT NOT NULL,
  
  -- Estado del mensaje
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  
  -- Usuario asociado (si está autenticado)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  
  -- Información adicional
  user_agent TEXT,
  ip_address INET,
  
  -- Notas internas (para el equipo)
  admin_notes TEXT
);

-- -----------------------------------------------------------------------------
-- COMENTARIOS
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.contact_messages IS 'Almacena los mensajes enviados desde el formulario de contacto';
COMMENT ON COLUMN public.contact_messages.id IS 'Identificador único del mensaje';
COMMENT ON COLUMN public.contact_messages.name IS 'Nombre del remitente';
COMMENT ON COLUMN public.contact_messages.email IS 'Email del remitente';
COMMENT ON COLUMN public.contact_messages.message IS 'Contenido del mensaje';
COMMENT ON COLUMN public.contact_messages.status IS 'Estado: pending (nuevo), read (leído), replied (respondido), archived (archivado)';
COMMENT ON COLUMN public.contact_messages.user_id IS 'ID del usuario si estaba autenticado al enviar el mensaje';
COMMENT ON COLUMN public.contact_messages.created_at IS 'Fecha y hora de creación del mensaje';
COMMENT ON COLUMN public.contact_messages.read_at IS 'Fecha y hora en que se leyó el mensaje';
COMMENT ON COLUMN public.contact_messages.replied_at IS 'Fecha y hora en que se respondió el mensaje';
COMMENT ON COLUMN public.contact_messages.admin_notes IS 'Notas internas para el equipo (no visibles para el usuario)';

-- -----------------------------------------------------------------------------
-- ÍNDICES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- -----------------------------------------------------------------------------
-- TRIGGER: Actualizar updated_at automáticamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_messages_updated_at();

-- -----------------------------------------------------------------------------
-- POLÍTICAS RLS (Row Level Security)
-- -----------------------------------------------------------------------------

-- Habilitar RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Los usuarios pueden insertar sus propios mensajes
CREATE POLICY "Users can insert their own messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (true); -- Permitir a cualquiera (incluso anónimos) enviar mensajes

COMMENT ON POLICY "Users can insert their own messages" ON public.contact_messages IS 
'Permite a cualquier usuario (autenticado o anónimo) enviar un mensaje de contacto';

-- POLÍTICA 2: Los usuarios autenticados pueden ver sus propios mensajes
CREATE POLICY "Users can view their own messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own messages" ON public.contact_messages IS 
'Permite a los usuarios autenticados ver solo sus propios mensajes de contacto';

-- POLÍTICA 3: Los administradores pueden ver todos los mensajes
CREATE POLICY "Admins can view all messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrador'
  )
);

COMMENT ON POLICY "Admins can view all messages" ON public.contact_messages IS 
'Permite a los administradores ver todos los mensajes de contacto';

-- POLÍTICA 4: Los administradores pueden actualizar mensajes (marcar como leído, responder, etc.)
CREATE POLICY "Admins can update messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrador'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrador'
  )
);

COMMENT ON POLICY "Admins can update messages" ON public.contact_messages IS 
'Permite a los administradores actualizar el estado y notas de los mensajes';

-- POLÍTICA 5: Los administradores pueden eliminar mensajes
CREATE POLICY "Admins can delete messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'administrador'
  )
);

COMMENT ON POLICY "Admins can delete messages" ON public.contact_messages IS 
'Permite a los administradores eliminar mensajes de contacto';

-- =============================================================================
-- VISTA PARA ADMINISTRADORES: Mensajes con información del usuario
-- =============================================================================
-- NOTA: Las vistas heredan las políticas RLS de las tablas subyacentes.
-- Como contact_messages ya tiene política RLS para administradores,
-- la vista automáticamente respeta esas políticas.
CREATE OR REPLACE VIEW public.contact_messages_with_user AS
SELECT 
  cm.*,
  p.first_name AS user_first_name,
  p.last_name AS user_last_name,
  p.role AS user_role
FROM public.contact_messages cm
LEFT JOIN public.profiles p ON cm.user_id = p.id;

COMMENT ON VIEW public.contact_messages_with_user IS 
'Vista que combina mensajes de contacto con información del perfil del usuario. Hereda las políticas RLS de la tabla contact_messages, por lo que solo los administradores pueden ver todos los mensajes.';

-- =============================================================================
-- FUNCIÓN: Marcar mensaje como leído
-- =============================================================================
CREATE OR REPLACE FUNCTION public.mark_contact_message_as_read(message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.contact_messages
  SET 
    status = 'read',
    read_at = NOW()
  WHERE id = message_id
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.mark_contact_message_as_read IS 
'Marca un mensaje de contacto como leído';

-- =============================================================================
-- FUNCIÓN: Marcar mensaje como respondido
-- =============================================================================
CREATE OR REPLACE FUNCTION public.mark_contact_message_as_replied(message_id UUID, notes TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE public.contact_messages
  SET 
    status = 'replied',
    replied_at = NOW(),
    admin_notes = COALESCE(notes, admin_notes)
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.mark_contact_message_as_replied IS 
'Marca un mensaje de contacto como respondido y opcionalmente agrega notas';

-- =============================================================================
-- FUNCIÓN: Obtener estadísticas de mensajes de contacto
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_contact_messages_stats()
RETURNS TABLE (
  total_messages BIGINT,
  pending_messages BIGINT,
  read_messages BIGINT,
  replied_messages BIGINT,
  archived_messages BIGINT,
  avg_response_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_messages,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_messages,
    COUNT(*) FILTER (WHERE status = 'read') AS read_messages,
    COUNT(*) FILTER (WHERE status = 'replied') AS replied_messages,
    COUNT(*) FILTER (WHERE status = 'archived') AS archived_messages,
    AVG(replied_at - created_at) FILTER (WHERE replied_at IS NOT NULL) AS avg_response_time
  FROM public.contact_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_contact_messages_stats IS 
'Retorna estadísticas sobre los mensajes de contacto';

-- =============================================================================
-- DATOS DE EJEMPLO (SOLO PARA DESARROLLO - COMENTAR EN PRODUCCIÓN)
-- =============================================================================
/*
INSERT INTO public.contact_messages (name, email, message, status)
VALUES 
  ('Juan Pérez', 'juan@example.com', 'Hola, tengo una pregunta sobre los planes premium.', 'pending'),
  ('María García', 'maria@example.com', '¿Cómo puedo exportar mis datos?', 'read'),
  ('Carlos López', 'carlos@example.com', 'Excelente plataforma, gracias!', 'replied');
*/

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
-- Para verificar que todo se creó correctamente:

-- Ver la tabla
SELECT * FROM public.contact_messages LIMIT 5;

-- Ver las políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY policyname;

-- Ver estadísticas
SELECT * FROM public.get_contact_messages_stats();

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================
