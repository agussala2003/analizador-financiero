// src/providers/portfolio-provider.tsx

import React, { createContext, useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, PortfolioContextType, PortfolioAssetData, Holding, Portfolio } from '../types/portfolio';
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
    portfolioData: Record<string, PortfolioAssetData>;
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
    let portfolioData: Record<string, PortfolioAssetData> = {};

    // 3. Fetch Asset Data
    if (symbols.length > 0) {
        try {
            const assetResult = await supabase.functions.invoke('get-asset-data', {
                body: { symbols },
            });
            if (assetResult.error) throw assetResult.error;
            portfolioData = (assetResult.data as Record<string, PortfolioAssetData>) ?? {};
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

    // Initialize current portfolio if needed
    useEffect(() => {
        if (!isLoading && portfolios.length > 0 && currentPortfolioId === null) {
            setCurrentPortfolioId(portfolios[0].id);
        }
    }, [isLoading, portfolios, currentPortfolioId]);

    // Derived state based on current selection
    const currentPortfolio = useMemo(() =>
        portfolios.find(p => p.id === currentPortfolioId) || null,
        [portfolios, currentPortfolioId]);

    const transactions = useMemo(() =>
        allTransactions.filter(t => t.portfolio_id === currentPortfolioId),
        [allTransactions, currentPortfolioId]);

    const holdings: Holding[] = useMemo(() => calculateHoldings(transactions, portfolioData), [transactions, portfolioData]);
    const totalPerformance = useMemo(() => calculateTotalPerformance(transactions, holdings), [transactions, holdings]);

    // Actions
    const selectPortfolio = (portfolioId: number) => {
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

        // Optimistic update handled by invalidation for now due to complexity of cascading deletes if not handled by DB
        // Assuming DB has cascade delete or we delete transactions first. 
        // For safety, let's rely on DB cascade if set, otherwise we might need a stored procedure or explicit deletes.
        // Given existing structure, let's try direct delete.

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
        if (!user || !currentPortfolioId) {
            toast.error("Debes iniciar sesión y seleccionar un portfolio.");
            return;
        }

        const toastId = toast.loading(`Eliminando ${symbol}...`);
        try {
            const result = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', user.id)
                .eq('portfolio_id', currentPortfolioId)
                .eq('symbol', symbol);

            if (result.error) throw result.error;

            toast.success(`Activo ${symbol} y su historial eliminados.`, { id: toastId });
            void logger.info('PORTFOLIO_ASSET_DELETE_SUCCESS', `Asset ${symbol} deleted for user ${user.id} in portfolio ${currentPortfolioId}.`);

            await queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });

        } catch (err: unknown) {
            toast.error('No se pudo eliminar el activo.', { id: toastId, description: errorToString(err) });
            void logger.error('PORTFOLIO_ASSET_DELETE_FAILED', `Failed to delete ${symbol}`, { error: errorToString(err) });
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