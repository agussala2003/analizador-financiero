// src/features/sectors-industries/types/index.ts

/**
 * Represents a single industry available in the market.
 */
export interface Industry {
  /**
   * Name of the industry (e.g., "Biotechnology", "Steel")
   */
  industry: string;
}

/**
 * Represents a single sector available in the market.
 */
export interface Sector {
  /**
   * Name of the sector (e.g., "Healthcare", "Energy")
   */
  sector: string;
}

/**
 * Represents historical performance data for a specific industry.
 */
export interface HistoricalIndustryPerformance {
  /**
   * Date of the performance data (YYYY-MM-DD format)
   */
  date: string;
  
  /**
   * Name of the industry
   */
  industry: string;
  
  /**
   * Stock exchange where the industry is traded
   */
  exchange: string;
  
  /**
   * Average percentage change for the industry on this date
   */
  averageChange: number;
}

/**
 * Represents historical performance data for a specific sector.
 */
export interface HistoricalSectorPerformance {
  /**
   * Date of the performance data (YYYY-MM-DD format)
   */
  date: string;
  
  /**
   * Name of the sector
   */
  sector: string;
  
  /**
   * Stock exchange where the sector is traded
   */
  exchange: string;
  
  /**
   * Average percentage change for the sector on this date
   */
  averageChange: number;
}

/**
 * Type for selecting between industry or sector view
 */
export type ViewMode = 'industries' | 'sectors';
