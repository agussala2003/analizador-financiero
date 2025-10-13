// src/features/blog/pages/blog-list-page.tsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { BlogCard } from '../components/blog-card';
import { Search, Filter, Plus } from 'lucide-react';
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
  }, [blogs, searchQuery, categoryFilter, sortBy]);
  
  useEffect(() => {
    filterAndSortBlogs();
  }, [filterAndSortBlogs]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Blog Financiero</h1>
          <p className="text-muted-foreground">
            Artículos, análisis y noticias del mundo financiero
          </p>
        </div>
        
        {/* Botón crear blog (solo si tiene permisos) */}
        {user && profile?.can_upload_blog && (
          <Link to="/blog/crear">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Crear Artículo
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categoría */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenar */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más Recientes</SelectItem>
            <SelectItem value="popular">Más Populares</SelectItem>
            <SelectItem value="trending">Tendencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de blogs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No se encontraron artículos</h3>
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== 'all'
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'Aún no hay artículos publicados'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>

          {/* Contador de resultados */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Mostrando {filteredBlogs.length} de {blogs.length} artículos
          </div>
        </>
      )}
    </div>
  );
}

export default BlogListPage;
