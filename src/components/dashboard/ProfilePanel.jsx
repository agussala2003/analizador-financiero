import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { ROLE_LIMITS } from "../../utils/financial";

const TZ = 'America/Argentina/Buenos_Aires';

function timeToMidnightTZ(){
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate()+1);
  tomorrow.setHours(0,0,0,0);
  const diff = (tomorrow - now);
  const hh = String(Math.floor(diff/3600000)).padStart(2,'0');
  const mm = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
  const ss = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
}

// Skeleton simple reutilizable
function SkeletonLine({ w = "w-40" }) {
  return <div className={`h-4 ${w} bg-gray-700 rounded animate-pulse`} />;
}

export default function ProfilePanel(){
  const { user, profile } = useAuth();
  const [apiCalls, setApiCalls] = useState(null);
  const [limit, setLimit] = useState(null);
  const [timer, setTimer] = useState(timeToMidnightTZ());
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted=true;
    (async ()=>{
      if(!user) { setLoading(false); return; }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('api_calls_made, role')
          .eq('id', user.id)
          .maybeSingle();
        if(!mounted) return;
        if(!error && data){
          setApiCalls(data.api_calls_made ?? 0);
          setLimit(ROLE_LIMITS[data.role] ?? ROLE_LIMITS.basico);
        } else {
          setApiCalls(0);
          setLimit(ROLE_LIMITS[(profile?.role || 'basico')]);
        }
      } finally {
        setLoading(false);
      }
    })();

    const id = setInterval(()=> setTimer(timeToMidnightTZ()), 1000);
    return ()=>{ mounted=false; clearInterval(id); };
  }, [user, profile]);

  if(!user) return null;

  return (
    <section
      className="w-full max-w-2xl mx-auto card rounded-xl shadow-lg p-6 sm:p-8 text-center animate-fade-in"
      aria-busy={loading ? "true" : "false"}
      aria-live="polite"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 transition-colors">Mi Perfil</h2>

      {loading ? (
        <div className="space-y-3 text-left">
          <SkeletonLine w="w-64" />
          <SkeletonLine w="w-52" />
          <SkeletonLine w="w-40" />
        </div>
      ) : (
        <>
          <div className="space-y-3 text-base sm:text-lg">
            <p>
              <span className="font-semibold text-gray-400">Email:</span>{" "}
              <span className="text-white break-all">{user.email}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-400">Plan:</span>{" "}
              <span className="text-blue-400 font-bold capitalize">{(profile?.role || 'basico')}</span>
            </p>
            <p className="text-gray-300">
              Consultas hoy:{" "}
              <span className="font-semibold">
                {limit === Infinity ? 'Ilimitadas' : `${apiCalls} / ${limit}`}
              </span>
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Reinicio de Consultas</h3>
            <p className="text-2xl sm:text-3xl font-mono text-green-400" aria-live="polite">{timer}</p>
            <p className="text-xs text-gray-500 mt-2">Zona horaria: {TZ}</p>
          </div>
        </>
      )}
    </section>
  );
}
