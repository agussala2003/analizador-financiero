// src/pages/CreateBlogPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useError } from '../hooks/useError';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import BlogEditorForm from '../components/blogs/BlogEditorForm'; // 👈 Importa el nuevo formulario
import { logger } from '../lib/logger';

const generateSlug = (title) => {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
};

export default function CreateBlogPage() {
  const { user, profile } = useAuth();
  const { showError, showSuccess } = useError();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!profile?.can_upload_blog) {
    return (
      <div className="text-center p-10"><h1 className="text-2xl text-red-400">Acceso Denegado</h1><p>No tienes permiso para crear publicaciones.</p></div>
    );
  }

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !slug) {
        showError("Por favor, completa todos los campos.");
        return;
    }
    setLoading(true);
    
    logger.info('BLOG_CREATE_START', 'User attempting to create new blog', { 
      title, 
      slug, 
      hasImage: !!imageFile, 
      contentLength: content.length 
    });
    
    let imageUrl = null;
    try {
      if (imageFile) {
        logger.info('BLOG_IMAGE_UPLOAD_START', 'Uploading blog featured image', { slug, fileName: imageFile.name });
        const filePath = `${user.id}/${slug}-${Date.now()}.${imageFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
        logger.info('BLOG_IMAGE_UPLOAD_SUCCESS', 'Blog image uploaded successfully', { 
          slug, 
          filePath, 
          imageUrl 
        });
      }

      const { error: insertError } = await supabase.from('blogs').insert({
        user_id: user.id, title, content, slug, status: 'pending_review', featured_image_url: imageUrl,
      });
      if (insertError) throw insertError;

      logger.info('BLOG_CREATE_SUCCESS', 'Blog successfully created and submitted for review', { 
        title, 
        slug, 
        hasImage: !!imageUrl,
        contentLength: content.length 
      });
      showSuccess('¡Blog enviado a revisión con éxito!');
      navigate('/blogs/my-posts');
    } catch (err) {
      logger.error('BLOG_CREATE_FAILED', 'Failed to create blog', { 
        title, 
        slug, 
        hasImage: !!imageFile, 
        errorMessage: err.message 
      });
      showError('No se pudo enviar el blog.', { detail: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Crear Nuevo Blog</h1>
            <BlogEditorForm
              title={title}
              setTitle={handleTitleChange}
              slug={slug}
              setSlug={setSlug}
              content={content}
              setContent={setContent}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              handleSubmit={handleSubmit}
              loading={loading}
              isEditing={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}