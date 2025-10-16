// src/features/blog/components/blog-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Calendar, Heart, MessageCircle, Bookmark, Eye, BookOpen, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
  category?: string;
  tags?: string[];
  stats: {
    likes: number;
    comments: number;
    bookmarks: number;
    views?: number;
  };
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

export function BlogCard({
  slug,
  title,
  excerpt,
  featured_image_url,
  created_at,
  author,
  category,
  tags = [],
  stats,
  status
}: BlogCardProps) {
  const navigate = useNavigate();
  const authorName = `${author.first_name} ${author.last_name}`.trim();
  const initials = `${author.first_name[0]}${author.last_name?.[0] || ''}`.toUpperCase();
  
  const statusColors = {
    draft: 'bg-gray-500',
    pending_review: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500'
  };
  
  const statusLabels = {
    draft: 'Borrador',
    pending_review: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado'
  };

  const handleClick = () => {
    void navigate(`/blog/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card 
      className="overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 active:scale-[0.98] group"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
    >
      {/* Imagen destacada */}
      <div className="relative block">
        <div className="relative w-full h-40 sm:h-48 bg-muted overflow-hidden">
          {featured_image_url ? (
            <img
              src={featured_image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
          )}
        </div>
        
        {/* Estado del blog (solo si no es approved) */}
        {status && status !== 'approved' && (
          <Badge className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-xs ${statusColors[status]} text-white`}>
            {statusLabels[status]}
          </Badge>
        )}
        
        {/* Categoría */}
        {category && (
          <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs bg-primary text-primary-foreground">
            {category}
          </Badge>
        )}
      </div>

      {/* Contenido */}
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {title}
          </h3>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5 sm:mt-1" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 sm:p-6 pt-2 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
          {excerpt}
        </p>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t p-4 sm:p-6 pt-3 sm:pt-4 flex flex-col gap-2 sm:gap-3">
        {/* Autor y fecha */}
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{authorName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: es })}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{stats.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{stats.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{stats.bookmarks}</span>
          </div>
          {stats.views !== undefined && (
            <div className="flex items-center gap-1 ml-auto">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{stats.views}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
