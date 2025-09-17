// src/pages/BlogsPostPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import NotFoundPage from './NotFoundPage';
import DOMPurify from 'dompurify';
import { useAuth } from '../hooks/useAuth';
import { useError } from '../hooks/useError';
import BlogInteractions from '../components/blogs/BlogsInteractions';
import BlogComments from '../components/blogs/BlogComments';

// --- Componente para una tarjeta en la barra lateral ---
function RelatedPostCard({ post }) {
  return (
    <Link 
      to={`/blogs/${post.slug}`} 
      onClick={() => {
        logger.info('BLOG_RELATED_POST_CLICKED', 'Usuario accediendo a artículo relacionado', {
          relatedPostTitle: post.title,
          relatedPostSlug: post.slug,
          publishedAt: post.published_at
        });
      }}
      className="group flex items-center gap-4"
    >
      {post.featured_image_url ? (
        <img src={post.featured_image_url} alt={post.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0"></div>
      )}
      <div>
        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight">{post.title}</h4>
        <p className="text-xs text-gray-400 mt-1">{new Date(post.published_at).toLocaleDateString('es-ES')}</p>
      </div>
    </Link>
  );
}

// --- Componente de Esqueleto de Carga ---
function PostSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-700 rounded-xl mb-8"></div>
          <div className="h-10 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-12"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
        <div className="hidden lg:block space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-24 bg-gray-700 rounded-xl"></div>
            <div className="h-24 bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}


// --- Componente Principal de la Página del Post ---
export default function BlogPostPage() {
  const { user } = useAuth();
  const { slug } = useParams();
  const { showError, showSuccess } = useError();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const userHasLiked = useMemo(() => likes.some(like => like.user_id === user?.id), [likes, user]);
  const userHasBookmarked = useMemo(() => bookmarks.some(b => b.user_id === user?.id), [bookmarks, user]);

  const fetchAllPostData = useCallback(async () => {
    if (!slug) return;
    
    logger.info('BLOG_POST_FETCH_START', 'Iniciando obtención de artículo e interacciones', { slug });
    setLoading(true);
    setError(false);
    
    try {
      // ✅ CAMBIO: El contenido principal del blog es visible para todos.
      const { data: mainPost, error: mainPostError } = await supabase
        .from('blogs').select('*, author:profiles(first_name, last_name)').eq('slug', slug).eq('status', 'approved').single();
      
      if (mainPostError || !mainPost) throw mainPostError || new Error("Post no encontrado");
      setPost(mainPost);

      // ✅ CAMBIO: Las interacciones públicas también se cargan para todos.
      const [likesRes, commentsRes, relatedRes] = await Promise.all([
        supabase.from('blog_likes').select('user_id').eq('blog_id', mainPost.id),
        supabase.from('blog_comments').select('*, author:profiles(first_name, last_name)').eq('blog_id', mainPost.id).order('created_at', { ascending: false }),
        supabase.from('blogs').select('title, slug, featured_image_url, published_at').eq('status', 'approved').not('id', 'eq', mainPost.id).order('published_at', { ascending: false }).limit(3)
      ]);

      // ✅ CAMBIO: Si el usuario está logueado, verificamos si ha guardado el post en favoritos.
      if (user) {
        const { data: bookmarksData, error: bookmarksError } = await supabase.from('blog_bookmarks').select('user_id').eq('blog_id', mainPost.id).eq('user_id', user.id);
        if (bookmarksError) throw bookmarksError;
        setBookmarks(bookmarksData || []);
      }

      if (likesRes.error) throw likesRes.error;
      if (commentsRes.error) throw commentsRes.error;
      if (relatedRes.error) throw relatedRes.error;

      setLikes(likesRes.data || []);
      setComments(commentsRes.data || []);
      setRelatedPosts(relatedRes.data || []);
      
      logger.info('BLOG_POST_FETCH_SUCCESS', 'Artículo e interacciones obtenidos', { slug, postId: mainPost.id });

    } catch (err) {
      logger.error('BLOG_POST_FETCH_FAILED', 'Error al obtener datos del post', { slug, error: err.message });
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, user]); // ✅ CAMBIO: `user` se incluye como dependencia para recargar los bookmarks si el usuario inicia/cierra sesión.

  useEffect(() => {
    fetchAllPostData();
  }, [fetchAllPostData]);

  // --- HANDLERS PARA INTERACCIONES (sin cambios de lógica, pero la UI los llamará condicionalmente) ---
  const handleLike = async () => {
    if (!user) return showError("Debes iniciar sesión para dar me gusta.");
    
    if (userHasLiked) {
      const { error } = await supabase.from('blog_likes').delete().match({ user_id: user.id, blog_id: post.id });
      if (error) return showError("No se pudo quitar el 'Me gusta'.");
      setLikes(likes.filter(l => l.user_id !== user.id));
    } else {
      const { data, error } = await supabase.from('blog_likes').insert({ user_id: user.id, blog_id: post.id }).select('user_id');
      if (error) return showError("No se pudo dar 'Me gusta'.");
      setLikes([...likes, ...data]);
    }
  };
  
  const handleBookmark = async () => {
    if (!user) return showError("Debes iniciar sesión para guardar.");

    if (userHasBookmarked) {
      const { error } = await supabase.from('blog_bookmarks').delete().match({ user_id: user.id, blog_id: post.id });
      if (error) return showError("No se pudo quitar de favoritos.");
      setBookmarks([]);
      showSuccess("Eliminado de tus favoritos.");
    } else {
      const { error } = await supabase.from('blog_bookmarks').insert({ user_id: user.id, blog_id: post.id });
      if (error) return showError("No se pudo guardar en favoritos.");
      setBookmarks([{ user_id: user.id }]);
      showSuccess("Guardado en tus favoritos.");
    }
  };

  const handleAddComment = async (content) => {
    if (!user) return showError("Debes iniciar sesión para comentar.");
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({ content, blog_id: post.id, user_id: user.id })
      .select('*, author:profiles(first_name, last_name)')
      .single();

    if (error) return showError("No se pudo publicar el comentario.");
    setComments([data, ...comments]);
    showSuccess("Comentario publicado.");
  };

  const cleanHTML = useMemo(() => {
    return post?.content ? DOMPurify.sanitize(post.content, { ADD_ATTR: ['target'] }) : '';
  }, [post]);

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-900">
          {user ? <Header /> : <></>}
          <main className="flex-grow"><PostSkeleton /></main>
          <Footer />
        </div>
    );
  }
  
  if (error || !post) {
    return <NotFoundPage />;
  }

  const authorName = post.author?.first_name ? `${post.author.first_name} ${post.author.last_name || ''}`.trim() : 'Anónimo';

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {user ? <Header /> : <></>}
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="lg:col-span-2">
              <article>
                <Link 
                  to="/blogs" 
                  onClick={() => {
                    logger.info('BLOG_POST_BACK_NAVIGATION', 'Usuario regresando a lista de blogs', {
                      fromPostSlug: slug,
                      fromPostTitle: post?.title
                    });
                  }}
                  className="text-sm text-blue-400 hover:underline mb-6 inline-block"
                >
                  &larr; Volver a todos los blogs
                </Link>
                {post.featured_image_url && (
                  <img src={post.featured_image_url} alt={post.title} className="w-full rounded-xl mb-8" />
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{post.title}</h1>
                <div className="mt-4 text-gray-400">
                  <span>Por <strong>{authorName}</strong> el </span>
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                </div>
                
                <div className="my-8 py-4 border-y border-gray-700">
                  <BlogInteractions 
                    likesCount={likes.length}
                    commentsCount={comments.length}
                    userHasLiked={userHasLiked}
                    userHasBookmarked={userHasBookmarked}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                  />
                </div>
                
                <div className="mt-8 prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-blue-400"
                  dangerouslySetInnerHTML={{ __html: cleanHTML }}
                />

                <BlogComments comments={comments} onAddComment={handleAddComment} />
              </article>
            </div>

            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-xl font-bold text-white mb-6">Otras notas relevantes</h3>
                {relatedPosts.length > 0 ? (
                  <div className="space-y-6">
                    {relatedPosts.map(related => <RelatedPostCard key={related.slug} post={related} />)}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay más notas disponibles.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}