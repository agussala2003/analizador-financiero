// src/types/news.ts

/**
 * Representa un artículo de noticia financiera.
 */
export interface NewsItem {
  symbol: string;
  newsTitle: string;
  newsURL: string;
  publishedDate: string;
  gradingCompany?: string;
  analystCompany?: string;
  newsPublisher: string;
  newGrade?: string;
  previousGrade?: string;
  priceTarget?: number;
  analystName?: string;
}