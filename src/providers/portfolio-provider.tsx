// src/providers/portfolio-provider.tsx

import React, { createContext, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, PortfolioContextType, PortfolioAssetData, Holding } from '../types/portfolio';
import { useAuth } from '../hooks/use-auth';
import { calculateHoldings, calculateTotalPerformance } from '../utils/portfolio-calculations';
import { LoadingScreen } from '../components/ui/loading-screen';
import { ErrorScreen } from '../components/ui/error-screen';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePortfolioMutations } from '../features/portfolio/hooks/use-portfolio-mutations';
import { toast } from 'sonner';
import { logger } from '../lib/logger';
import { errorToString } from '../utils/type-guards';


// eslint-disable-next-line react-refresh/only-export-components
export const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const fetchPortfolioData = async (userId: string | undefined) => {
    if (!userId) {
        return { transactions: [], portfolioData: {} };
    }

    const transResult = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false });

    if (transResult.error) {
        throw new Error('No se pudo obtener tus transacciones.');
    }

    const transactions = (transResult.data || []) as Transaction[];
    const symbols = [...new Set(transactions.map((t: Transaction) => t.symbol))];
    let portfolioData: Record<string, PortfolioAssetData> = {};

    if (symbols.length > 0) {
        try {
            const assetResult = await supabase.functions.invoke('get-asset-data', {
                body: { symbols },
            });
            if (assetResult.error) throw assetResult.error;
            portfolioData = (assetResult.data as Record<string, PortfolioAssetData>) ?? {};
        } catch (error) {
             console.error("Error al traer datos de activos:", error);
             portfolioData = {};
        }
    }

    return { transactions, portfolioData };
};


export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['portfolio', user?.id],
        queryFn: () => fetchPortfolioData(user?.id),
        enabled: !!user,
    });

    const { addTransaction: addTransactionMutation } = usePortfolioMutations();

    const transactions = useMemo(() => data?.transactions ?? [], [data?.transactions]);
    const portfolioData = useMemo(() => data?.portfolioData ?? {}, [data?.portfolioData]);
    
    const holdings: Holding[] = useMemo(() => calculateHoldings(transactions, portfolioData), [transactions, portfolioData]);
    const totalPerformance = useMemo(() => calculateTotalPerformance(transactions, holdings), [transactions, holdings]);
    
    const addTransaction = (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
        if (!user) {
            toast.error("Debes iniciar sesión para agregar una transacción.");
            return;
        };
        addTransactionMutation.mutate({ ...transaction, userId: user.id });
    };

    const deleteAsset = async (symbol: string) => {
        if (!user) {
            toast.error("Debes iniciar sesión para eliminar un activo.");
            return;
        }
        
        const toastId = toast.loading(`Eliminando ${symbol}...`);
        try {
            const result = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', user.id)
                .eq('symbol', symbol);
            
            if (result.error) throw result.error;

            toast.success(`Activo ${symbol} y su historial eliminados.`, { id: toastId });
            void logger.info('PORTFOLIO_ASSET_DELETE_SUCCESS', `Asset ${symbol} deleted for user ${user.id}.`);
            
            // Invalidamos la query para que se vuelva a cargar con los datos actualizados
            await queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });

        } catch (err: unknown) {
            toast.error('No se pudo eliminar el activo.', { id: toastId, description: errorToString(err) });
            void logger.error('PORTFOLIO_ASSET_DELETE_FAILED', `Failed to delete ${symbol} for user ${user.id}.`, { error: errorToString(err) });
        }
    };

    const value: PortfolioContextType = {
        transactions,
        holdings,
        totalPerformance,
        portfolioData,
        loading: isLoading,
        error: isError ? error.message : null,
        addTransaction: (transaction) => {
            addTransaction(transaction);
            return Promise.resolve(null);
        },
        deleteAsset,
        refreshPortfolio: async () => {
            await refetch();
        },
    };

    if (isLoading && !data) {
        return <LoadingScreen message="Cargando portafolio..." />;
    }
    if (isError) {
        return (
            <ErrorScreen
                title="Error al Cargar el Portafolio"
                message={error.message}
                onRetry={() => void refetch()}
            />
        );
    }

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
}