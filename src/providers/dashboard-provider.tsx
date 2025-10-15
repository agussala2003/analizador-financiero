// src/providers/dashboard-provider.tsx

import React, { useCallback, useState, useMemo, createContext } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { useConfig } from "../hooks/use-config";
import { DashboardContextType } from "../types/dashboard";
import { indicatorConfig } from "../utils/financial";
import { logger } from "../lib/logger";

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
        
        /**
         * LÍMITE DE PLANES: dashboard.maxTickersToCompare
         * 
         * Aplicación: Número máximo de activos que el usuario puede comparar simultáneamente
         * en el dashboard.
         * 
         * Valores por plan (config.dashboard.maxTickersToCompare):
         * - basico: 3 activos
         * - plus: 5 activos
         * - premium: 10 activos
         * - administrador: 20 activos
         * 
         * Dónde se aplica: DashboardProvider.addTicker()
         * Impacto: Limita la cantidad de columnas en las tablas comparativas
         */
        const maxTickers = config.dashboard.maxTickersToCompare[role as keyof typeof config.dashboard.maxTickersToCompare] || 2;

        if (selectedTickers.length >= maxTickers) {
            void logger.warn('DASHBOARD_MAX_TICKERS_REACHED', `User attempted to add more than ${maxTickers} tickers`, {
                role,
                maxTickers,
                currentCount: selectedTickers.length,
            });
            toast.error(`Puedes comparar hasta ${maxTickers} activos a la vez en tu plan.`, {
                description: 'Elimina un activo de la lista para añadir uno nuevo.',
            });
            return;
        }

        /**
         * LÍMITE DE PLANES: plans.freeTierSymbols
         * 
         * Aplicación: Lista de símbolos de activos permitidos para el plan Básico.
         * Los usuarios del plan Básico solo pueden analizar activos en esta lista.
         * 
         * Dónde se aplica: DashboardProvider.addTicker()
         * Impacto: Restringe el acceso a solo ~90 activos populares para el plan gratuito
         * 
         * Nota: Los planes superiores (plus, premium, administrador) no tienen esta restricción.
         */
        if (role === 'basico' && !config.plans.freeTierSymbols.includes(ticker)) {
            void logger.warn('DASHBOARD_RESTRICTED_TICKER', `User in basico plan attempted to add restricted ticker: ${ticker}`, {
                role,
                ticker,
            });
            toast.error(`El símbolo ${ticker} no está disponible en el plan Básico.`);
            return;
        }
        
        void logger.info('DASHBOARD_TICKER_ADDED', `Ticker ${ticker} added to comparison`, {
            ticker,
            role,
            totalTickers: selectedTickers.length + 1,
        });
        setSelectedTickers(prev => [...prev, ticker]);

    }, [config, profile?.role, selectedTickers]);

    const removeTicker = useCallback((ticker: string) => {
        void logger.info('DASHBOARD_TICKER_REMOVED', `Ticker ${ticker} removed from comparison`, {
            ticker,
        });
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