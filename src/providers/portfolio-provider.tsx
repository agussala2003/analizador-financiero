// src/providers/portfolio-provider.tsx

import React, { useMemo, useState, useEffect, useCallback, createContext } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { Transaction, Holding, PortfolioContextType, PortfolioAssetData } from '../types/portfolio';
import { useAuth } from '../hooks/use-auth';
import { useConfig } from '../hooks/use-config';

// Creamos el contexto con el tipo definido y un valor inicial de null.
export const PortfolioContext = createContext<PortfolioContextType | null>(null);

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

    const holdings = useMemo((): Holding[] => {
        const assetMap = new Map<string, { quantity: number; totalCost: number; symbol: string }>();
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime());

        for (const tx of sortedTransactions) {
            let asset = assetMap.get(tx.symbol) || { quantity: 0, totalCost: 0, symbol: tx.symbol };
            
            if (tx.transaction_type === 'buy') {
                asset.quantity += Number(tx.quantity);
                asset.totalCost += Number(tx.quantity) * Number(tx.purchase_price);
            } else { // 'sell'
                const proportionSold = asset.quantity > 0 ? Number(tx.quantity) / asset.quantity : 0;
                asset.totalCost -= asset.totalCost * proportionSold;
                asset.quantity -= Number(tx.quantity);
            }
            assetMap.set(tx.symbol, asset);
        }
        
        const holdingsArray: Holding[] = [];
        assetMap.forEach((asset, symbol) => {
            if (asset.quantity > 1e-9) { // Evita problemas de precisión con punto flotante
                const assetData = portfolioData[symbol] || {};
                holdingsArray.push({
                    ...asset,
                    avgPurchasePrice: asset.quantity > 0 ? asset.totalCost / asset.quantity : 0,
                    assetData: assetData
                });
            }
        });

        return holdingsArray;
    }, [transactions, portfolioData]);

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
    
    const totalPerformance = useMemo(() => {
        let totalInvested = 0;
        let totalSoldValue = 0;

        for (const tx of transactions) {
            if (tx.transaction_type === 'buy') {
                totalInvested += Number(tx.quantity) * Number(tx.purchase_price);
            } else {
                totalSoldValue += Number(tx.quantity) * Number(tx.purchase_price);
            }
        }

        const currentValue = holdings.reduce((sum, h) => {
            const currentPrice = h.assetData?.currentPrice || 0;
            return sum + (h.quantity * currentPrice);
        }, 0);
        
        const totalPL = (currentValue + totalSoldValue) - totalInvested;
        const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

        return {
            pl: totalPL,
            percent: totalPLPercent
        };
    }, [transactions, holdings]);

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