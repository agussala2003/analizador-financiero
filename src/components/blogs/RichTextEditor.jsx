// src/components/editor/RichTextEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase'; // Asegúrate que la ruta sea correcta
import { useAuth } from '../../hooks/useAuth';

import './editor-styles.css';

// --- Componente de la Barra de Herramientas Mejorada ---
const MenuBar = ({ editor }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const addImage = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    try {
      // 1. Subir la imagen a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `inline-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images') // Usamos el mismo bucket que para la imagen destacada
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // 3. Insertar la imagen en el editor
      if (urlData.publicUrl) {
        editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      // Aquí podrías usar tu `showError` del contexto de errores
      alert("No se pudo subir la imagen.");
    }
  };

  if (!editor) return null;

  return (
    <div className="editor-menu">
      {/* --- Estilos de Texto --- */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} title="Negrita">B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''} title="Cursiva">I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''} title="Tachado">S</button>
      
      <div className="divider"></div>

      {/* --- Títulos --- */}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>H3</button>

      <div className="divider"></div>

      {/* --- Listas --- */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''} title="Lista Viñetas">●</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''} title="Lista Numerada">1.</button>
      
      <div className="divider"></div>

      {/* --- Imagen --- */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <button type="button" onClick={addImage} title="Insertar Imagen">🏞️</button>
    </div>
  );
};


// --- Componente Principal del Editor ---
export default function RichTextEditor({ content, onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image, // 👈 Añadir la extensión de Imagen
      Link.configure({ // 👈 Configurar la extensión de Enlace
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-4 focus:outline-none',
      },
    },
  });

  return (
    <div className="editor-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}