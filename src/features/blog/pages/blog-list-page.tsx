// src/features/blog/pages/blog-list-page.tsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { BlogCard } from '../components/blog-card';
import { Search, Filter, Plus, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/use-auth';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  created_at: string;
  category?: string;
  tags: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  author: {
    first_name: string;
    last_name: string;
  };
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
    views: number;
  };
}

function BlogListPage() {
  const { user, profile } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;
  
  const categories = ['Finanzas', 'Inversiones', 'Análisis', 'Mercados', 'Tutorial'];

  useEffect(() => {
    void loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select(`
          *,
          author:profiles!fk_author(first_name, last_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (blogsError) throw blogsError;

      const blogsWithStats = await Promise.all(
        (blogsData ?? []).map(async (blog: Record<string, unknown>) => {
          const blogId = blog.id as string;
          const [likesData, commentsData, bookmarksData] = await Promise.all([
            supabase.from('blog_likes').select('id', { count: 'exact' }).eq('blog_id', blogId),
            supabase.from('blog_comments').select('id', { count: 'exact' }).eq('blog_id', blogId),
            supabase.from('blog_bookmarks').select('id', { count: 'exact' }).eq('blog_id', blogId)
          ]);

          return {
            ...blog,
            author: blog.author as Blog['author'],
            stats: {
              likes: likesData.count ?? 0,
              comments: commentsData.count ?? 0,
              bookmarks: bookmarksData.count ?? 0,
              views: (blog.views as number | undefined) ?? 0
            }
          } as Blog;
        })
      );

      setBlogs(blogsWithStats);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBlogs = useCallback(() => {
    let filtered = [...blogs];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        blog =>
          blog.title.toLowerCase().includes(query) ||
          blog.excerpt.toLowerCase().includes(query) ||
          blog.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(blog => blog.category === categoryFilter);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.stats.likes - a.stats.likes);
        break;
      case 'trending':
        filtered.sort((a, b) => 
          (b.stats.likes + b.stats.comments * 2 + b.stats.bookmarks) -
          (a.stats.likes + a.stats.comments * 2 + a.stats.bookmarks)
        );
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    setFilteredBlogs(filtered);
    setCurrentPage(1); // Reset a primera página cuando cambian los filtros
  }, [blogs, searchQuery, categoryFilter, sortBy]);
  
  useEffect(() => {
    filterAndSortBlogs();
  }, [filterAndSortBlogs]);

  // Paginación
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-wide space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">Blog Financiero</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Artículos, análisis y noticias del mundo financiero
            </p>
          </div>
        </div>
        
        {/* Botón crear blog (solo si tiene permisos) */}
        {user && profile?.can_upload_blog && (
          <Link to="/blog/crear" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto btn-press text-xs sm:text-sm">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Crear Artículo
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm"
          />
        </div>

        {/* Categoría */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-sm">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-sm">Todas</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenar */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] text-sm">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="text-sm">Más Recientes</SelectItem>
            <SelectItem value="popular" className="text-sm">Más Populares</SelectItem>
            <SelectItem value="trending" className="text-sm">Tendencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de blogs */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 sm:h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No se encontraron artículos</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            {searchQuery || categoryFilter !== 'all'
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'Aún no hay artículos publicados'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentBlogs.map(blog => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6 sm:mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Mostrar solo páginas cercanas a la actual
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="min-w-[36px] sm:min-w-[40px] text-xs sm:text-sm"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 sm:px-2 text-xs sm:text-sm">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          )}

          {/* Contador de resultados */}
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredBlogs.length)} de {filteredBlogs.length} artículos
            {filteredBlogs.length !== blogs.length && ` (${blogs.length} total)`}
          </div>
        </>
      )}
    </div>
  );
}

export default BlogListPage;
