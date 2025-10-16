-- =============================================================================
-- CONFIGURACIÓN DE STORAGE PARA SUBIDA DE IMÁGENES EN BLOGS
-- =============================================================================
-- Este script configura el bucket de Supabase Storage para almacenar imágenes
-- de blogs con las políticas de seguridad adecuadas.
--
-- IMPORTANTE: Este script debe ejecutarse en la consola SQL de Supabase
-- después de crear manualmente el bucket 'blog-images' en el dashboard.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PASO 1: Crear el bucket (EJECUTAR MANUALMENTE EN SUPABASE DASHBOARD)
-- -----------------------------------------------------------------------------
-- No se puede crear un bucket mediante SQL directamente.
-- Debes ir a: Storage > New Bucket
-- 
-- Configuración del bucket:
--   - Name: blog-images
--   - Public: YES (✓)
--   - File size limit: 5242880 (5MB en bytes) [opcional]
--   - Allowed MIME types: image/* [opcional]
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- PASO 2: Configurar las políticas de seguridad (RLS Policies)
-- -----------------------------------------------------------------------------

-- Limpiar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can upload images to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;

-- -----------------------------------------------------------------------------
-- POLÍTICA 1: INSERT - Permitir subir imágenes
-- -----------------------------------------------------------------------------
-- Esta política permite que usuarios autenticados suban imágenes
-- SOLO a su propia carpeta (identificada por su user_id)
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can upload images to their own folder" ON storage.objects IS 
'Permite que usuarios autenticados suban imágenes solo a su carpeta personal (user_id)';

-- -----------------------------------------------------------------------------
-- POLÍTICA 2: SELECT - Permitir ver imágenes
-- -----------------------------------------------------------------------------
-- Esta política permite que TODOS (incluso usuarios no autenticados)
-- puedan ver las imágenes del blog (necesario para que los artículos se vean)
CREATE POLICY "Anyone can view blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

COMMENT ON POLICY "Anyone can view blog images" ON storage.objects IS 
'Permite acceso público de lectura a todas las imágenes del blog';

-- -----------------------------------------------------------------------------
-- POLÍTICA 3: DELETE - Permitir eliminar imágenes propias
-- -----------------------------------------------------------------------------
-- Esta política permite que usuarios autenticados eliminen
-- SOLO sus propias imágenes (de su carpeta)
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can delete their own images" ON storage.objects IS 
'Permite que usuarios eliminen solo las imágenes de su carpeta personal';

-- -----------------------------------------------------------------------------
-- POLÍTICA 4: UPDATE - Permitir actualizar metadatos de imágenes propias
-- -----------------------------------------------------------------------------
-- Esta política permite que usuarios actualicen los metadatos
-- de sus propias imágenes (como nombre, etc.)
CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'blog-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMENT ON POLICY "Users can update their own images" ON storage.objects IS 
'Permite que usuarios actualicen metadatos de imágenes en su carpeta personal';

-- =============================================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =============================================================================
-- Para verificar que las políticas se crearon correctamente, ejecuta:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%blog%'
ORDER BY policyname;

-- =============================================================================
-- TESTING DE POLÍTICAS (OPCIONAL)
-- =============================================================================
-- Para probar que las políticas funcionan correctamente:
--
-- 1. Usuario autenticado puede subir a su carpeta:
--    storage.objects.insert({ 
--      bucket_id: 'blog-images', 
--      name: '{user_id}/test.jpg',
--      ...
--    })
--    ✅ DEBE FUNCIONAR
--
-- 2. Usuario autenticado NO puede subir a carpeta de otro:
--    storage.objects.insert({ 
--      bucket_id: 'blog-images', 
--      name: '{other_user_id}/test.jpg',
--      ...
--    })
--    ❌ DEBE FALLAR
--
-- 3. Usuario anónimo puede ver imágenes:
--    storage.objects.select().eq('bucket_id', 'blog-images')
--    ✅ DEBE FUNCIONAR
--
-- 4. Usuario puede eliminar solo sus imágenes:
--    storage.objects.delete().eq('name', '{user_id}/test.jpg')
--    ✅ DEBE FUNCIONAR (si es su carpeta)
--    ❌ DEBE FALLAR (si es carpeta de otro)
-- =============================================================================

-- =============================================================================
-- ESTRUCTURA DE CARPETAS ESPERADA
-- =============================================================================
-- blog-images/
--   ├── {user_id_1}/
--   │   ├── inline-1697xxx-abc123.jpg
--   │   ├── inline-1697xxx-def456.png
--   │   └── featured-1697xxx-ghi789.jpg
--   ├── {user_id_2}/
--   │   ├── inline-1697xxx-jkl012.jpg
--   │   └── ...
--   └── ...
-- =============================================================================

-- =============================================================================
-- LIMPIEZA DE IMÁGENES HUÉRFANAS (OPCIONAL - EJECUTAR PERIÓDICAMENTE)
-- =============================================================================
-- Este script elimina imágenes que ya no están referenciadas en ningún blog

-- IMPORTANTE: REVISAR ANTES DE EJECUTAR EN PRODUCCIÓN
-- Este es un ejemplo, deberías ajustarlo según tu esquema de base de datos

/*
WITH referenced_images AS (
  -- Obtener todas las URLs de imágenes referenciadas en blogs
  SELECT DISTINCT
    regexp_matches(content, '!\[.*?\]\((https://.*?blog-images.*?)\)', 'g') AS image_url
  FROM blogs
  UNION
  SELECT DISTINCT featured_image_url
  FROM blogs
  WHERE featured_image_url IS NOT NULL
),
storage_files AS (
  -- Obtener todos los archivos en el bucket
  SELECT 
    name,
    (SELECT publicUrl FROM storage.get_public_url('blog-images', name)) as public_url
  FROM storage.objects
  WHERE bucket_id = 'blog-images'
),
orphaned_files AS (
  -- Encontrar archivos que no están en referenced_images
  SELECT sf.name
  FROM storage_files sf
  LEFT JOIN referenced_images ri ON sf.public_url = ri.image_url[1]
  WHERE ri.image_url IS NULL
    AND sf.name NOT LIKE '%featured%' -- Preservar imágenes destacadas
    AND age(current_timestamp, (SELECT created_at FROM storage.objects WHERE name = sf.name)) > interval '30 days'
)
-- Ver archivos huérfanos (NO ELIMINAR AÚN, SOLO VER)
SELECT * FROM orphaned_files;

-- Para ELIMINAR (descomentar con precaución):
-- DELETE FROM storage.objects 
-- WHERE name IN (SELECT name FROM orphaned_files);
*/

-- =============================================================================
-- FIN DEL SCRIPT
-- =============================================================================

-- Resumen de lo configurado:
-- ✅ 4 políticas RLS creadas
-- ✅ Acceso de lectura público
-- ✅ Subida restringida a carpeta propia
-- ✅ Eliminación restringida a archivos propios
-- ✅ Actualización restringida a archivos propios

-- Siguiente paso: Probar la funcionalidad desde la aplicación web
