import { useState, useEffect, useMemo } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { supabase } from '../lib/supabase';
import NewsCard from '../components/news/NewsCard';
import { useResponsiveValue } from '../hooks/useResponsiveValuse';
import PaginationControls from '../components/news/PaginationControls';
import { Loader } from '../components/news/Loader';
import { logger } from '../lib/logger';

const NewsPage = () => {
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); 

  // Paginación adaptativa
  const itemsPerPage = useResponsiveValue({ mobile: 4, tablet: 6, desktop: 8 }, 8);

    useEffect(() => {
    const fetchAllNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Definimos los endpoints que queremos llamar
        const limit = 10;
        const endpoints = [`stable/price-target-latest-news?page=0&limit=${limit}`, `stable/grades-latest-news?page=0&limit=${limit}`];

        // 2. Invocamos la Edge Function para cada endpoint en paralelo
        const promises = endpoints.map(endpointPath => 
          supabase.functions.invoke('fmp-proxy', {
            body: { endpointPath }
          })
        );
        
        const results = await Promise.all(promises);

        // 3. Verificamos si alguna de las llamadas falló
        for (const result of results) {
          if (result.error) {
            // Si una falla, lanzamos el error para que lo capture el catch
            throw result.error; 
          }
        }
        
        // 4. Extraemos los datos de cada respuesta
        const [priceTargetNews, gradesNews] = results.map(result => result.data);
        
        // --- El resto de la lógica es idéntica ---
        const combinedNews = [
          ...(Array.isArray(priceTargetNews) ? priceTargetNews : []),
          ...(Array.isArray(gradesNews) ? gradesNews : [])
        ];
        
        const uniqueNews = Array.from(new Map(combinedNews.map(item => [item.newsURL, item])).values());

        uniqueNews.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
        logger.info('NEWS_FETCHED', `Fetched and combined news items: ${uniqueNews.length} unique items`);
        setAllNews(uniqueNews);

      } catch (err) {
        logger.error('NEWS_FETCH_FAILED', 'Failed to fetch news items', { errorMessage: err.message });
        console.error("Error invoking news function:", err);
        setError("No se pudieron cargar las noticias.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  const { currentNewsItems, totalPages } = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = allNews.slice(startIndex, endIndex);
    const totalPagesCount = Math.ceil(allNews.length / itemsPerPage);
    return { currentNewsItems: currentItems, totalPages: totalPagesCount };
  }, [currentPage, itemsPerPage, allNews]);
  
  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  return (
    <div aria-busy={loading ? "true" : "false"} aria-live="polite" className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow">
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6 md:mb-8">
            Últimas Noticias Financieras
          </h1>

          {loading && <Loader />}
          {error && <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">{error}</div>}
          
          {!loading && !error && allNews.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentNewsItems.map((item, index) => (
                  <NewsCard key={`${item.newsURL}-${index}`} newsItem={item} />
                ))}
              </div>
              
              <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}

          {!loading && !error && allNews.length === 0 && (
            <p className="text-center text-gray-400 mt-10 p-6 bg-gray-800/50 rounded-lg">No se encontraron noticias.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;