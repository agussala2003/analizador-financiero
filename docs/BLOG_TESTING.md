# Guía para Probar el Sistema de Blog

## 📋 Prerequisitos

1. Usuario autenticado en la aplicación
2. Permiso `can_upload_blog` activado en la tabla `profiles` de Supabase
3. Base de datos con las siguientes tablas configuradas:
   - `profiles`
   - `blogs`
   - `blog_comments`
   - `blog_likes`
   - `blog_bookmarks`

## 🔐 Configurar Permisos de Usuario

Antes de crear blogs, debes activar el permiso en Supabase:

```sql
-- En el SQL Editor de Supabase, ejecuta:
UPDATE profiles 
SET can_upload_blog = true 
WHERE email = 'tu-email@ejemplo.com';
```

## ✍️ Crear una Nueva Nota/Blog

### Paso 1: Acceder al Editor
1. Ve a la sección **"Blog"** en la barra lateral
2. Haz clic en el botón **"Crear Artículo"** (o navega a `/blog/crear`)

### Paso 2: Completar el Formulario

#### Campos Obligatorios:
- **Título**: El título de tu artículo (ej: "Análisis del Mercado de Valores 2025")
- **Slug**: Se genera automáticamente desde el título (ej: "analisis-del-mercado-de-valores-2025")
- **Contenido**: El cuerpo principal del artículo (soporta Markdown)
- **Resumen**: Una breve descripción del artículo

#### Campos Opcionales:
- **Categoría**: Selecciona una categoría (Finanzas, Inversiones, Análisis, Mercados, Tutorial)
- **Tags**: Agrega etiquetas separadas por Enter (ej: "acciones", "mercado", "análisis")
- **Imagen Destacada**: URL de una imagen para el artículo

### Paso 3: Vista Previa del Contenido
- Usa la pestaña **"Vista Previa"** del editor para ver cómo se verá tu contenido
- El editor soporta formato Markdown:
  - **Negrita**: `**texto**`
  - *Cursiva*: `*texto*`
  - Enlaces: `[texto](url)`
  - Listas: `- item` o `1. item`
  - Código: `` `código` ``

### Paso 4: Guardar o Publicar

Tienes dos opciones:

1. **Guardar Borrador** (botón con icono de disquete):
   - Estado: `draft`
   - Solo visible para ti
   - Puedes editarlo más tarde

2. **Publicar** (botón "Publicar Artículo"):
   - Estado: `pending_review`
   - Requiere aprobación de administrador
   - Una vez aprobado, será visible públicamente

## 📝 Ejemplo de Contenido de Prueba

```markdown
# Análisis del Mercado de Valores en 2025

El mercado financiero ha experimentado cambios significativos durante el primer trimestre del año.

## Principales Indicadores

- **S&P 500**: +5.2%
- **NASDAQ**: +7.8%
- **Dow Jones**: +3.1%

## Conclusión

Los datos sugieren una recuperación sostenida del mercado...
```

### Datos de Ejemplo:

**Título**: `Guía de Inversión para Principiantes`

**Resumen**: `Aprende los conceptos básicos de inversión y cómo comenzar tu portafolio con poco capital.`

**Categoría**: `Tutorial`

**Tags**: `inversiones`, `principiantes`, `finanzas personales`

**Imagen Destacada**: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200`

**Contenido**:
```markdown
# Introducción a las Inversiones

Invertir puede parecer complicado al principio, pero con los conceptos básicos claros, cualquiera puede comenzar.

## ¿Por qué invertir?

1. **Crecimiento del capital**: Tu dinero trabaja para ti
2. **Protección contra la inflación**: Mantén tu poder adquisitivo
3. **Generación de ingresos pasivos**: Dividendos y rentas

## Primeros Pasos

### 1. Define tus objetivos
¿Para qué estás invirtiendo? ¿Retiro, compra de casa, educación?

### 2. Evalúa tu tolerancia al riesgo
No todas las inversiones son para todos. Conoce tu perfil.

### 3. Diversifica
No pongas todos los huevos en una sola canasta.

## Conclusión

La inversión es un viaje a largo plazo. Comienza con poco, aprende constantemente y mantén la disciplina.
```

## 🧪 Probar Funcionalidades

### 1. **Visualización**
- Ve a `/blog` para ver la lista de artículos
- Haz clic en un artículo para ver su contenido completo

### 2. **Interacciones**
- **Like**: Dale like a un artículo (requiere login)
- **Bookmark**: Guarda un artículo para leer después
- **Compartir**: Usa el botón de compartir para copiar el link

### 3. **Comentarios**
- Agrega un comentario al final del artículo
- Responde a comentarios existentes (anidación de 1 nivel)

### 4. **Edición**
- Si eres el autor, verás el botón "Editar" en tus artículos
- Ve a `/blog/editar/[slug]` para modificar tu contenido

### 5. **Búsqueda y Filtros**
En `/blog`:
- Busca por título o contenido
- Filtra por categoría
- Ordena por: Más recientes, Más populares, Tendencias

## 🔍 Verificar en Supabase

Después de crear un blog, verifica en Supabase:

```sql
-- Ver tu blog creado
SELECT * FROM blogs WHERE user_id = 'tu-user-id';

-- Ver los likes de tu blog
SELECT * FROM blog_likes WHERE blog_id = 'tu-blog-id';

-- Ver los comentarios
SELECT * FROM blog_comments WHERE blog_id = 'tu-blog-id';
```

## 🐛 Solución de Problemas

### No puedo crear artículos
- ✅ Verifica que `can_upload_blog = true` en tu perfil
- ✅ Asegúrate de estar autenticado

### El slug no se genera
- ✅ Escribe el título primero
- ✅ El slug se genera automáticamente al escribir

### Error 406 en likes/bookmarks
- ✅ Ya está corregido con `.maybeSingle()`
- ✅ Verifica las RLS policies en Supabase

### Los comentarios no aparecen
- ✅ Verifica la relación `blog_comments_user_id_fkey` en la DB
- ✅ Revisa las policies de `SELECT` en `blog_comments`

## 📊 Estados del Blog

| Estado | Descripción | Visible Para |
|--------|-------------|--------------|
| `draft` | Borrador | Solo el autor |
| `pending_review` | En revisión | Autor + Admins |
| `approved` | Aprobado | Todos los usuarios |
| `rejected` | Rechazado | Solo el autor |

## 🎯 Checklist de Prueba Completa

- [ ] Crear un blog con todos los campos
- [ ] Crear un blog solo con campos obligatorios
- [ ] Guardar como borrador
- [ ] Publicar un blog
- [ ] Editar un blog existente
- [ ] Ver lista de blogs
- [ ] Ver detalle de un blog
- [ ] Dar like a un blog
- [ ] Guardar bookmark
- [ ] Agregar comentario
- [ ] Responder a un comentario
- [ ] Compartir un blog
- [ ] Buscar blogs
- [ ] Filtrar por categoría
- [ ] Ordenar blogs

---

**Nota**: Este sistema está diseñado para un flujo de aprobación. Los blogs requieren revisión de un administrador antes de ser públicos.
