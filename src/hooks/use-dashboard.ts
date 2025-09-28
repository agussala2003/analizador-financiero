// src/components/auth-provider.tsx

import { useContext } from "react";
import { DashboardContext } from "../providers/dashboard-provider";

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};