-- ========================================
-- Script: Verificar estados de suggestions
-- ========================================
-- Este script verifica y actualiza el enum suggestion_status
-- con los valores correctos

-- 1. Ver el enum actual
SELECT 
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'suggestion_status'
ORDER BY e.enumsortorder;

-- 2. Si necesitas recrear el enum con los valores correctos:
-- NOTA: Solo ejecuta esto si los valores actuales son diferentes

-- DROP TYPE IF EXISTS public.suggestion_status CASCADE;

-- CREATE TYPE public.suggestion_status AS ENUM (
--     'nueva',
--     'en revisión',
--     'planeada',
--     'completada',
--     'rechazada'
-- );

-- 3. Verificar estructura de la tabla suggestions
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'suggestions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar foreign keys
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'suggestions' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 5. Agregar política RLS para admins
DO $$
BEGIN
    -- Eliminar política anterior si existe
    DROP POLICY IF EXISTS "Admins can manage all suggestions" ON public.suggestions;
    
    -- Crear política para que admins puedan gestionar todas las sugerencias
    CREATE POLICY "Admins can manage all suggestions"
        ON public.suggestions 
        FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
            )
        );
    
    RAISE NOTICE '✅ Política de admin creada para suggestions';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Error al crear política: %', SQLERRM;
END $$;

-- 6. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'suggestions';

-- 7. Ver ejemplos de sugerencias con sus estados
SELECT 
    id,
    LEFT(content, 50) as content_preview,
    status,
    upvotes,
    created_at,
    user_id
FROM public.suggestions 
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Contar sugerencias por estado
SELECT 
    status,
    COUNT(*) as total
FROM public.suggestions
GROUP BY status
ORDER BY total DESC;
