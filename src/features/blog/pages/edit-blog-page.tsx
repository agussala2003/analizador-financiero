// src/features/blog/pages/edit-blog-page.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogEditorForm } from '../components/blog-editor-form';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/use-auth';

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

interface BlogData {
  id: string;
  user_id: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  featured_image_url?: string;
}

function EditBlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<BlogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug && user) {
      void loadBlog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user]);

  const loadBlog = async () => {
    try {
      const result = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (result.error) throw result.error;

      const typedData = result.data as unknown as BlogData;

      // Verificar que el usuario sea el autor
      if (typedData.user_id !== user?.id) {
        void navigate('/blog');
        return;
      }

      setInitialData(typedData);
    } catch (error) {
      console.error('Error loading blog:', error);
      void navigate('/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: BlogFormData) => {
    if (!user || !initialData) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .update({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags: data.tags,
          status: data.status,
          featured_image_url: data.featured_image
        })
        .eq('id', initialData.id);

      if (error) throw error;

      void navigate(`/blog/${data.slug}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Error al actualizar el artículo. Por favor intenta nuevamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Editar Artículo</h1>
        <p className="text-muted-foreground">
          Actualiza tu artículo y mejora su contenido
        </p>
      </div>

      <BlogEditorForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditing={true}
      />
    </div>
  );
}

export default EditBlogPage;
