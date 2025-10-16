# Configuración de Subida de Imágenes en Blogs

## 📋 Resumen

Se ha implementado la funcionalidad completa para que los usuarios puedan adjuntar imágenes en el contenido de los blogs mediante tres métodos:

1. **Botón de subir archivo** 📤
2. **Pegar desde portapapeles** (Ctrl+V) 📋
3. **Arrastrar y soltar** (Drag & Drop) 🖱️

## 🔧 Configuración Requerida en Supabase

### 1. Crear el Bucket de Storage

Debes crear un bucket llamado `blog-images` en Supabase Storage:

**Pasos en Supabase Dashboard:**

1. Ve a **Storage** en el panel lateral
2. Haz clic en **New Bucket**
3. Configura el bucket con estos parámetros:
   - **Name**: `blog-images`
   - **Public bucket**: ✅ **SÍ** (para que las URLs sean públicas)
   - **File size limit**: 5 MB (opcional, también validamos en el frontend)
   - **Allowed MIME types**: `image/*` (opcional)

### 2. Configurar las Políticas de Seguridad (RLS Policies)

Una vez creado el bucket, necesitas configurar las políticas de acceso:

#### **Política de INSERT (Subir archivos)**
```sql
-- Permitir que usuarios autenticados suban archivos a su propia carpeta
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### **Política de SELECT (Ver archivos)**
```sql
-- Permitir que todos vean las imágenes (público)
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');
```

#### **Política de DELETE (Eliminar archivos)**
```sql
-- Permitir que usuarios eliminen solo sus propias imágenes
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Estructura de Archivos en Storage

Los archivos se organizan de la siguiente manera:

```
blog-images/
  ├── {user_id_1}/
  │   ├── inline-1697xxx-abc123.jpg
  │   ├── inline-1697xxx-def456.png
  │   └── ...
  ├── {user_id_2}/
  │   ├── inline-1697xxx-ghi789.jpg
  │   └── ...
  └── ...
```

Cada usuario tiene su propia carpeta identificada por su `user_id`.

## ✨ Características Implementadas

### 1. Subida Manual de Archivos

- **Botón**: Icono de **Upload** en la barra de herramientas del editor
- **Funcionalidad**: Abre un diálogo para seleccionar imagen
- **Validaciones**:
  - Solo archivos de imagen (jpg, png, gif, webp, etc.)
  - Máximo 5MB por archivo
  - Usuario debe estar autenticado

### 2. Pegar Imágenes (Ctrl+V)

- **Evento**: `onPaste` en el textarea
- **Funcionalidad**: Detecta cuando el usuario pega una imagen desde el portapapeles
- **Uso común**: Pegar capturas de pantalla
- **Comportamiento**: Sube automáticamente y inserta el markdown

### 3. Arrastrar y Soltar (Drag & Drop)

- **Eventos**: `onDragOver`, `onDragLeave`, `onDrop`
- **Visual**: El textarea se resalta cuando arrastras una imagen sobre él
- **Funcionalidad**: Detecta cuando sueltas un archivo de imagen
- **UX**: Feedback visual con borde azul y fondo tintado

## 🎨 UX Mejorada

### Estados Visuales

1. **Normal**: Textarea con borde estándar
2. **Dragging**: Borde azul y fondo tintado cuando arrastras una imagen
3. **Uploading**: El botón de upload muestra un spinner giratorio

### Mensajes de Feedback

- ✅ **Éxito**: "Imagen subida correctamente"
- ❌ **Error - Tipo inválido**: "Solo se permiten archivos de imagen"
- ❌ **Error - Tamaño**: "La imagen no debe superar 5MB"
- ❌ **Error - No autenticado**: "Debes iniciar sesión para subir imágenes"
- ❌ **Error - Upload falla**: "Error al subir la imagen"

### Tip Actualizado

Se actualizó el mensaje de ayuda debajo del editor:

```
💡 Tip: Usa Markdown para dar formato. Puedes **pegar imágenes** (Ctrl+V) 
o **arrastrar y soltar** archivos directamente en el editor.
```

## 📝 Código Modificado

