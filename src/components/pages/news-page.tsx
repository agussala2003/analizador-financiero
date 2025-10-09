import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import { useConfig } from "../../hooks/use-config";
import { supabase } from "../../lib/supabase";
import { logger } from "../../lib/logger";
import { toast } from "sonner";
import { NewsItem } from "../../types/news";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ListFilter, Newspaper, X } from "lucide-react";
import PaginationDemo from "../pagination-demo";

const NewsCard = ({ news, index }: { news: NewsItem; index: number }) => {
    const company = news.gradingCompany ?? news.analystCompany ?? 'N/A';

    const formattedDate = new Date(news.publishedDate).toLocaleString('es-AR', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="h-full"
        >
            <Card className="flex flex-col h-full transition-shadow duration-300 shadow-sm hover:shadow-lg">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg leading-tight">
                            <a href={news.newsURL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                {news.newsTitle}
                            </a>
                        </CardTitle>
                        <Badge variant="secondary" className="whitespace-nowrap">{news.symbol}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3 text-sm">
                    {news.newGrade && (
                        <p><span className="font-semibold text-muted-foreground">Calificación:</span> {news.newGrade}</p>
                    )}
                    {news.priceTarget && (
                        <p><span className="font-semibold text-muted-foreground">Precio Objetivo:</span> ${news.priceTarget.toLocaleString()}</p>
                    )}
                    {news.analystName && (
                        <p><span className="font-semibold text-muted-foreground">Analista:</span> {news.analystName}</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
                    <span>{company}</span>
                    <span>{formattedDate}</span>
                </CardFooter>
            </Card>
        </motion.div>
    );
};


// --- NUEVO SKELETON: CardSkeleton ---
// Un esqueleto de carga que imita la estructura de las tarjetas para una mejor experiencia.
const CardSkeleton = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter className="pt-4 mt-auto border-t">
                    <div className="flex justify-between w-full">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function NewsPage() {
    const [news, setNews] = React.useState<NewsItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const config = useConfig();
    const itemsPerPage = config.news.pageSize ;

    // --- NUEVOS ESTADOS PARA FILTROS ---
    const [symbolFilter, setSymbolFilter] = React.useState("");
    const [companyFilter, setCompanyFilter] = React.useState("");

    // --- LÓGICA DE FETCH (sin cambios) ---
    React.useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setCurrentPage(1);
            const CACHE_KEY = 'news_page';
            try {
                const response = await supabase.from('asset_data_cache').select('data, last_updated_at').eq('symbol', CACHE_KEY).single();
                const cached = response.data as { data: NewsItem[]; last_updated_at: string } | null;
                const cacheError = response.error as { code?: string; message?: string } | null;
                if (cacheError && cacheError.code !== 'PGRST116') throw new Error(typeof cacheError === 'object' && cacheError && 'message' in cacheError && typeof (cacheError as { message?: unknown }).message === 'string' ? (cacheError as { message: string }).message : JSON.stringify(cacheError));
                const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
                if (cached && new Date(cached.last_updated_at) > sixHoursAgo) {
                    setNews(Array.isArray(cached.data) ? cached.data : []);
                    return;
                }
                const limit: number = Number(config.news.defaultLimit) || 20;
                const endpoints = [`${config.api.fmpProxyEndpoints.newsPriceTarget}?page=0&limit=${limit}`, `${config.api.fmpProxyEndpoints.newsGrades}?page=0&limit=${limit}`];
                const promises = endpoints.map(endpointPath => supabase.functions.invoke('fmp-proxy', { body: { endpointPath } }));
                const results: { data?: unknown; error?: { code?: string; message?: string } | null }[] = await Promise.all(promises);
                const errors: { code?: string; message?: string }[] = results
                    .map(res => (res && typeof res === 'object' && 'error' in res && res.error ? res.error as { code?: string; message?: string } : null))
                    .filter((e): e is { code?: string; message?: string } => Boolean(e));
                if (errors.length > 0) throw new Error(errors.map(e => (typeof e === 'object' && e && 'message' in e && typeof (e as { message?: unknown }).message === 'string' ? (e as { message: string }).message : JSON.stringify(e))).join(', '));
                                                function isNewsItem(obj: unknown): obj is NewsItem {
                                                    if (!obj || typeof obj !== 'object') return false;
                                                    const o = obj as Record<string, unknown>;
                                                    return (
                                                        typeof o.newsURL === 'string' &&
                                                        typeof o.newsTitle === 'string' &&
                                                        typeof o.publishedDate === 'string' &&
                                                        typeof o.symbol === 'string'
                                                    );
                                                }
                                const combinedData: NewsItem[] = results.flatMap(res =>
                                    (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)
                                        ? res.data.filter(isNewsItem)
                                        : [])
                                );
                                combinedData.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
                                setNews(combinedData);
                                await supabase.from('asset_data_cache').upsert({ symbol: CACHE_KEY, data: combinedData, last_updated_at: new Date().toISOString() });
            } catch (error: unknown) {
                const msg = (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string')
                  ? (error as { message: string }).message
                  : JSON.stringify(error);
                void logger.error("NEWS_FETCH_FAILED", msg);
                const fallbackResp = await supabase.from('asset_data_cache').select('data').eq('symbol', CACHE_KEY).single();
                const cachedFallback = fallbackResp.data as { data?: unknown } | null;
                if (cachedFallback && Array.isArray(cachedFallback.data)) {
                    setNews(cachedFallback.data as NewsItem[]);
                    toast.warning("No se pudieron actualizar las noticias. Mostrando la última versión disponible.");
                } else {
                    toast.error("Ocurrió un error al obtener las noticias.");
                    setNews([]);
                }
            } finally {
                setLoading(false);
            }
        };
        void fetchNews();
    }, [config]);

    const filteredNews = useMemo(() => {
        return news.filter(item => {
            const symbolMatch = symbolFilter ? item.symbol.toLowerCase().includes(symbolFilter.toLowerCase()) : true;
            const company = item.gradingCompany ?? item.analystCompany ?? '';
            const companyMatch = companyFilter ? company.toLowerCase().includes(companyFilter.toLowerCase()) : true;
            return symbolMatch && companyMatch;
        });
    }, [news, symbolFilter, companyFilter]);
    
    const currentItems = React.useMemo(() => {
        const pageSize = typeof itemsPerPage === 'number' ? itemsPerPage : Number(itemsPerPage) || 20;
        const indexOfLastItem = currentPage * pageSize;
        const indexOfFirstItem = indexOfLastItem - pageSize;
        return filteredNews.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredNews, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredNews.length / (typeof itemsPerPage === 'number' ? itemsPerPage : Number(itemsPerPage) || 20));

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const clearFilters = () => {
        setSymbolFilter("");
        setCompanyFilter("");
        setCurrentPage(1);
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-10">
                                 <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-4 pb-4 mb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Newspaper className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ultimas Noticias Financieras</h1>
                        <p className="text-muted-foreground">
                        Mantente al día con las últimas noticias del mercado y los eventos que pueden afectar tus inversiones.
                        </p>
                    </div>
                    </div>
                </motion.div>

                {/* --- NUEVA BARRA DE FILTROS --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card className="mb-8 p-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <ListFilter className="w-5 h-5 text-muted-foreground hidden sm:block" />
                            <Input
                                placeholder="Filtrar por Símbolo..."
                                value={symbolFilter}
                                onChange={(e) => setSymbolFilter(e.target.value)}
                                className="w-full sm:w-auto"
                            />
                            <Input
                                placeholder="Filtrar por Compañía..."
                                value={companyFilter}
                                onChange={(e) => setCompanyFilter(e.target.value)}
                                className="w-full sm:w-auto"
                            />
                            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto ml-auto">
                                <X className="w-4 h-4 mr-2" />
                                Limpiar
                            </Button>
                        </div>
                    </Card>
                </motion.div>


                {loading ? (
                    <CardSkeleton />
                ) : (
                    <>
                        <div className="min-h-fit"> 
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPage} // La clave sigue siendo importante
                                    className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }} // Una transición más rápida se siente mejor
                                >
                                    {currentItems.map((item, index) => (
                                        <NewsCard key={`${item.newsURL}-${index}`} news={item} index={index} />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {currentItems.length === 0 && !loading && (
                            <div className="py-10 text-center text-muted-foreground">No se encontraron noticias con los filtros aplicados.</div>
                        )}

                        {totalPages > 1 && (
                            <div className="mt-10">
                                <PaginationDemo
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}