// src/pages/DashboardPage.jsx
import { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useError } from '../context/ErrorContext';
import Header from '../components/ui/Header';
import AvailableSymbolsModal from '../components/ui/AvailableSymbolsModal';
import PriceAnalysisTable from '../components/dashboard/PriceAnalysisTable';
import FundamentalsTable from '../components/dashboard/FundamentalsTable';
import CorrelationMatrix from '../components/dashboard/CorrelationMatrix';
import SummaryAnalysis from '../components/dashboard/SummaryAnalysis';
import Plans from '../components/dashboard/Plans';
import ProfilePanel from '../components/dashboard/ProfilePanel';
import Loader from '../components/ui/Loader';
import Footer from '../components/ui/Footer';
import RadarComparison from '../components/dashboard/RadarComparison';
import RiskReturnScatterPlot from '../components/dashboard/RiskReturnScatterPlot';
import KeyMetricsBarChart from '../components/dashboard/KeyMetricsBarChart';
import InfoIcon from '../components/dashboard/InfoIcon';


export default function DashboardPage() {
  const [activeView, setActiveView] = useState('prices');
  const [tickerInput, setTickerInput] = useState('');
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const { addTicker, removeTicker, selectedTickers, loading } = useDashboard();
  const { showError } = useError();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tickerInput) return;

    try {
      await addTicker(tickerInput);
      setTickerInput('');
    } catch (err) {
      console.error('handleSubmit error:', err);
      showError('No se pudo agregar el activo.', { detail: err?.message });
    }
  };

  const getNavButtonClass = (viewName) =>
    `py-2 px-4 rounded-t-lg transition-colors text-sm font-medium whitespace-nowrap ${
      activeView === viewName
        ? 'bg-gray-700 text-white border-b-2 border-blue-500'
        : 'text-gray-400 hover:bg-gray-800'
    }`;

  return (
    <div className='pb-4' aria-busy={loading ? "true" : "false"} aria-live="polite">
      <Header />
      <div className="card bg-gray-800/50 p-4 w-11/12 sm:p-6 rounded-xl shadow-lg sm:w-full max-w-7xl mx-auto mb-14 pb-4">
        <section className={`${selectedTickers.length > 0 ? 'mb-6' : ''}`} aria-busy={loading}>
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
                onClick={() => setInfoModalOpen(true)}
                className="p-2.5 text-gray-400 hover:text-white bg-gray-700 rounded-lg"
                title="Ver símbolos disponibles"
              >
                <InfoIcon className="w-5 h-5" />
              </button>
              <button
                type="submit"
                disabled={loading || !tickerInput}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg disabled:bg-gray-500"
              >
                {loading ? <Loader size="4" message="" /> : 'Agregar'}
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
            <div className="flex flex-wrap gap-2 pt-4 min-h-[40px]">
              {selectedTickers.map((ticker) => (
                <div key={ticker} className="bg-gray-600 text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2 animate-fade-in">
                  <span>{ticker}</span>
                  <button onClick={() => removeTicker(ticker)} className="text-gray-300 hover:text-white" title="Quitar">&times;</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedTickers.length > 0 && (
          <main>
            {/* Tabs scrollables en mobile */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <nav className="flex flex-nowrap gap-2 border-b border-gray-600 mb-4">
                <button onClick={() => setActiveView('prices')} className={getNavButtonClass('prices')}>Precios y Volatilidad</button>
                <button onClick={() => setActiveView('fundamentals')} className={getNavButtonClass('fundamentals')}>Indicadores</button>
                <button onClick={() => setActiveView('correlation')} className={getNavButtonClass('correlation')}>Correlación</button>
                <button onClick={() => setActiveView('radar')} className={getNavButtonClass('radar')}>Comparativa</button>
                {/* <button onClick={() => setActiveView('risk-return')} className={getNavButtonClass('risk-return')}>Riesgo/Retorno</button> */}
                {/* <button onClick={() => setActiveView('key-metrics')} className={getNavButtonClass('key-metrics')}>Métricas Clave</button> */}
                <button onClick={() => setActiveView('summary')} className={getNavButtonClass('summary')}>Resumen</button>
                <button onClick={() => setActiveView('plans')} className={getNavButtonClass('plans')}>Planes</button>
                <button onClick={() => setActiveView('profile')} className={getNavButtonClass('profile')}>Perfil</button>
              </nav>
            </div>

            <div>
              {activeView === 'prices' && <PriceAnalysisTable />}
              {activeView === 'fundamentals' && <FundamentalsTable />}
              {activeView === 'correlation' && <CorrelationMatrix />}
              {activeView === 'radar' && <RadarComparison />}
              {/* {activeView === 'risk-return' && <RiskReturnScatterPlot/>} */}
              {/* {activeView === 'key-metrics' && <KeyMetricsBarChart />} */}
              {activeView === 'summary' && <SummaryAnalysis />}
              {activeView === 'plans' && <Plans />}
              {activeView === 'profile' && <ProfilePanel />}
            </div>
          </main>
        )}
      </div>
      <Footer />

      <AvailableSymbolsModal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </div>
  );
}
