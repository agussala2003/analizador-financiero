// src/features/news/types/news.types.ts

import type { NewsItem } from '../../../types/news';

/**
 * Props para el componente NewsCard
 */
export interface NewsCardProps {
  news: NewsItem;
  index: number;
}

/**
 * Props para el componente NewsFilters
 */
export interface NewsFiltersProps {
  symbolFilter: string;
  onSymbolFilterChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

/**
 * NewsItem - Re-export desde types globales
 */
export type { NewsItem } from '../../../types/news';
