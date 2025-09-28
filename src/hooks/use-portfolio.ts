// src/components/auth-provider.tsx

import { useContext } from "react";
import { PortfolioContext } from "../providers/portfolio-provider";
import { PortfolioContextType } from "../types/portfolio";

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (context === undefined || context === null) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};