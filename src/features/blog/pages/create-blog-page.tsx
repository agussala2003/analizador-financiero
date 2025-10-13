// src/features/blog/pages/create-blog-page.tsx
import { useNavigate } from 'react-router-dom';
import { BlogEditorForm } from '../components/blog-editor-form';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/use-auth';
import { useEffect } from 'react';

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category?: string;
  tags: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  featured_image?: string;
}

function CreateBlogPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile?.can_upload_blog) {
      void navigate('/blog');
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (data: BlogFormData) => {
    if (!user) return;

    try {
      const result = await supabase
        .from('blogs')
        .insert({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags: data.tags,
          status: data.status,
          featured_image_url: data.featured_image,
          user_id: user.id
        })
        .select()
        .single();

      if (result.error) throw result.error;

      const typedBlogData = result.data as unknown as { slug: string };
      void navigate(`/blog/${typedBlogData.slug}`);
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Error al crear el artículo. Por favor intenta nuevamente.');
    }
  };

  const handleSaveDraft = async (data: BlogFormData) => {
    if (!user) return;

    try {
      await supabase
        .from('blogs')
        .insert({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags: data.tags,
          featured_image_url: data.featured_image,
          user_id: user.id,
          status: 'draft'
        });

      void navigate('/blog');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error al guardar el borrador. Por favor intenta nuevamente.');
    }
  };

  if (!user || !profile?.can_upload_blog) {
    return null;
  }

  return (
    <div className="container-narrow stack-8">
      <div>
        <h1 className="heading-1 mb-2">Crear Nuevo Artículo</h1>
        <p className="body text-muted-foreground">
          Comparte tus conocimientos y análisis con la comunidad
        </p>
      </div>

      <BlogEditorForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isEditing={false}
      />
    </div>
  );
}

export default CreateBlogPage;
