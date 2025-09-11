// src/pages/EditBlogPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useError } from '../hooks/useError';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import BlogEditorForm from '../components/blogs/BlogEditorForm'; // 👈 Importa el nuevo formulario
import { logger } from '../lib/logger';

export default function EditBlogPage() {
  const { slug: initialSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useError();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      logger.info('BLOG_EDIT_FETCH_START', 'User attempting to fetch blog for editing', { slug: initialSlug });
      
      const { data, error } = await supabase.from('blogs').select('*').eq('slug', initialSlug).single();
      if (error || !data) {
        logger.error('BLOG_EDIT_FETCH_FAILED', 'Failed to fetch blog for editing', { 
          slug: initialSlug, 
          errorMessage: error?.message 
        });
        showError("No se encontró la publicación para editar.");
        navigate('/blogs/my-posts');
      } else {
        logger.info('BLOG_EDIT_FETCH_SUCCESS', 'Blog successfully fetched for editing', { 
          slug: initialSlug,
          blogId: data.id,
          title: data.title 
        });
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setSlug(data.slug);
        setCurrentImageUrl(data.featured_image_url);
      }
      setLoading(false);
    };
    fetchPost();
  }, [initialSlug, navigate, showError]);
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setCurrentImageUrl(null); // Ocultar la imagen actual si se selecciona una nueva
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = post.featured_image_url;

    logger.info('BLOG_UPDATE_START', 'User attempting to update blog', { 
      blogId: post.id,
      originalSlug: post.slug,
      newSlug: slug,
      title,
      hasNewImage: !!imageFile,
      contentLength: content.length 
    });

    try {
      if (imageFile) {
        logger.info('BLOG_UPDATE_IMAGE_UPLOAD_START', 'Uploading new blog image during update', { 
          blogId: post.id,
          fileName: imageFile.name 
        });
        // Podrías añadir lógica para borrar la imagen antigua de Supabase Storage aquí
        const filePath = `${user.id}/${slug}-${Date.now()}.${imageFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('blog-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
        logger.info('BLOG_UPDATE_IMAGE_UPLOAD_SUCCESS', 'New blog image uploaded successfully', { 
          blogId: post.id,
          filePath,
          imageUrl 
        });
      }

      const { error } = await supabase
        .from('blogs')
        .update({ title, content, slug, status: 'pending_review', featured_image_url: imageUrl })
        .eq('id', post.id);

      if (error) throw error;
      
      logger.info('BLOG_UPDATE_SUCCESS', 'Blog successfully updated and resubmitted for review', { 
        blogId: post.id,
        title,
        newSlug: slug,
        hasNewImage: !!imageFile,
        contentLength: content.length 
      });
      showSuccess("Publicación actualizada y enviada a revisión.");
      navigate('/blogs/my-posts');
    } catch (err) {
      logger.error('BLOG_UPDATE_FAILED', 'Failed to update blog', { 
        blogId: post.id,
        title,
        slug,
        errorMessage: err.message 
      });
      showError("No se pudo actualizar la publicación.", { detail: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !post) {
    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow flex items-center justify-center text-white">
            Cargando editor...
          </main>
          <Footer />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Editando Publicación</h1>
            <BlogEditorForm
              title={title}
              setTitle={setTitle}
              slug={slug}
              setSlug={setSlug}
              content={content}
              setContent={setContent}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              currentImageUrl={currentImageUrl}
              handleSubmit={handleUpdate}
              loading={loading}
              isEditing={true}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}