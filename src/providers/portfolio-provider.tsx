// src/providers/portfolio-provider.tsx

import React, { createContext, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, PortfolioContextType, Holding, Portfolio } from '../types/portfolio';
import { AssetData } from '../types/dashboard';
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

// Define return type for fetch to include portfolios
interface FetchPortfolioResult {
    transactions: Transaction[];
    portfolioData: Record<string, AssetData>;
    portfolios: Portfolio[];
}

const fetchPortfolioData = async (userId: string | undefined): Promise<FetchPortfolioResult> => {
    if (!userId) {
        return { transactions: [], portfolioData: {}, portfolios: [] };
    }

    // 1. Fetch User Portfolios
    const portfoliosResult = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

    if (portfoliosResult.error) {
        throw new Error('No se pudo obtener tus portafolios.');
    }
    const portfolios = (portfoliosResult.data || []) as Portfolio[];

    // 2. Fetch Transactions
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
    let portfolioData: Record<string, AssetData> = {};

    // 3. Fetch Asset Data - Usar estructura completa de AssetData
    if (symbols.length > 0) {
        try {
            const assetResult = await supabase.functions.invoke('get-asset-data', {
                body: { symbols },
            });
            if (assetResult.error) throw assetResult.error;
            
            // Usar directamente la estructura completa de AssetData sin mapeo limitado
            portfolioData = (assetResult.data as Record<string, AssetData>) ?? {};
        } catch (error) {
            void logger.error('PORTFOLIO_FETCH_ERROR', 'Error al traer datos de activos', { error: errorToString(error) });
            portfolioData = {};
        }
    }

    return { transactions, portfolioData, portfolios };
};


export function PortfolioProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Local state for selected portfolio ID
    const [currentPortfolioId, setCurrentPortfolioId] = useState<number | null>(null);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['portfolio', user?.id],
        queryFn: () => fetchPortfolioData(user?.id),
        enabled: !!user,
    });

    const { addTransaction: addTransactionMutation } = usePortfolioMutations();

    const portfolios = useMemo(() => data?.portfolios ?? [], [data?.portfolios]);
    const allTransactions = useMemo(() => data?.transactions ?? [], [data?.transactions]);
    const portfolioData = useMemo(() => data?.portfolioData ?? {}, [data?.portfolioData]);

    // Initialize current portfolio - REMOVED auto-select to default to "All" (null)
    // useEffect(() => { ... }, []); 

    // Derived state based on current selection
    const currentPortfolio = useMemo(() =>
        portfolios.find(p => p.id === currentPortfolioId) ?? null,
        [portfolios, currentPortfolioId]);

    const transactions = useMemo(() =>
        currentPortfolioId === null
            ? allTransactions
            : allTransactions.filter(t => t.portfolio_id === currentPortfolioId),
        [allTransactions, currentPortfolioId]);

    const holdings: Holding[] = useMemo(() => calculateHoldings(transactions, portfolioData), [transactions, portfolioData]);
    const totalPerformance = useMemo(() => calculateTotalPerformance(transactions, holdings), [transactions, holdings]);
    // Actions
    const selectPortfolio = (portfolioId: number | null) => {
        setCurrentPortfolioId(portfolioId);
    };

    const createPortfolio = async (name: string): Promise<Portfolio> => {
        if (!user) throw new Error("No user");

        const result = await supabase
            .from('portfolios')
            .insert({ user_id: user.id, name })
            .select()
            .single();

        if (result.error) throw result.error;

        const newPortfolio = result.data as Portfolio;
        await queryClient.invalidateQueries({ queryKey: ['portfolio', user.id] });
        setCurrentPortfolioId(newPortfolio.id); // Switch to new
        return newPortfolio;
    };

    const deletePortfolio = async (portfolioId: number) => {
        if (!user) return;

        const { error } = await supabase
            .from('portfolios')
            .delete()
            .eq('id', portfolioId);

        if (error) throw error;

        await queryClient.invalidateQueries({ queryKey: ['portfolio', user.id] });
        // Reset selection if deleted current
        if (currentPortfolioId === portfolioId) {
            setCurrentPortfolioId(null);
        }
    };

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
        if (!user) {
            toast.error("Debes iniciar sesión para agregar una transacción.");
            return Promise.resolve(null);
        };

        // Ensure we have a target portfolio
        const targetPortfolioId = transaction.portfolio_id ?? currentPortfolioId;

        // If still null (All Portfolios view and no specific portfolio passed), error
        if (!targetPortfolioId) {
            toast.error("No se ha seleccionado ningún portafolio.");
            return Promise.resolve(null);
        }

        addTransactionMutation.mutate({
            ...transaction,
            userId: user.id,
            portfolio_id: targetPortfolioId
        });
        return Promise.resolve(null);
    };

    const deleteAsset = async (symbol: string) => {
        if (!user) {
            toast.error("Debes iniciar sesión.");
            return;
        }

        const toastId = toast.loading(`Eliminando ${symbol}...`);
        try {
            // Find transactions to delete
            let transactionsToDelete = [];

            if (currentPortfolioId) {
                transactionsToDelete = allTransactions
                    .filter(t => t.portfolio_id === currentPortfolioId && t.symbol === symbol);
            } else {
                // Delete from ALL portfolios
                transactionsToDelete = allTransactions
                    .filter(t => t.symbol === symbol);
            }

            if (transactionsToDelete.length === 0) {
                toast.dismiss(toastId);
                return;
            }

            const idsToDelete = transactionsToDelete.map(t => t.id);

            const { error } = await supabase
                .from('transactions')
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['portfolio', user.id] });
            toast.success(`${symbol} eliminado correctamente`, { id: toastId });
        } catch {
            toast.error('Error al eliminar el activo', { id: toastId });
        }
    };

    const value: PortfolioContextType = {
        transactions,
        holdings,
        totalPerformance,
        portfolioData,
        portfolios,
        currentPortfolio,
        loading: isLoading,
        error: isError ? error.message : null,
        selectPortfolio,
        createPortfolio,
        deletePortfolio,
        addTransaction,
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