// src/pages/BlogPostPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import NotFoundPage from './NotFoundPage';
import DOMPurify from 'dompurify';
import { useAuth } from '../hooks/useAuth';

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
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      if (!slug) return;
      
      logger.info('BLOG_POST_FETCH_START', 'Iniciando obtención de artículo individual', {
        slug: slug
      });
      
      setLoading(true);
      setError(false);
      
      try {
        // Obtener el post principal
        const { data: mainPost, error: mainPostError } = await supabase
          .from('blogs')
          .select('*, author:profiles(first_name, last_name)')
          .eq('slug', slug)
          .eq('status', 'approved')
          .single();

        if (mainPostError || !mainPost) throw mainPostError || new Error("Post no encontrado");
        
        logger.info('BLOG_POST_FETCH_SUCCESS', 'Artículo principal obtenido exitosamente', {
          slug: slug,
          postId: mainPost.id,
          postTitle: mainPost.title,
          authorName: mainPost.author?.first_name ? `${mainPost.author.first_name} ${mainPost.author.last_name || ''}`.trim() : 'Anónimo',
          publishedAt: mainPost.published_at,
          contentLength: mainPost.content?.length || 0
        });
        
        setPost(mainPost);

        // Obtener posts relacionados (los 3 más recientes, excluyendo el actual)
        const { data: relatedData, error: relatedError } = await supabase
          .from('blogs')
          .select('title, slug, featured_image_url, published_at')
          .eq('status', 'approved')
          .not('id', 'eq', mainPost.id)
          .order('published_at', { ascending: false })
          .limit(3);

        if (relatedError) throw relatedError;
        
        logger.info('BLOG_RELATED_POSTS_FETCH_SUCCESS', 'Artículos relacionados obtenidos exitosamente', {
          slug: slug,
          relatedPostsCount: relatedData?.length || 0,
          relatedTitles: relatedData?.map(p => p.title) || []
        });
        
        setRelatedPosts(relatedData);

      } catch (err) {
        logger.error('BLOG_POST_FETCH_FAILED', 'Error al obtener artículo o relacionados', {
          slug: slug,
          error: err.message,
          errorType: err.name
        });
        console.error('Error fetching data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostAndRelated();
  }, [slug]);

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
            
            {/* Columna Principal: Contenido del Post */}
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
                
                <div className="mt-8 prose prose-invert prose-lg max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-blue-400"
                  dangerouslySetInnerHTML={{ __html: cleanHTML }}
                />
              </article>
            </div>

            {/* Columna Lateral: Notas Relevantes */}
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