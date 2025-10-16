// src/features/admin/components/suggestions/admin-suggestions-section.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { supabase } from '../../../../lib/supabase';
import { CheckCircle, XCircle, Clock, ThumbsUp, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Suggestion {
  id: string;
  content: string;
  status: 'nueva' | 'en revisión' | 'planeada' | 'completada' | 'rechazada';
  upvotes: number;
  created_at: string;
  user_id: string | null;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const ITEMS_PER_PAGE = 10;

export function AdminSuggestionsSection() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    void loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentPage]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [filter]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      
      // First, get total count
      let countQuery = supabase
        .from('suggestions')
        .select('id', { count: 'exact', head: true });

      if (filter !== 'all') {
        countQuery = countQuery.eq('status', filter);
      }

      const { count } = await countQuery;
      setTotalCount(count ?? 0);

      // Then get paginated data
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('suggestions')
        .select('id, content, status, upvotes, created_at, user_id')
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set((data ?? [])
        .map((s: { user_id: string | null }) => s.user_id)
        .filter((id): id is string => id !== null))];

      // Fetch all users at once (only if there are user IDs)
      let usersMap = new Map<string, { id: string; first_name: string; last_name: string; email: string }>();
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        if (usersError) {
          console.warn('Error loading user profiles:', usersError);
        } else {
          // Create a map for quick lookup
          usersMap = new Map(
            (usersData ?? []).map((user: { id: string; first_name: string; last_name: string; email: string }) => [user.id, user])
          );
        }
      }

      // Combine suggestions with user data
      const suggestionsWithUsers = (data ?? []).map((suggestion: { user_id: string | null; [key: string]: unknown }) => ({
        ...suggestion,
        user: suggestion.user_id ? usersMap.get(suggestion.user_id) : undefined
      }));

      setSuggestions(suggestionsWithUsers as Suggestion[]);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Suggestion['status']) => {
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      await loadSuggestions();
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const deleteSuggestion = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sugerencia?')) return;

    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      alert('Error al eliminar la sugerencia');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      'nueva': { 
        variant: 'outline', 
        icon: <Clock className="w-3 h-3" />,
        label: 'Nueva'
      },
      'en revisión': { 
        variant: 'secondary', 
        icon: <Clock className="w-3 h-3" />,
        label: 'En Revisión'
      },
      'planeada': { 
        variant: 'default', 
        icon: <Calendar className="w-3 h-3" />,
        label: 'Planeada'
      },
      'completada': { 
        variant: 'default', 
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Completada'
      },
      'rechazada': { 
        variant: 'destructive', 
        icon: <XCircle className="w-3 h-3" />,
        label: 'Rechazada'
      }
    };

    const config = variants[status] || variants.nueva;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 sm:p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
            <span className="ml-2 sm:ml-3 text-sm sm:text-base text-muted-foreground">Cargando sugerencias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Filtrar por estado:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="nueva">Nuevas</SelectItem>
                <SelectItem value="en revisión">En Revisión</SelectItem>
                <SelectItem value="planeada">Planeadas</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
                <SelectItem value="rechazada">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
            <div className="sm:ml-auto text-xs sm:text-sm text-muted-foreground">
              Total: {suggestions.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de sugerencias */}
      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-muted-foreground">No hay sugerencias con este filtro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2">
                      {suggestion.content}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{suggestion.upvotes} votos</span>
                      </div>
                      {suggestion.user && (
                        <span>
                          Por: {suggestion.user.first_name} {suggestion.user.last_name}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(suggestion.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(suggestion.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Select 
                    value={suggestion.status} 
                    onValueChange={(value) => void updateStatus(suggestion.id, value as Suggestion['status'])}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nueva">Nueva</SelectItem>
                      <SelectItem value="en revisión">En Revisión</SelectItem>
                      <SelectItem value="planeada">Planeada</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void deleteSuggestion(suggestion.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && suggestions.length > 0 && totalCount > ITEMS_PER_PAGE && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.ceil(totalCount / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                  .filter(page => {
                    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
                    // Show first, last, current, and adjacent pages
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, idx, arr) => {
                    // Add ellipsis if there's a gap
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis && <span className="text-muted-foreground">...</span>}
                        <Button
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
