import { useMemo, useCallback } from "react";
import { useDashboard } from "../../hooks/useDashboard";

export default function SummaryAnalysis() {
  const { selectedTickers, assetsData, indicatorConfig } = useDashboard();
  
  const assets = useMemo(
    () => selectedTickers.map(t => ({ ticker: t, ...assetsData[t] })),
    [selectedTickers, assetsData]
  );

  // --- MEJORA: La función ahora devuelve null si no hay datos válidos ---
  const pickBest = useCallback((key) => {
    const cfg = indicatorConfig[key];
    if (!cfg) return null; // Previene errores si la config no existe
    
    const validAssets = assets.filter(a => typeof a?.data?.[key] === 'number' && isFinite(a.data[key]));
    if (!validAssets.length) return null; // Si no hay datos válidos, devuelve null

    return validAssets.reduce((best, cur) => {
      const bestValue = best.data[key];
      const currentValue = cur.data[key];
      if (cfg.lowerIsBetter) {
        return currentValue < bestValue ? cur : best;
      }
      return currentValue > bestValue ? cur : best;
    });
  }, [assets, indicatorConfig]);

  // --- CORRECCIÓN: Se usa 'asPercent' en lugar de 'isPercentage' según tu config ---
  const formatValue = (key, value) => {
    const cfg = indicatorConfig[key];
    if (typeof value !== 'number') return 'N/A';
    if (cfg.asPercent) return `${(value * 100).toFixed(2)}%`;
    if (cfg.isLargeNumber) return `$${(value / 1e9).toFixed(2)}B`; // Formato para capitalización
    return value.toFixed(2);
  };
  
  // --- MEJORA: El array de secciones ahora es más completo ---
  const sections = useMemo(() => [
    ['Valoración (PER)', 'Mide si una acción está "barata" o "cara" respecto a sus ganancias. Menor es mejor.', 'PER'],
    ['Valoración (P/FCF)', 'Similar al PER, pero usa el flujo de caja libre, más difícil de manipular. Menor es mejor.', 'pfc_ratio'],
    ['Rentabilidad (ROE)', 'Eficiencia generando beneficios con el dinero de los accionistas. Mayor es mejor.', 'roe'],
    ['Rentabilidad (ROIC)', 'La rentabilidad considerando toda la inversión (capital + deuda). Mayor es mejor.', 'roic'],
    ['Salud Financiera (Deuda/Patrimonio)', 'Nivel de apalancamiento. Menor implica menos riesgo.', 'debtToEquity'],
    ['Liquidez (Current Ratio)', 'Capacidad para pagar deudas a corto plazo. Mayor es mejor (usualmente > 1.5).', 'currentRatio'],
    ['Dividendos', 'Rendimiento anual que paga la empresa a sus accionistas. Mayor es mejor.', 'dividendYield'],
    ['Riesgo de Mercado (Beta)', 'Volatilidad respecto al mercado. Menor implica más estabilidad.', 'beta'],
  ], []);

  // --- LÓGICA CENTRALIZADA: Calculamos todos los "mejores" y las fortalezas de una vez ---
  const analysis = useMemo(() => {
    const bestOf = {};
    sections.forEach(([, , key]) => {
      bestOf[key] = pickBest(key);
    });

    const tickerWins = {};
    selectedTickers.forEach(t => { tickerWins[t] = 0; });

    const strengthsByTicker = {};
    selectedTickers.forEach(t => { strengthsByTicker[t] = []; });

    Object.entries(bestOf).forEach(([key, bestAsset]) => {
      if (bestAsset) {
        tickerWins[bestAsset.ticker]++;
        strengthsByTicker[bestAsset.ticker].push(indicatorConfig[key].label);
      }
    });

    let mostBalanced = { ticker: 'N/A', wins: 0 };
    Object.entries(tickerWins).forEach(([ticker, wins]) => {
      if (wins > mostBalanced.wins) {
        mostBalanced = { ticker, wins };
      }
    });

    return { bestOf, strengthsByTicker, mostBalanced };
  }, [sections, selectedTickers, indicatorConfig, pickBest]);

  // Early return after all hooks
  if (!selectedTickers.length) return null;


  // --- COMPONENTE DE TARJETA: Ahora no renderiza nada si no hay datos ---
  const Card = ({ title, desc, metricKey }) => {
    const bestAsset = analysis.bestOf[metricKey];
    if (!bestAsset) return null; // No renderizar la tarjeta si no hay datos

    const value = bestAsset.data[metricKey];
    return (
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <h3 className="font-bold text-base text-blue-400 mb-1.5">{title}</h3>
        <p className="text-xs text-gray-400 mb-3">{desc}</p>
        <p className="text-sm">
          <span className="font-semibold">Destaca:</span>{" "}
          <strong className="text-white">{bestAsset.ticker}</strong> con un valor de {" "}
          <strong className="text-white">{formatValue(metricKey, value)}</strong>
        </p>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="p-4 bg-gray-900 rounded-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Resumen Comparativo de Métricas Clave</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sections.map(([title, desc, key]) => (
            <Card key={key} title={title} desc={desc} metricKey={key} />
          ))}
        </div>

        {assets.length > 1 && (
          <div className="mt-6 space-y-4">
            {/* Veredicto General Mejorado */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-green-400 mb-2">Veredicto General</h3>
              <p className="text-sm text-gray-300">
                Considerando todas las métricas, <strong className="text-white">{analysis.mostBalanced.ticker}</strong> se perfila como la opción más equilibrada, destacando en <strong className="text-white">{analysis.mostBalanced.wins}</strong> categorías clave.
                {analysis.strengthsByTicker[analysis.mostBalanced.ticker]?.length > 0 &&
                  ` Sus principales fortalezas son: ${analysis.strengthsByTicker[analysis.mostBalanced.ticker].slice(0, 2).join(', ')}.`
                }
                <br />
                <span className="text-gray-400">Siempre ajusta la decisión final a tu estrategia y perfil de riesgo.</span>
              </p>
            </div>

            {/* Nueva sección de Fortalezas Individuales */}
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h3 className="font-bold text-lg text-amber-400 mb-3">Fortalezas Individuales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTickers.map(ticker => {
                  const strengths = analysis.strengthsByTicker[ticker];
                  if (strengths.length === 0) return null;
                  return (
                    <div key={ticker}>
                      <p className="text-base font-semibold text-white">{ticker}</p>
                      <ul className="list-disc list-inside text-xs text-gray-400 space-y-1 mt-1">
                        {strengths.map(strength => <li key={strength}>{strength}</li>)}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
             <p className="mt-4 text-xs text-gray-500 text-center">
              *Análisis automatizado. No constituye una recomendación de inversión.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}