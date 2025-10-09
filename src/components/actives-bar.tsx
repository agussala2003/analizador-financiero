// src/components/actives-bar.tsx

import { useEffect, useState, memo } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { getActiveTickers, ActiveTicker } from '../services/data/market/getActiveTickers';

// Componente para un solo item del ticker. Es memorizado para evitar re-renders innecesarios.
const TickerItem = memo(({ asset }: { asset: Omit<ActiveTicker, 'last_updated_at'> }) => {
    const isPositive = asset.data.dayChange >= 0;
    const colorClass = isPositive ? "text-green-500" : "text-red-500";
    const Icon = isPositive ? ArrowUp : ArrowDown;

    return (
        <div className="flex items-center flex-shrink-0 px-6 text-sm whitespace-nowrap">
            <span className="font-bold text-foreground">{asset.symbol}</span>
            <div className={`flex items-center ml-2 font-medium ${colorClass}`}>
                <Icon className="w-4 h-4 mr-1" />
                <span>{asset.data.dayChange.toFixed(2)}%</span>
            </div>
        </div>
    );
});
TickerItem.displayName = 'TickerItem';

/**
 * Barra superior que muestra un carrusel infinito con el rendimiento diario de activos.
 * Obtiene los datos de los activos actualizados en el día actual desde el servicio `getActiveTickers`.
 */
export default function ActivesBar() {
    const [activeAssets, setActiveAssets] = useState<Omit<ActiveTicker, 'last_updated_at'>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAssets = async () => {
            setLoading(true);
            const data = await getActiveTickers();
            setActiveAssets(data);
            setLoading(false);
        };
        void loadAssets();
    }, []);

    // Renderiza un placeholder si está cargando o no hay activos que mostrar.
    if (loading || activeAssets.length === 0) {
        return <div className="w-full h-10 border-b border-border" aria-hidden="true" />;
    }

    // Para un bucle perfecto, el número de items debe ser suficientemente grande
    const items = activeAssets.length > 10 ? activeAssets : [...activeAssets, ...activeAssets];

    return (
        <div className="relative w-full h-10 overflow-hidden border-b bg-background/80 backdrop-blur-sm border-border">
            <div className="absolute top-0 left-0 flex items-center h-full animate-scroll-infinite">
                {/* Renderizamos el contenido duplicado para el efecto de bucle infinito */}
                {items.map((asset, index) => (
                    <TickerItem key={`${asset.symbol}-${index}`} asset={asset} />
                ))}
                {items.map((asset, index) => (
                    <TickerItem key={`${asset.symbol}-duplicate-${index}`} asset={asset} />
                ))}
            </div>
            {/* Degradado en los bordes para un efecto de desvanecimiento suave */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />
        </div>
    );
}