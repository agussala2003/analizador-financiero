// src/providers/portfolio-provider.tsx

import React, { useState, useEffect, useCallback, createContext, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { Transaction, PortfolioContextType, PortfolioAssetData } from '../types/portfolio';
import { useAuth } from '../hooks/use-auth';
import { useConfig } from '../hooks/use-config';
import { calculateHoldings, calculateTotalPerformance } from '../utils/portfolio-calculations';

// Creamos un estado inicial que lanza un error si se usa fuera del provider.
// Esto elimina la necesidad de `PortfolioContextType | null`.
const initialState: PortfolioContextType = {
  transactions: [],
  holdings: [],
  totalPerformance: { pl: 0, percent: 0 },
  portfolioData: {},
  loading: true,
  addTransaction: () => Promise.reject(new Error("addTransaction llamado fuera de PortfolioProvider")),
  deleteAsset: () => Promise.reject(new Error("deleteAsset llamado fuera de PortfolioProvider")),
  refreshPortfolio: () => Promise.reject(new Error("refreshPortfolio llamado fuera de PortfolioProvider")),
};

export const PortfolioContext = createContext<PortfolioContextType>(initialState);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [portfolioData, setPortfolioData] = useState<Record<string, PortfolioAssetData>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const config = useConfig();

    const fetchPortfolioData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            setTransactions([]);
            return;
        }
        setLoading(true);

        const { data: transData, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('purchase_date', { ascending: false });
        
        if (transError) {
            console.error("Error al traer transacciones:", transError);
            setTransactions([]);
        } else {
            setTransactions(transData || []);
        }

        const symbols = [...new Set((transData || []).map(t => t.symbol))];
        if (symbols.length > 0) {
            try {
                const { data: assetData, error: assetError } = await supabase.functions.invoke('get-asset-data', {
                    body: { symbols },
                });
                if (assetError) throw assetError;
                setPortfolioData(assetData || {});
            } catch (error) {
                console.error("Error al traer datos de activos:", error);
                setPortfolioData({});
            }
        } else {
            setPortfolioData({});
        }

        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchPortfolioData();
    }, [fetchPortfolioData]);

    const holdings = useMemo(
        () => calculateHoldings(transactions, portfolioData),
        [transactions, portfolioData]
    );

    const totalPerformance = useMemo(
        () => calculateTotalPerformance(transactions, holdings),
        [transactions, holdings]
    );

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>): Promise<Transaction[] | null> => {
        if (!user || !profile) {
            throw new Error("Usuario no autenticado.");
        }
        
        const userRole = profile.role as keyof typeof config.plans.portfolioLimits;
        const limit = config.plans.portfolioLimits[userRole] || 5;
        
        const isNewAsset = !holdings.some(h => h.symbol === transaction.symbol);

        if (isNewAsset && holdings.length >= limit) {
            logger.warn('PORTFOLIO_LIMIT_REACHED', `User ${user.id} tried to add a new asset but reached their limit of ${limit}.`);
            throw new Error(`Has alcanzado el límite de ${limit} activos diferentes para tu plan.`);
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert({ ...transaction, user_id: user.id })
            .select();
        
        if (error) throw error;
        
        await fetchPortfolioData();
        return data;
    };

    const deleteAsset = async (symbol: string): Promise<void> => {
        if (!user) throw new Error("Usuario no autenticado.");
        
        logger.info('PORTFOLIO_ASSET_DELETE_START', `User ${user.id} is deleting asset ${symbol}.`);
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id)
            .eq('symbol', symbol);
        
        if (error) {
            logger.error('PORTFOLIO_ASSET_DELETE_FAILED', `Failed to delete asset ${symbol} for user ${user.id}.`, { error: error.message });
            throw error;
        }
        
        logger.info('PORTFOLIO_ASSET_DELETE_SUCCESS', `Asset ${symbol} deleted successfully for user ${user.id}.`);
        await fetchPortfolioData();
    };

    const value: PortfolioContextType = {
        transactions,
        holdings,
        totalPerformance,
        portfolioData,
        loading,
        addTransaction,
        deleteAsset,
        refreshPortfolio: fetchPortfolioData,
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
}