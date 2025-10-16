// src/features/news/components/card/news-card.tsx

import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { ExternalLink } from "lucide-react";
import { NewsCardProps } from "../../types/news.types";
import { formatNewsDate, getCompanyName } from "../../lib/news.utils";

/**
 * Tarjeta de noticia individual con animación de entrada
 * Toda la card es clickeable para mejor UX
 */
export const NewsCard = ({ news, index }: NewsCardProps) => {
  const company = getCompanyName(news);
  const formattedDate = formatNewsDate(news.publishedDate);

  const handleClick = () => {
    window.open(news.newsURL, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card 
        className="flex flex-col h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 active:scale-[0.98] group"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="link"
      >
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <CardTitle className="text-base sm:text-lg leading-tight group-hover:text-primary transition-colors flex-1">
              {news.newsTitle}
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Badge variant="secondary" className="whitespace-nowrap text-xs">
                {news.symbol}
              </Badge>
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 sm:space-y-3 text-xs sm:text-sm p-4 sm:p-6">
          {news.newGrade && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px]">Calificación:</span>
              <span className="font-medium">{news.newGrade}</span>
            </div>
          )}
          {news.priceTarget && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px]">Precio Obj.:</span>
              <span className="font-medium text-green-600 dark:text-green-500">
                ${news.priceTarget.toLocaleString()}
              </span>
            </div>
          )}
          {news.analystName && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground min-w-[100px] sm:min-w-[120px]">Analista:</span>
              <span className="font-medium truncate">{news.analystName}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t p-4 sm:p-6">
          <span className="flex items-center gap-1">
            📰 {company}
          </span>
          <span className="flex items-center gap-1">
            📅 {formattedDate}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
