// src/features/blog/pages/blog-post-page.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { BlogInteractions } from '../components/blog-interactions';
import { BlogComments } from '../components/blog-comments';
import { Calendar, ArrowLeft, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/use-auth';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  created_at: string;
  category?: string;
  tags?: string[];
  user_id: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  author: {
    first_name: string;
    last_name: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_comment_id?: string | null;
  author: {
    first_name: string;
    last_name: string;
  };
}

function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [userHasBookmarked, setUserHasBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      void loadBlogPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      setIsLoading(true);

      const blogResult = await supabase
        .from('blogs')
        .select(`
          *,
          author:profiles!fk_author(first_name, last_name)
        `)
        .eq('slug', slug)
        .single();

      if (blogResult.error) throw blogResult.error;
      if (!blogResult.data) {
        return;
      }

      const typedBlog = blogResult.data as unknown as BlogPost;
      
      // Verificar permisos de acceso si el blog no está aprobado
      if (typedBlog.status !== 'approved') {
        // Permitir acceso solo al autor o administrador
        if (!user) {
          alert('Este artículo no está disponible.');
          window.location.href = '/blog';
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isAuthor = user.id === typedBlog.user_id;
        const isAdmin = profile?.role === 'administrador';

        if (!isAuthor && !isAdmin) {
          alert('Este artículo no está disponible.');
          window.location.href = '/blog';
          return;
        }
      }
      
      setBlog(typedBlog);

      // Cargar likes
      const { count: likesCount } = await supabase
        .from('blog_likes')
        .select('id', { count: 'exact' })
        .eq('blog_id', typedBlog.id);

      setLikesCount(likesCount ?? 0);

      // Verificar si el usuario dio like
      if (user) {
        const { data: likeData } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('blog_id', typedBlog.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserHasLiked(!!likeData);

        const { data: bookmarkData } = await supabase
          .from('blog_bookmarks')
          .select('id')
          .eq('blog_id', typedBlog.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserHasBookmarked(!!bookmarkData);
      }

      // Cargar comentarios
      const { data: commentsData } = await supabase
        .from('blog_comments')
        .select(`
          *,
          author:profiles!blog_comments_user_id_fkey(first_name, last_name)
        `)
        .eq('blog_id', typedBlog.id)
        .order('created_at', { ascending: true });

      setComments((commentsData as unknown as Comment[]) ?? []);
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => {
    if (!user || !blog) return;

    void (async () => {
      try {
        if (userHasLiked) {
          await supabase
            .from('blog_likes')
            .delete()
            .eq('blog_id', blog.id)
            .eq('user_id', user.id);
          setLikesCount(prev => prev - 1);
          setUserHasLiked(false);
        } else {
          await supabase
            .from('blog_likes')
            .insert({ blog_id: blog.id, user_id: user.id });
          setLikesCount(prev => prev + 1);
          setUserHasLiked(true);
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    })();
  };

  const handleBookmark = () => {
    if (!user || !blog) return;

    void (async () => {
      try {
        if (userHasBookmarked) {
          await supabase
            .from('blog_bookmarks')
            .delete()
            .eq('blog_id', blog.id)
            .eq('user_id', user.id);
          setUserHasBookmarked(false);
        } else {
          await supabase
            .from('blog_bookmarks')
            .insert({ blog_id: blog.id, user_id: user.id });
          setUserHasBookmarked(true);
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
    })();
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!user || !blog) return;

    try {
      const commentResult = await supabase
        .from('blog_comments')
        .insert({
          blog_id: blog.id,
          user_id: user.id,
          content,
          parent_comment_id: parentId ?? null
        })
        .select(`
          *,
          author:profiles!blog_comments_user_id_fkey(first_name, last_name)
        `)
        .single();

      if (commentResult.error) throw commentResult.error;
      if (commentResult.data) {
        setComments(prev => [...prev, commentResult.data as unknown as Comment]);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({
        title: blog?.title,
        url
      });
    } else {
      void navigator.clipboard.writeText(url);
    }
  };

  if (isLoading) {
    return (
      <div className="container-narrow stack-6">
        <div className="animate-pulse stack-6">
          <div className="h-96 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="stack-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) return null;

  const authorName = `${blog.author.first_name} ${blog.author.last_name}`.trim();
  const initials = `${blog.author.first_name[0]}${blog.author.last_name?.[0] || ''}`.toUpperCase();
  const isAuthor = user?.id === blog.user_id;

  return (
    <div className="container-narrow stack-6">
      {/* Botón volver */}
      <Link to="/blog" className="inline-block">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Blog
        </Button>
      </Link>

      {/* Imagen destacada */}
      {blog.featured_image_url && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={blog.featured_image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Título y metadatos */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.category && (
            <Badge className="bg-primary">{blog.category}</Badge>
          )}
          {(blog.tags ?? []).map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.title}</h1>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{authorName}</p>
              <div className="flex items-center gap-1 body-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true, locale: es })}
              </div>
            </div>
          </div>

          {isAuthor && (
            <Link to={`/blog/editar/${blog.slug}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
      />

      {/* Interacciones */}
      <div className="border-y py-6 mb-8">
        <BlogInteractions
          likesCount={likesCount}
          commentsCount={comments.length}
          userHasLiked={userHasLiked}
          userHasBookmarked={userHasBookmarked}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />
      </div>

      {/* Comentarios */}
      <BlogComments
        comments={comments}
        onAddComment={handleAddComment}
        currentUserId={user?.id}
      />
    </div>
  );
}

export default BlogPostPage;
