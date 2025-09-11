// src/pages/DashboardPage.jsx
import { useState } from 'react';
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
import RiskReturnScatterPlot from '../components/dashboard/RiskReturnScatterPlot';
import KeyMetricsBarChart from '../components/dashboard/KeyMetricsBarChart';
import InfoIcon from '../components/dashboard/InfoIcon';
import { AutoDashboardTour, TourButton } from '../components/onboarding/TooltipSystem';

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
  const { addTicker, removeTicker, selectedTickers, loading } = useDashboard();
  const { showError } = useError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tickerInput) return;

    logger.info('DASHBOARD_TICKER_ADD_START', 'Usuario iniciando agregado de ticker', {
      ticker: tickerInput.toUpperCase(),
      currentTickers: selectedTickers,
      currentTickersCount: selectedTickers.length
    });

    try {
      await addTicker(tickerInput);
      logger.info('DASHBOARD_TICKER_ADD_SUCCESS', 'Ticker agregado exitosamente', {
        ticker: tickerInput.toUpperCase(),
        newTickersCount: selectedTickers.length + 1
      });
      setTickerInput('');
    } catch (err) {
      logger.error('DASHBOARD_TICKER_ADD_FAILED', 'Error al agregar ticker', {
        ticker: tickerInput.toUpperCase(),
        error: err?.message,
        currentTickers: selectedTickers
      });
      console.error('handleSubmit error:', err);
      showError('No se pudo agregar el activo.', { detail: err?.message });
    }
  };

  const getNavButtonClass = (viewName) =>
    `cursor-pointer py-2 px-4 rounded-t-lg transition-colors text-sm font-medium whitespace-nowrap ${
      activeView === viewName
        ? 'bg-gray-700 text-white border-b-2 border-blue-500'
        : 'text-gray-400 hover:bg-gray-800'
    }`;

  return (
    <div className='pb-4' aria-busy={loading ? "true" : "false"} aria-live="polite">
      <Header />
      <AutoDashboardTour tourSteps={dashboardPageTourSteps} />
      <div className="card bg-gray-800/50 p-4 w-11/12 sm:p-6 rounded-xl shadow-lg sm:w-full max-w-7xl mx-auto mb-14 pb-4">
        <section data-tour="ticker-form" className={`${selectedTickers.length > 0 ? 'mb-6' : ''}`} aria-busy={loading}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-2"
            aria-label="Agregar ticker"
          >
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
                onClick={() => {
                  logger.info('DASHBOARD_SYMBOLS_MODAL_OPENED', 'Usuario abriendo modal de símbolos disponibles', {
                    currentTickers: selectedTickers,
                    currentTickersCount: selectedTickers.length
                  });
                  setInfoModalOpen(true);
                }}
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
                {loading ? <Loader variant="spin" size="sm" color="white" /> : 'Agregar'}
              </button>
            </div>
          </form>

          {/* Loader sutil bajo el form */}
          {loading && (
            <div className="mt-3" aria-live="polite">
              <div className="h-1 w-full bg-gray-700 rounded overflow-hidden">
                <div className="h-1 w-1/2 animate-pulse bg-blue-500/70" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Consultando datos del activo…</p>
            </div>
          )}

          { selectedTickers.length > 0  && (
            <div data-tour="selected-tickers" className="flex flex-wrap gap-2 pt-4 min-h-[40px]">
              {selectedTickers.map((ticker) => (
                <div key={ticker} className="bg-gray-600 text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2 animate-fade-in">
                  <span>{ticker}</span>
                  <button 
                    onClick={() => {
                      logger.info('DASHBOARD_TICKER_REMOVED', 'Usuario removiendo ticker', {
                        removedTicker: ticker,
                        remainingTickers: selectedTickers.filter(t => t !== ticker),
                        newTickersCount: selectedTickers.length - 1
                      });
                      removeTicker(ticker);
                    }} 
                    className="cursor-pointer text-gray-300 hover:text-white" 
                    title="Quitar"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedTickers.length > 0 && (
          <main>
            {/* Tabs scrollables en mobile */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <nav data-tour="dashboard-tabs" className="flex flex-nowrap gap-2 border-b border-gray-600 mb-4">
                <button 
                  onClick={() => {
                    logger.info('DASHBOARD_VIEW_CHANGED', 'Usuario cambiando vista del dashboard', {
                      fromView: activeView,
                      toView: 'prices',
                      tickers: selectedTickers
                    });
                    setActiveView('prices');
                  }} 
                  className={getNavButtonClass('prices')}
                >
                  Precios y Volatilidad
                </button>
                <button 
                  onClick={() => {
                    logger.info('DASHBOARD_VIEW_CHANGED', 'Usuario cambiando vista del dashboard', {
                      fromView: activeView,
                      toView: 'fundamentals',
                      tickers: selectedTickers
                    });
                    setActiveView('fundamentals');
                  }} 
                  className={getNavButtonClass('fundamentals')}
                >
                  Indicadores
                </button>
                <button 
                  onClick={() => {
                    logger.info('DASHBOARD_VIEW_CHANGED', 'Usuario cambiando vista del dashboard', {
                      fromView: activeView,
                      toView: 'correlation',
                      tickers: selectedTickers
                    });
                    setActiveView('correlation');
                  }} 
                  className={getNavButtonClass('correlation')}
                >
                  Correlación
                </button>
                <button 
                  onClick={() => {
                    logger.info('DASHBOARD_VIEW_CHANGED', 'Usuario cambiando vista del dashboard', {
                      fromView: activeView,
                      toView: 'radar',
                      tickers: selectedTickers
                    });
                    setActiveView('radar');
                  }} 
                  className={getNavButtonClass('radar')}
                >
                  Comparativa
                </button>
                {/* <button onClick={() => setActiveView('risk-return')} className={getNavButtonClass('risk-return')}>Riesgo/Retorno</button> */}
                {/* <button onClick={() => setActiveView('key-metrics')} className={getNavButtonClass('key-metrics')}>Métricas Clave</button> */}
                <button 
                  onClick={() => {
                    logger.info('DASHBOARD_VIEW_CHANGED', 'Usuario cambiando vista del dashboard', {
                      fromView: activeView,
                      toView: 'summary',
                      tickers: selectedTickers
                    });
                    setActiveView('summary');
                  }} 
                  className={getNavButtonClass('summary')}
                >
                  Resumen
                </button>
                <button 
                  onClick={() => {
                    logger.info('DASHBOARD_VIEW_CHANGED', 'Usuario cambiando vista del dashboard', {
                      fromView: activeView,
                      toView: 'plans',
                      tickers: selectedTickers
                    });
                    setActiveView('plans');
                  }} 
                  className={getNavButtonClass('plans')}
                >
                  Planes
                </button>
                {/* Solo debe verse en pantallas grandes */}
                <div className="hidden md:block md:ml-auto">
                 <TourButton tourSteps={dashboardPageTourSteps} label="Ver Tour de Página" className="ml-auto" />
                </div>
              </nav>
            </div>

            <div data-tour="analysis-table">
              {activeView === 'prices' && <PriceAnalysisTable />}
              {activeView === 'fundamentals' && <FundamentalsTable />}
              {activeView === 'correlation' && <CorrelationMatrix />}
              {activeView === 'radar' && <RadarComparison />}
              {/* {activeView === 'risk-return' && <RiskReturnScatterPlot/>} */}
              {/* {activeView === 'key-metrics' && <KeyMetricsBarChart />} */}
              {activeView === 'summary' && <SummaryAnalysis />}
              {activeView === 'plans' && <Plans />}
            </div>
          </main>
        )}
      </div>
      <Footer />

      <AvailableSymbolsModal 
        isOpen={isInfoModalOpen} 
        onClose={() => {
          logger.info('DASHBOARD_SYMBOLS_MODAL_CLOSED', 'Usuario cerrando modal de símbolos disponibles', {
            currentTickers: selectedTickers,
            currentTickersCount: selectedTickers.length
          });
          setInfoModalOpen(false);
        }} 
      />
    </div>
  );
}
