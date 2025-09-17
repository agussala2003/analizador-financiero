// src/pages/MyBookmarksPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../lib/logger';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

// --- Reutilizamos la tarjeta de Blog ---
function BlogCard({ blog }) {
  const authorName = blog.author?.first_name ? `${blog.author.first_name} ${blog.author.last_name || ''}`.trim() : 'Anónimo';
  return (
    <Link 
      to={`/blogs/${blog.slug}`} 
      className="group bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col"
    >
      <div className="relative">
        {blog.featured_image_url ? (
          <img src={blog.featured_image_url} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500">Sin imagen</div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors flex-grow">{blog.title}</h2>
        <p className="text-sm text-gray-400 mt-4 pt-4 border-t border-gray-700">
          Por {authorName} · {new Date(blog.published_at).toLocaleDateString('es-ES')}
        </p>
      </div>
    </Link>
  );
}

// --- Componente de Esqueleto de Carga ---
function BlogCardSkeleton() {
    return (
        <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
            <div className="w-full h-48 bg-gray-700"></div>
            <div className="p-6">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    );
}

// --- Componente Principal ---
export default function MyBookmarksPage() {
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookmarkedBlogs = async () => {
      if (!user) return;
      
      logger.info('BOOKMARKS_FETCH_START', 'Iniciando obtención de blogs guardados por el usuario', { userId: user.id });
      setLoading(true);
      
      try {
        // Hacemos un JOIN para obtener los datos del blog directamente
        const { data, error } = await supabase
          .from('blog_bookmarks')
          .select('blogs(*, author:profiles(first_name, last_name))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // La consulta devuelve un array de objetos { blogs: {...} }, así que lo aplanamos
        const blogs = data.map(item => item.blogs);

        logger.info('BOOKMARKS_FETCH_SUCCESS', `Se encontraron ${blogs.length} blogs guardados.`, { userId: user.id });
        setBookmarkedBlogs(blogs);

      } catch (error) {
        logger.error('BOOKMARKS_FETCH_FAILED', 'Error al obtener blogs guardados', { userId: user.id, error: error.message });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarkedBlogs();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Mis Blogs Guardados</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Tu biblioteca personal de artículos para leer más tarde.</p>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : bookmarkedBlogs.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white">No tienes blogs guardados</h2>
              <p className="text-gray-400 mt-2">Explora nuestro <Link to="/blogs" className="text-blue-400 hover:underline">blog</Link> y guarda los artículos que te interesen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarkedBlogs.map(blog => blog && <BlogCard key={blog.id} blog={blog} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}