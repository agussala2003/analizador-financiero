// src/features/news/pages/news-page.tsx

import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import { useConfig } from "../../../hooks/use-config";
import { supabase } from "../../../lib/supabase";
import { logger } from "../../../lib/logger";
import { toast } from "sonner";
import { Newspaper } from "lucide-react";
import PaginationDemo from "../../../components/ui/pagination-demo";
import { errorToString, isNewsItem } from "../../../utils/type-guards";
import { NewsCard, NewsFilters, NewsSkeleton, NewsItem } from "../components";
import {
  filterNews,
  paginateItems,
  calculateTotalPages,
  isCacheValid,
  sortNewsByDate,
  combineNewsResults,
} from "../lib/news.utils";


export default function NewsPage() {
    const [news, setNews] = React.useState<NewsItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const config = useConfig();
    const itemsPerPage = Number(config.news.pageSize) || 20;

    // --- ESTADOS PARA FILTROS ---
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
                if (cached && isCacheValid(cached.last_updated_at)) {
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
                                const combinedData = combineNewsResults(results).filter(isNewsItem);
                                const sortedData = sortNewsByDate(combinedData);
                                setNews(sortedData);
                                await supabase.from('asset_data_cache').upsert({ symbol: CACHE_KEY, data: combinedData, last_updated_at: new Date().toISOString() });
            } catch (error: unknown) {
                const msg = errorToString(error);
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
        return filterNews(news, symbolFilter, companyFilter);
    }, [news, symbolFilter, companyFilter]);
    
    const currentItems = React.useMemo(() => {
        return paginateItems(filteredNews, currentPage, itemsPerPage);
    }, [filteredNews, currentPage, itemsPerPage]);

    const totalPages = calculateTotalPages(filteredNews.length, itemsPerPage);

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
            <div className="container-wide stack-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="flex items-center gap-4 section-divider">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Newspaper className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="heading-2">Últimas Noticias Financieras</h1>
                            <p className="body text-muted-foreground">
                                Mantente al día con las últimas noticias del mercado y los eventos que pueden afectar tus inversiones.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* --- BARRA DE FILTROS --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                    <NewsFilters
                        symbolFilter={symbolFilter}
                        onSymbolFilterChange={setSymbolFilter}
                        companyFilter={companyFilter}
                        onCompanyFilterChange={setCompanyFilter}
                        onClearFilters={clearFilters}
                    />
                </motion.div>

                {loading ? (
                    <NewsSkeleton />
                ) : (
                    <>
                        <div className="min-h-fit"> 
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPage}
                                    className="grid-cards-3 gap-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {currentItems.map((item, index) => (
                                        <NewsCard key={`${item.newsURL}-${index}`} news={item} index={index} />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {currentItems.length === 0 && !loading && (
                            <div className="py-10 text-center body text-muted-foreground">No se encontraron noticias con los filtros aplicados.</div>
                        )}

                        {totalPages > 1 && (
                            <div>
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