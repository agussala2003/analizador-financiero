// src/features/risk-premium/types/risk-premium.types.ts

/**
 * Country risk premium data from API
 */
export interface RiskPremiumData {
  country: string;
  continent: string;
  countryRiskPremium: number;
  totalEquityRiskPremium: number;
}

/**
 * Cached risk premium data from Supabase
 */
export interface CachedRiskPremiumData {
  data: RiskPremiumData[];
  last_updated_at: string;
}

/**
 * Props for the risk premium filters component
 */
export interface RiskPremiumFiltersProps {
  countryFilter: string;
  continentFilter: string;
  continents: string[];
  onCountryFilterChange: (value: string) => void;
  onContinentFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

/**
 * Props for the risk premium table component
 */
export interface RiskPremiumTableProps {
  data: RiskPremiumData[];
  countryFilter: string;
  continentFilter: string;
}
