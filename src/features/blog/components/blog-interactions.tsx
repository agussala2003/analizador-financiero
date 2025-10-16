// src/features/blog/components/blog-interactions.tsx
import { Heart, Bookmark, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

interface BlogInteractionsProps {
  likesCount: number;
  commentsCount: number;
  userHasLiked: boolean;
  userHasBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare?: () => void;
  showLabels?: boolean;
}

export function BlogInteractions({
  likesCount,
  commentsCount,
  userHasLiked,
  userHasBookmarked,
  onLike,
  onBookmark,
  onShare,
  showLabels = false,
}: BlogInteractionsProps) {
  
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Compartir nativo del navegador
      if (navigator.share) {
        void navigator.share({
          title: document.title,
          url: window.location.href,
        }).catch(() => {
          // Si falla, copiar al portapapeles
          void navigator.clipboard.writeText(window.location.href);
        });
      } else {
        // Fallback: copiar al portapapeles
        void navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
      <TooltipProvider>
        {/* Like */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={cn(
                "flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm",
                userHasLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5",
                  userHasLiked && "fill-current"
                )} 
              />
              <span className="font-semibold">{likesCount}</span>
              {showLabels && <span className="hidden sm:inline">Me gusta</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {userHasLiked ? 'Quitar me gusta' : 'Me gusta'}
          </TooltipContent>
        </Tooltip>

        {/* Comments */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm cursor-default"
              onClick={(e) => e.preventDefault()}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold">{commentsCount}</span>
              {showLabels && <span className="hidden sm:inline">Comentarios</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
          </TooltipContent>
        </Tooltip>

        {/* Bookmark */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmark}
              className={cn(
                "flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm",
                userHasBookmarked && "text-yellow-500 hover:text-yellow-600"
              )}
            >
              <Bookmark 
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5",
                  userHasBookmarked && "fill-current"
                )} 
              />
              {showLabels && <span className="hidden sm:inline">Guardar</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {userHasBookmarked ? 'Quitar de guardados' : 'Guardar para más tarde'}
          </TooltipContent>
        </Tooltip>

        {/* Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-1.5 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {showLabels && <span className="hidden sm:inline">Compartir</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Compartir artículo
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
