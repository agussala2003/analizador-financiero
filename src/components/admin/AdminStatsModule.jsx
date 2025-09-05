// src/components/admin/AdminStatsModule.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Asegúrate de importar supabase

export default function AdminStatsModule() {
  const [topTickers, setTopTickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_top_searched_tickers', { limit_count: 5 });
      if (error) {
        console.error("Error fetching stats:", error);
      } else {
        setTopTickers(data);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <section className="animate-fade-in">
      <h3 className="text-xl font-semibold mb-2">Estadísticas</h3>
      {loading ? (
        <p className="text-sm text-gray-300">Cargando métricas...</p>
      ) : (
        <div>
          <h4 className="font-semibold mb-2">Tickers más buscados:</h4>
          <ul className="list-disc pl-5 text-gray-300">
            {topTickers.map(item => (
              <li key={item.ticker}>
                <strong>{item.ticker}:</strong> {item.search_count} veces
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}