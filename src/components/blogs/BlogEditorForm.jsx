// src/components/blogs/BlogEditorForm.jsx
import RichTextEditor from './RichTextEditor';
import Loader from '../ui/Loader';

// --- Componente para el campo de subida de imagen ---
function ImageUploader({ imagePreview, onImageChange, currentImageUrl }) {
  return (
    <div className="bg-gray-700/50 p-4 rounded-lg border-2 border-dashed border-gray-600 text-center">
      {imagePreview || currentImageUrl ? (
        <div className="relative group">
          <img 
            src={imagePreview || currentImageUrl} 
            alt="Previsualización" 
            className="w-full h-48 object-cover rounded-lg" 
          />
          <label htmlFor="image" className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-semibold">
            Cambiar Imagen
          </label>
        </div>
      ) : (
        <label htmlFor="image" className="cursor-pointer">
          <p className="text-gray-400">Arrastra o haz clic para subir una imagen destacada</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
        </label>
      )}
      <input 
        type="file" 
        id="image" 
        onChange={onImageChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
    </div>
  );
}


// --- Componente principal del formulario ---
export default function BlogEditorForm(props) {
  const {
    title, setTitle,
    slug, setSlug,
    content, setContent,
    imagePreview, onImageChange,
    currentImageUrl, // Para la página de edición
    handleSubmit, loading,
    isEditing,
  } = props;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Título, Slug e Imagen */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Título del Post</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">URL (slug)</label>
            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Imagen Destacada</label>
            <ImageUploader 
              imagePreview={imagePreview} 
              onImageChange={onImageChange} 
              currentImageUrl={currentImageUrl}
            />
          </div>
        </div>

        {/* Columna Derecha: Editor de Contenido */}
        <div className="lg:col-span-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">Contenido Principal</label>
          <RichTextEditor
            content={content}
            onUpdate={setContent}
          />
        </div>
      </div>

      {/* Botón de envío */}
      <div className="pt-6 border-t border-gray-700">
        <button type="submit" disabled={loading} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:bg-gray-500 transition-colors">
          {loading ? <Loader variant="spin" size="sm" color="white" message="Guardando..." /> : (isEditing ? 'Actualizar y Enviar a Revisión' : 'Enviar a Revisión')}
        </button>
      </div>
    </form>
  );
}