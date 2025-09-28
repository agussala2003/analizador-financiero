import React from "react";
import { supabase } from "../lib/supabase";
import { ArrowDown, ArrowUp } from "lucide-react";

type TickerData = {
    dayChange: number;
};

type CachedAsset = {
    symbol: string;
    data: TickerData;
};

const TickerItem = ({ asset }: { asset: CachedAsset }) => {
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
};

export default function ActivesBar() {
    const [activeAssets, setActiveAssets] = React.useState<CachedAsset[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchActiveAssets = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('asset_data_cache').select('symbol, data');
                if (error) throw error;
                const filteredData = data?.filter(
                    (item): item is CachedAsset =>
                        item.symbol && !item.symbol.includes(' ') && !item.symbol.includes('-') &&
                        item.data && typeof item.data.dayChange === 'number'
                );
                setActiveAssets(filteredData || []);
            } catch (error) {
                console.error("Error fetching active assets:", error);
                setActiveAssets([]);
            } finally {
                setLoading(false);
            }
        };
        fetchActiveAssets();
    }, []);

    if (loading || activeAssets.length === 0) {
        return <div className="w-full h-10 border-b border-border" />;
    }

    return (
        // --- CONTENEDOR MEJORADO ---
        // 1. El contenedor principal ahora es 'relative' y 'overflow-hidden'.
        //    Define el tamaño y recorta todo lo que se salga.
        <div className="relative w-full h-10 overflow-hidden border-b bg-background/80 backdrop-blur-sm border-border">
            
            {/* 2. El contenido que se anima ahora es 'absolute'.
                   Esto lo saca del flujo normal del layout, impidiendo que estire a su padre. */}
            <div className="absolute top-0 left-0 flex items-center h-full animate-scroll-infinite">
                {/* Primera tanda de activos */}
                {activeAssets.map((asset) => (
                    <TickerItem key={asset.symbol} asset={asset} />
                ))}
                {/* Segunda tanda (duplicado) para el bucle infinito */}
                {activeAssets.map((asset) => (
                    <TickerItem key={`${asset.symbol}-duplicate`} asset={asset} />
                ))}
            </div>

            {/* 3. El degradado para los bordes se mantiene por encima */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-background via-transparent to-background" />
        </div>
    );
}