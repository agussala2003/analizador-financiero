// src/components/admin/AdminStatsModule.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useError } from '../../hooks/useError';

// --- Iconos para las tarjetas de estadísticas ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0112 13a5.995 5.995 0 01-3 5.197z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;


// --- Componente para una tarjeta de estadística ---
function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex items-center gap-6">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-400">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-700 rounded-md animate-pulse mt-1"></div>
        ) : (
          <p className="text-3xl font-bold text-white">{value}</p>
        )}
      </div>
    </div>
  );
}

// --- Componente principal del módulo ---
export default function AdminStatsModule() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsersToday: 0, totalBlogs: 0 });
  const [topTickers, setTopTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      try {
        const [
          { data: totalUsers, error: error1 },
          { data: activeUsersToday, error: error2 }, // ✅ Llamamos a la nueva función
          { data: totalBlogs, error: error3 },
          { data: tickersData, error: error4 }
        ] = await Promise.all([
          supabase.rpc('get_total_users'),
          supabase.rpc('get_active_users_today'), // ✅ Llamamos a la nueva función
          supabase.rpc('get_total_blogs'),
          supabase.rpc('get_top_searched_tickers', { limit_count: 5 })
        ]);

        if (error1 || error2 || error3 || error4) {
          throw error1 || error2 || error3 || error4;
        }
        
        setStats({ totalUsers, activeUsersToday, totalBlogs }); // ✅ Guardamos la nueva estadística
        setTopTickers(tickersData);

      } catch (error) {
        console.error("Error fetching stats:", error);
        showError("No se pudieron cargar las estadísticas.", { detail: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchAllStats();
  }, [showError]);

  return (
    <section className="animate-fade-in space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Visión General</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Usuarios Totales" value={stats.totalUsers} icon={<UsersIcon />} loading={loading} />
          <StatCard title="Usuarios Activos Hoy" value={stats.activeUsersToday} icon={<ActivityIcon />} loading={loading} /> {/* ✅ Mostramos la nueva estadística */}
          <StatCard title="Blogs Totales" value={stats.totalBlogs} icon={<DocumentTextIcon />} loading={loading} />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Tickers Más Buscados</h3>
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 w-3/4 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-6 w-1/2 bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-6 w-2/3 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          ) : topTickers.length === 0 ? (
             <p className="text-gray-400">Aún no hay datos de tickers buscados.</p>
          ) : (
            <ul className="space-y-3">
              {topTickers.map((item, index) => (
                <li key={item.ticker} className="flex justify-between items-center text-white">
                  <span className="font-semibold">{index + 1}. {item.ticker}</span>
                  <span className="text-gray-300 font-mono bg-gray-700/50 px-3 py-1 rounded-md">{item.search_count} búsquedas</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}