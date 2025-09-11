// src/pages/BlogsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { useAuth } from '../hooks/useAuth';

// --- Componente de Tarjeta de Blog (sin cambios, pero incluido para que sea autocontenido) ---
function BlogCard({ blog }) {
  const authorName = blog.author?.first_name ? `${blog.author.first_name} ${blog.author.last_name || ''}`.trim() : 'Anónimo';
  return (
    <Link 
      to={`/blogs/${blog.slug}`} 
      onClick={() => {
        logger.info('BLOG_CARD_CLICKED', 'Usuario accediendo a artículo del blog', {
          blogId: blog.id,
          blogTitle: blog.title,
          blogSlug: blog.slug,
          authorName: authorName,
          publishedAt: blog.published_at
        });
      }}
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
export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // 6 blogs por página (2 filas de 3)
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { profile } = useAuth();
  const navigate = useNavigate();

  const fetchBlogs = useCallback(async (currentPage, currentSearch) => {
    logger.info('BLOGS_FETCH_START', 'Iniciando obtención de blogs aprobados', {
      page: currentPage,
      pageSize: pageSize,
      searchTerm: currentSearch || '',
      hasSearch: !!currentSearch
    });
    
    setLoading(true);
    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('blogs')
        .select('*, author:profiles(first_name, last_name)', { count: 'exact' })
        .eq('status', 'approved')
        .order('published_at', { ascending: false });

      if (currentSearch) {
        // Usamos textSearch para buscar en título y contenido. Requiere configuración en Supabase.
        // Alternativa: .or(`title.ilike.%${currentSearch}%,content.ilike.%${currentSearch}%`)
        query = query.textSearch('title', `'${currentSearch}'`); 
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      
      logger.info('BLOGS_FETCH_SUCCESS', 'Blogs obtenidos exitosamente', {
        page: currentPage,
        pageSize: pageSize,
        searchTerm: currentSearch || '',
        blogsCount: data?.length || 0,
        totalBlogs: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      });
      
      setBlogs(data || []);
      setTotal(count || 0);

    } catch (error) {
      logger.error('BLOGS_FETCH_FAILED', 'Error al obtener blogs', {
        page: currentPage,
        pageSize: pageSize,
        searchTerm: currentSearch || '',
        error: error.message,
        code: error.code
      });
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchBlogs(page, searchTerm);
  }, [page, searchTerm, fetchBlogs]);

  // Vuelve a la página 1 cuando se realiza una nueva búsqueda
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          {/* Encabezado y Barra de Búsqueda */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Nuestro Blog</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">Noticias, análisis y consejos del mundo financiero.</p>
            <div className="mt-8 max-w-lg mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const newSearchTerm = e.target.value;
                  setSearchTerm(newSearchTerm);
                  if (newSearchTerm !== searchTerm) {
                    logger.info('BLOGS_SEARCH_CHANGED', 'Usuario modificó término de búsqueda', {
                      previousSearch: searchTerm,
                      newSearch: newSearchTerm,
                      searchLength: newSearchTerm.length
                    });
                  }
                }}
                placeholder="Buscar artículos por palabra clave..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 px-6 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white">No se encontraron resultados</h2>
              <p className="text-gray-400 mt-2">Prueba con otra palabra clave o explora todos nuestros artículos.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button 
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      if (newPage !== page) {
                        logger.info('BLOGS_PAGINATION_PREVIOUS', 'Usuario navegó a página anterior', {
                          fromPage: page,
                          toPage: newPage,
                          totalPages: totalPages,
                          searchTerm: searchTerm
                        });
                      }
                      setPage(newPage);
                    }} 
                    disabled={page === 1} 
                    className="cursor-pointer px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50"
                  >
                    &larr;
                  </button>
                  <span className="text-gray-400">Página {page} de {totalPages}</span>
                  <button 
                    onClick={() => {
                      const newPage = Math.min(totalPages, page + 1);
                      if (newPage !== page) {
                        logger.info('BLOGS_PAGINATION_NEXT', 'Usuario navegó a página siguiente', {
                          fromPage: page,
                          toPage: newPage,
                          totalPages: totalPages,
                          searchTerm: searchTerm
                        });
                      }
                      setPage(newPage);
                    }} 
                    disabled={page === totalPages} 
                    className="cursor-pointer px-4 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          )}

          {profile?.can_upload_blog && (
             <div className="text-center mt-16">
                 <button
                    onClick={() => {
                      logger.info('BLOGS_CREATE_NAVIGATION', 'Usuario navegando a crear nuevo blog desde página principal', {
                        userId: profile?.id,
                        userCanUpload: profile?.can_upload_blog,
                        currentPage: page,
                        searchTerm: searchTerm
                      });
                      navigate('/blogs/create');
                    }}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Crear Nuevo Blog
                  </button>
             </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}