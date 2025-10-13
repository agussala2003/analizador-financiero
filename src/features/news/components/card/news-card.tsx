// src/features/news/components/card/news-card.tsx

import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { NewsCardProps } from "../../types/news.types";
import { formatNewsDate, getCompanyName } from "../../lib/news.utils";

/**
 * Tarjeta de noticia individual con animación de entrada
 * Muestra título, símbolo, calificación, precio objetivo, analista y fechas
 */
export const NewsCard = ({ news, index }: NewsCardProps) => {
  const company = getCompanyName(news);
  const formattedDate = formatNewsDate(news.publishedDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full transition-shadow duration-300 shadow-sm hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg leading-tight">
              <a
                href={news.newsURL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {news.newsTitle}
              </a>
            </CardTitle>
            <Badge variant="secondary" className="whitespace-nowrap">
              {news.symbol}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm">
          {news.newGrade && (
            <p>
              <span className="font-semibold text-muted-foreground">Calificación:</span>{" "}
              {news.newGrade}
            </p>
          )}
          {news.priceTarget && (
            <p>
              <span className="font-semibold text-muted-foreground">Precio Objetivo:</span> $
              {news.priceTarget.toLocaleString()}
            </p>
          )}
          {news.analystName && (
            <p>
              <span className="font-semibold text-muted-foreground">Analista:</span>{" "}
              {news.analystName}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
          <span>{company}</span>
          <span>{formattedDate}</span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