### Archivo Principal

- **`src/features/blog/components/rich-text-editor.tsx`**

### Nuevas Dependencias Utilizadas

```typescript
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/use-auth';
import { toast } from 'sonner';
```

### Nuevos Hooks y Refs

```typescript
const [isUploading, setIsUploading] = useState(false);
const [isDragging, setIsDragging] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);
const { profile } = useAuth();
```

### Nueva Función: `uploadImageToSupabase`

Función principal que:
1. Valida el archivo (tipo y tamaño)
2. Genera nombre único con timestamp y hash aleatorio
3. Sube a Supabase Storage en `{user_id}/{filename}`
4. Obtiene la URL pública
5. Retorna la URL para insertarla en el markdown

## 🔐 Seguridad

### Validaciones Frontend

- ✅ Tipo de archivo: Solo `image/*`
- ✅ Tamaño máximo: 5MB
- ✅ Usuario autenticado: Requiere `profile.id`

### Validaciones Backend (RLS Policies)

- ✅ Solo usuarios autenticados pueden subir
- ✅ Solo pueden subir a su propia carpeta
- ✅ Solo pueden eliminar sus propias imágenes
- ✅ Todos pueden ver las imágenes (público)

### Nombres de Archivo Únicos

Formato: `inline-{timestamp}-{random}.{extension}`

Ejemplo: `inline-1697123456789-a1b2c3.jpg`

Esto previene:
- Colisiones de nombres
- Sobrescritura accidental
- Adivinación de URLs

## 🚀 Uso en Producción

### Pasos para Activar

1. **Crear el bucket** en Supabase Dashboard (Storage)
2. **Configurar las políticas RLS** (ejecutar los 3 scripts SQL)
3. **Verificar permisos** (probar subiendo una imagen de prueba)
4. **Desplegar** la aplicación con los cambios

### Testing

Para probar la funcionalidad:

1. **Login** con un usuario autenticado
2. Ir a **Crear Blog** o **Editar Blog**
3. Probar los 3 métodos de subida:
   - Clic en botón Upload
   - Tomar captura (Win+Shift+S) y pegar (Ctrl+V)
   - Arrastrar imagen desde explorador de archivos

## 📊 Monitoreo

### Métricas Sugeridas

- Cantidad de imágenes subidas por usuario
- Tamaño promedio de imágenes
- Errores de subida
- Tiempo de subida

### Storage Limits

Verifica los límites de tu plan de Supabase:
- **Free**: 1GB de storage
- **Pro**: 8GB de storage (incluido)
- **Adicional**: $0.021/GB al mes

## 🎯 Mejoras Futuras

### Corto Plazo
- [ ] Compresión automática de imágenes grandes
- [ ] Generación de thumbnails
- [ ] Progress bar durante la subida
- [ ] Múltiples imágenes simultáneas

### Largo Plazo
- [ ] Galería de imágenes ya subidas
- [ ] Editor de imágenes básico (crop, resize)
- [ ] CDN para imágenes (edge caching)
- [ ] Integración con servicios de optimización (Cloudinary, ImageKit)

## 🐛 Troubleshooting

### Error: "No se pudo subir la imagen"

**Posibles causas:**
1. El bucket `blog-images` no existe → Crear el bucket
2. Las políticas RLS no están configuradas → Ejecutar los scripts SQL
3. El usuario no está autenticado → Verificar sesión
4. Problema de red → Revisar conexión

### Error: "Solo se permiten archivos de imagen"

**Causa:** El archivo no es una imagen válida
**Solución:** Usar archivos jpg, png, gif, webp, svg

### El botón de Upload no hace nada

**Causa:** El input file está oculto y no responde
**Solución:** Verificar que `fileInputRef` esté conectado correctamente

### Las imágenes no se ven en el preview

**Causa:** El bucket no es público o las URLs son incorrectas
**Solución:** Verificar que el bucket tenga la opción "Public" activada

## 📚 Referencias

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)

---

**Fecha de Implementación**: 2025-10-15
**Última Actualización**: 2025-10-15
**Estado**: ✅ Implementado (requiere configuración de Supabase)
