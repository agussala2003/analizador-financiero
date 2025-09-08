import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";

export default function Plans(){
  const { profile } = useAuth();
  const current = (profile?.role || 'basico').toLowerCase();
  const config = useConfig();

  const plans = [
    { key: 'basico',   name: 'Básico',   uses: config.plans.roleLimits.basico,   features: ['Indicadores fundamentales', 'Matriz de correlación', 'Exportación a PDF'] },
    { key: 'plus',     name: 'Plus',     uses: config.plans.roleLimits.plus,     features: ['Todo lo de Básico', 'Soporte prioritario', 'Históricos extendidos'] },
    { key: 'premium',  name: 'Premium',  uses: config.plans.roleLimits.premium,  features: ['Todo lo de Plus', 'Análisis avanzado y comparativas'] },
  ];

  return (
    <section className="card rounded-xl shadow-lg p-4 sm:p-5 md:p-6" aria-label="Planes disponibles">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Nuestros Planes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {plans.map(p=>(
          <article
            key={p.key}
            className={`card p-5 sm:p-6 rounded-lg border-2 flex flex-col ${current===p.key ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-gray-700'}`}
            aria-current={current===p.key ? "true" : "false"}
          >
            <h3 className={`text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4 ${current===p.key ? 'text-blue-400':'text-white'}`}>{p.name}</h3>
            <p className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">
              {p.uses === Infinity ? '∞' : p.uses}
              <span className="text-sm sm:text-lg font-medium text-gray-400">/día</span>
            </p>
            <ul className="space-y-2 text-gray-300 flex-grow text-sm sm:text-base">
              {p.features.map((f,i)=>(
                <li key={i} className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {current===p.key ? (
              <div className="w-full mt-5 sm:mt-6 py-2 rounded-lg font-semibold bg-gray-600 text-center select-none focus:outline-none">
                Plan Actual
              </div>
            ) : (
              <button
                type="button"
                disabled
                className="w-full mt-5 sm:mt-6 py-2 rounded-lg font-semibold bg-gray-700 text-gray-400 cursor-not-allowed"
                title="Contacta soporte para upgrade"
              >
                Próximamente
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
