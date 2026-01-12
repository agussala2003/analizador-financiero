// src/features/news/components/card/news-card.tsx
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { ExternalLink, Calendar, User } from "lucide-react";
import type { UnifiedNewsItem } from "../../../../types/news";

interface NewsCardProps {
  news: UnifiedNewsItem;
  index: number;
}

export const NewsCard = ({ news, index }: NewsCardProps) => {
  const handleClick = () => {
    window.open(news.url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const formattedDate = new Date(news.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card
        className="flex flex-col h-full overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] hover:border-primary/50 group"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
      >
        {news.image && (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=News';
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="shadow-sm backdrop-blur-md bg-background/80">
                {news.symbol ?? news.source}
              </Badge>
            </div>
          </div>
        )}

        <CardHeader className={`${news.image ? 'pt-4' : 'pt-6'} px-6 pb-2`}>
          {!news.image && news.symbol && (
            <div className="mb-2">
              <Badge variant="outline">{news.symbol}</Badge>
            </div>
          )}
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow px-6 py-2">
          {news.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: news.summary.replace(/<[^>]*>?/gm, '') }} />
          )}

          {/* Legacy support for ratings if mapped */}
          {news.grade && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="font-semibold">Rating:</span>
              <Badge variant={news.grade.includes('Buy') ? 'default' : 'secondary'}>{news.grade}</Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 border-t flex justify-between items-center text-xs text-muted-foreground bg-muted/5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {news.source}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
          <ExternalLink className="w-3 h-3 group-hover:text-primary" />
        </CardFooter>
      </Card>
    </motion.div>
  );
};
