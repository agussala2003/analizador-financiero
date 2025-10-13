// src/features/blog/pages/my-blogs-page.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Eye, Edit, Trash2, Plus, Search, Calendar, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

interface MyBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  published_at?: string;
  featured_image_url?: string;
  category?: string;
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
}

function MyBlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<MyBlog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<MyBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void loadMyBlogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let filtered = [...blogs];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(blog => blog.status === statusFilter);
    }

    setFilteredBlogs(filtered);
  }, [blogs, searchQuery, statusFilter]);

  const loadMyBlogs = async () => {
    try {
      setIsLoading(true);

      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (blogsError) throw blogsError;

      const blogsWithStats = await Promise.all(
        (blogsData ?? []).map(async (blog: Record<string, unknown>) => {
          const blogId = blog.id as string;
          const [likesData, commentsData] = await Promise.all([
            supabase.from('blog_likes').select('id', { count: 'exact' }).eq('blog_id', blogId),
            supabase.from('blog_comments').select('id', { count: 'exact' }).eq('blog_id', blogId)
          ]);

          return {
            ...blog,
            stats: {
              likes: likesData.count ?? 0,
              comments: commentsData.count ?? 0,
              views: (blog.views as number | undefined) ?? 0
            }
          } as MyBlog;
        })
      );

      setBlogs(blogsWithStats);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      setBlogs(prev => prev.filter(b => b.id !== blogId));
      setBlogToDelete(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error al eliminar el artículo. Por favor intenta nuevamente.');
    }
  };

  const getStatusBadge = (status: MyBlog['status']) => {
    const variants = {
      draft: { label: 'Borrador', variant: 'secondary' as const },
      pending_review: { label: 'En Revisión', variant: 'default' as const },
      approved: { label: 'Aprobado', variant: 'default' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const }
    };
    const config = variants[status];
    return <Badge variant={config.variant} className={status === 'approved' ? 'bg-green-600' : ''}>{config.label}</Badge>;
  };

  const statusCounts = {
    all: blogs.length,
    draft: blogs.filter(b => b.status === 'draft').length,
    pending_review: blogs.filter(b => b.status === 'pending_review').length,
    approved: blogs.filter(b => b.status === 'approved').length,
    rejected: blogs.filter(b => b.status === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Mis Artículos</h1>
          <p className="text-muted-foreground">
            Gestiona y monitorea tus publicaciones
          </p>
        </div>
        <Link to="/blog/crear">
          <Button size="lg" className="btn-press">
            <Plus className="w-5 h-5 mr-2" />
            Crear Artículo
          </Button>
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos ({statusCounts.all})</SelectItem>
            <SelectItem value="draft">Borradores ({statusCounts.draft})</SelectItem>
            <SelectItem value="pending_review">En Revisión ({statusCounts.pending_review})</SelectItem>
            <SelectItem value="approved">Aprobados ({statusCounts.approved})</SelectItem>
            <SelectItem value="rejected">Rechazados ({statusCounts.rejected})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs con resumen */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="draft">Borradores ({statusCounts.draft})</TabsTrigger>
          <TabsTrigger value="pending">En Revisión ({statusCounts.pending_review})</TabsTrigger>
          <TabsTrigger value="published">Publicados ({statusCounts.approved})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid de artículos */}
      {filteredBlogs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">No hay artículos</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'No se encontraron artículos con los filtros aplicados.'
                : 'Comienza creando tu primer artículo.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/blog/crear">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Artículo
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              {/* Imagen destacada */}
              {blog.featured_image_url && (
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={blog.featured_image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {getStatusBadge(blog.status)}
                  {blog.category && (
                    <Badge variant="outline">{blog.category}</Badge>
                  )}
                </div>
                <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary">
                  {blog.title}
                </h3>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {blog.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{blog.stats.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{blog.stats.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{blog.stats.views}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-4">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true, locale: es })}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Link to={`/blog/${blog.slug}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                </Link>
                <Link to={`/blog/editar/${blog.slug}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBlogToDelete(blog.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!blogToDelete} onOpenChange={() => setBlogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El artículo será eliminado permanentemente
              junto con todos sus comentarios, likes y bookmarks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blogToDelete && void handleDelete(blogToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyBlogsPage;
