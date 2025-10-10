// src/providers/dashboard-provider.tsx

import React, { useCallback, useState, useMemo, createContext } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { useConfig } from "../hooks/use-config";
import { DashboardContextType } from "../types/dashboard";
import { indicatorConfig } from "../utils/financial";

// eslint-disable-next-line react-refresh/only-export-components
export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const config = useConfig();
    const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

    const addTicker = useCallback((tickerRaw: string) => {
        const ticker = tickerRaw.trim().toUpperCase();
        if (!ticker) return;

        if (selectedTickers.includes(ticker)) return;

        const role = profile?.role ?? 'basico';
        const maxTickers = config.dashboard.maxTickersToCompare[role as keyof typeof config.dashboard.maxTickersToCompare] || 2;

        if (selectedTickers.length >= maxTickers) {
            toast.error(`Puedes comparar hasta ${maxTickers} activos a la vez en tu plan.`, {
                description: 'Elimina un activo de la lista para añadir uno nuevo.',
            });
            return;
        }

        if (role === 'basico' && !config.plans.freeTierSymbols.includes(ticker)) {
            toast.error(`El símbolo ${ticker} no está disponible en el plan Básico.`);
            return;
        }
        
        setSelectedTickers(prev => [...prev, ticker]);

    }, [config, profile?.role, selectedTickers]);

    const removeTicker = useCallback((ticker: string) => {
        setSelectedTickers(prev => prev.filter(t => t !== ticker));
    }, []);
    
    const value: DashboardContextType = useMemo(() => ({
        indicatorConfig,
        selectedTickers,
        addTicker,
        removeTicker,
    }), [selectedTickers, addTicker, removeTicker]);

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}