// src/pages/DashboardPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useError } from '../hooks/useError';
import { logger } from '../lib/logger';
import Header from '../components/ui/Header';
import AvailableSymbolsModal from '../components/ui/AvailableSymbolsModal';
import PriceAnalysisTable from '../components/dashboard/PriceAnalysisTable';
import FundamentalsTable from '../components/dashboard/FundamentalsTable';
import CorrelationMatrix from '../components/dashboard/CorrelationMatrix';
import SummaryAnalysis from '../components/dashboard/SummaryAnalysis';
import Plans from '../components/dashboard/Plans';
import Loader from '../components/ui/Loader';
import Footer from '../components/ui/Footer';
import RadarComparison from '../components/dashboard/RadarComparison';
import InfoIcon from '../components/dashboard/InfoIcon';
import { TourButton } from '../components/onboarding/TooltipSystem';
import { usePortfolio } from '../hooks/usePortfolio';

const dashboardPageTourSteps = [
  {
    selector: '[data-tour="ticker-form"]',
    title: '1. Añade un Activo',
    description: 'Escribe el símbolo de una acción (ej: AAPL, GOOGL) y presiona "Agregar" para empezar tu análisis.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="selected-tickers"]',
    title: '2. Activos Seleccionados',
    description: 'Aquí aparecerán los activos que agregues. Puedes comparar hasta 5 a la vez.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="dashboard-tabs"]',
    title: '3. Vistas de Análisis',
    description: 'Navega entre diferentes tablas y gráficos para analizar precios, fundamentales, correlación y más.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="analysis-table"]',
    title: '4. Área de Datos',
    description: 'Aquí se mostrará la información detallada según la vista que hayas seleccionado. Puedes ordenar las tablas y exportar los datos.',
    placement: 'top'
  },
];

export default function DashboardPage() {
  const [activeView, setActiveView] = useState('prices');
  const [tickerInput, setTickerInput] = useState('');
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  
  const { addTicker, removeTicker, selectedTickers, loading: dashboardLoading } = useDashboard();
  const { holdings, loading: portfolioLoading } = usePortfolio(); // Se usa 'holdings' en lugar de 'transactions'
  const { showError } = useError();
  
  const portfolioLoadedRef = useRef(false);

  // --- LÓGICA CORREGIDA PARA CARGAR ACTIVOS DEL PORTAFOLIO ---
  useEffect(() => {
    if (portfolioLoadedRef.current) return;

    if (!portfolioLoading && holdings) {
      portfolioLoadedRef.current = true;

      // Obtenemos los símbolos directamente de las posiciones actuales (holdings)
      const portfolioSymbols = holdings.map(h => h.symbol);
      
      portfolioSymbols.forEach(symbol => {
        addTicker(symbol, true);
      });
    }
  }, [portfolioLoading, holdings, addTicker]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tickerInput) return;
    await addTicker(tickerInput);
    setTickerInput('');
  };

  const getNavButtonClass = (viewName) =>
    `cursor-pointer py-2 px-4 rounded-t-lg transition-colors text-sm font-medium whitespace-nowrap ${
      activeView === viewName
        ? 'bg-gray-700 text-white border-b-2 border-blue-500'
        : 'text-gray-400 hover:bg-gray-800'
    }`;

  const loading = dashboardLoading || (portfolioLoading && selectedTickers.length === 0);

  return (
    <div className='pb-4' aria-busy={loading ? "true" : "false"} aria-live="polite">
      <Header />
      <div className="card bg-gray-800/50 p-4 w-11/12 sm:p-6 rounded-xl shadow-lg sm:w-full max-w-7xl mx-auto mb-14 pb-4">
        <section data-tour="ticker-form" className={`${selectedTickers.length > 0 ? 'mb-6' : ''}`} aria-busy={loading}>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              placeholder="Buscar Ticker (Ej: AAPL, MSFT...)"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              disabled={loading}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInfoModalOpen(true)}
                className="cursor-pointer p-2.5 text-gray-400 hover:text-white bg-gray-700 rounded-lg"
                title="Ver símbolos disponibles"
              >
                <InfoIcon className="w-6 h-6" />
              </button>
              <button
                type="submit"
                disabled={loading || !tickerInput}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg disabled:bg-gray-500"
              >
                {dashboardLoading ? <Loader variant="spin" size="sm" color="white" /> : 'Agregar'}
              </button>
            </div>
          </form>

          {loading && (
            <div className="mt-3" aria-live="polite">
              <p className="text-xs text-gray-400 mt-2">Cargando datos del activo...</p>
            </div>
          )}

          {selectedTickers.length > 0 && (
            <div data-tour="selected-tickers" className="flex flex-wrap gap-2 pt-4 min-h-[40px]">
              {selectedTickers.map((ticker) => (
                <div key={ticker} className="bg-gray-600 text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2 animate-fade-in">
                  <span>{ticker}</span>
                  <button onClick={() => removeTicker(ticker)} className="cursor-pointer text-gray-300 hover:text-white" title="Quitar">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedTickers.length > 0 && (
          <main>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <nav data-tour="dashboard-tabs" className="flex flex-nowrap gap-2 border-b border-gray-600 mb-4">
                <button onClick={() => setActiveView('prices')} className={getNavButtonClass('prices')}>Precios y Volatilidad</button>
                <button onClick={() => setActiveView('fundamentals')} className={getNavButtonClass('fundamentals')}>Indicadores</button>
                <button onClick={() => setActiveView('correlation')} className={getNavButtonClass('correlation')}>Correlación</button>
                <button onClick={() => setActiveView('radar')} className={getNavButtonClass('radar')}>Comparativa</button>
                <button onClick={() => setActiveView('summary')} className={getNavButtonClass('summary')}>Resumen</button>
                <button onClick={() => setActiveView('plans')} className={getNavButtonClass('plans')}>Planes</button>
                <div className="hidden md:block md:ml-auto">
                 <TourButton tourSteps={dashboardPageTourSteps} label="Ver Tour de Página" className="ml-auto md:cursor-pointer" />
                </div>
              </nav>
            </div>
            <div data-tour="analysis-table">
              {activeView === 'prices' && <PriceAnalysisTable />}
              {activeView === 'fundamentals' && <FundamentalsTable />}
              {activeView === 'correlation' && <CorrelationMatrix />}
              {activeView === 'radar' && <RadarComparison />}
              {activeView === 'summary' && <SummaryAnalysis />}
              {activeView === 'plans' && <Plans />}
            </div>
          </main>
        )}
      </div>
      <Footer />
      <AvailableSymbolsModal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </div>
  );
}
