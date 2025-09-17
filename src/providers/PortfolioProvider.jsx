import { useMemo, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { PortfolioContext } from '../context/portfolioContext';
import { logger } from '../lib/logger';
import { useConfig } from '../hooks/useConfig';

export function PortfolioProvider({ children }) {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [portfolioData, setPortfolioData] = useState({});
  const [loading, setLoading] = useState(true);
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

  const addTransaction = async (transaction) => {
    const userRole = profile?.role || 'basico';
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

  // ✨ NUEVO: Función para eliminar un activo y sus transacciones
  const deleteAsset = async (symbol) => {
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
    await fetchPortfolioData(); // Recargar los datos
  };
  
  const holdings = useMemo(() => {
    const assetMap = new Map();
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));

    for (const tx of sortedTransactions) {
      let asset = assetMap.get(tx.symbol) || { quantity: 0, totalCost: 0, symbol: tx.symbol };
      
      if (tx.transaction_type === 'buy') {
        asset.quantity += Number(tx.quantity);
        asset.totalCost += Number(tx.quantity) * Number(tx.purchase_price);
      } else {
        const proportionSold = Number(tx.quantity) / asset.quantity;
        if (asset.quantity > 0) {
          asset.totalCost -= asset.totalCost * proportionSold;
        }
        asset.quantity -= Number(tx.quantity);
      }
      assetMap.set(tx.symbol, asset);
    }
    
    const holdingsArray = [];
    assetMap.forEach((asset, symbol) => {
      if (asset.quantity > 1e-9) {
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

  // --- MODIFICADO: Cálculo de Rendimiento Total (Actual + Histórico) ---
  const totalPerformance = useMemo(() => {
    let totalInvested = 0;
    let totalSoldValue = 0;

    for (const tx of transactions) {
      if (tx.transaction_type === 'buy') {
        totalInvested += Number(tx.quantity) * Number(tx.purchase_price);
      } else {
        // Para una venta, 'purchase_price' es el precio de venta.
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


 const value = {
    transactions,
    holdings,
    totalPerformance,
    portfolioData,
    loading,
    addTransaction,
    deleteAsset, // ✨ Exportar nueva función
    refreshPortfolio: fetchPortfolioData,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}
