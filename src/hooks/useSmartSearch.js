// src/hooks/useSmartSearch.js
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { logger } from '../lib/logger';

/**
 * Hook para búsqueda inteligente con aprendizaje automático
 */
export function useSmartSearch(options = {}) {
  const {
    searchFunction,
    minQueryLength = 2,
    debounceMs = 300,
    maxSuggestions = 8,
    enableLearning = true,
    storageKey = 'smart_search_data'
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  
  const searchTimeout = useRef(null);
  const searchStats = useRef({
    queries: {},
    selections: {},
    categories: {},
    timeSpent: {}
  });

  // Cargar datos de búsqueda del localStorage
  useEffect(() => {
    if (enableLearning) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          searchStats.current = data.stats || searchStats.current;
          setSearchHistory(data.history || []);
          setPopularSearches(data.popular || []);
        }
      } catch (error) {
        logger.error('SEARCH_LOAD_ERROR', 'Error cargando datos de búsqueda', {
          error: error.message
        });
      }
    }
  }, [enableLearning, storageKey]);

  // Guardar datos de búsqueda
  const saveSearchData = useCallback(() => {
    if (!enableLearning) return;
    
    try {
      const data = {
        stats: searchStats.current,
        history: searchHistory.slice(0, 100), // Limitar historial
        popular: popularSearches.slice(0, 20), // Limitar populares
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error('SEARCH_SAVE_ERROR', 'Error guardando datos de búsqueda', {
        error: error.message
      });
    }
  }, [enableLearning, storageKey, searchHistory, popularSearches]);

  // Actualizar estadísticas de búsqueda
  const updateSearchStats = useCallback((query, category = 'general') => {
    if (!enableLearning) return;

    const normalizedQuery = query.toLowerCase().trim();
    
    // Actualizar conteo de queries
    searchStats.current.queries[normalizedQuery] = 
      (searchStats.current.queries[normalizedQuery] || 0) + 1;
    
    // Actualizar categorías
    searchStats.current.categories[category] = 
      (searchStats.current.categories[category] || 0) + 1;
    
    // Agregar al historial
    const historyEntry = {
      query: normalizedQuery,
      category,
      timestamp: new Date().toISOString()
    };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(entry => entry.query !== normalizedQuery);
      return [historyEntry, ...filtered];
    });
    
    // Actualizar búsquedas populares
    updatePopularSearches();
    
    logger.info('SEARCH_STATS_UPDATED', 'Estadísticas de búsqueda actualizadas', {
      query: normalizedQuery,
      category,
      totalQueries: Object.keys(searchStats.current.queries).length
    });
  }, [enableLearning, updatePopularSearches]);

  // Actualizar búsquedas populares basadas en frecuencia
  const updatePopularSearches = useCallback(() => {
    const queries = Object.entries(searchStats.current.queries)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([query, count]) => ({ query, count }));
    
    setPopularSearches(queries);
  }, []);

  // Generar sugerencias inteligentes
  const generateSuggestions = useCallback((currentQuery) => {
    if (!currentQuery || currentQuery.length < minQueryLength) {
      // Mostrar búsquedas populares cuando no hay query
      return popularSearches.slice(0, maxSuggestions).map(item => ({
        type: 'popular',
        text: item.query,
        count: item.count,
        icon: '🔥'
      }));
    }

    const queryLower = currentQuery.toLowerCase();
    const suggestions = [];

    // Búsquedas del historial que coincidan
    const historySuggestions = searchHistory
      .filter(entry => entry.query.includes(queryLower))
      .slice(0, 4)
      .map(entry => ({
        type: 'history',
        text: entry.query,
        timestamp: entry.timestamp,
        icon: '🕒'
      }));

    // Autocompletar basado en consultas populares
    const autocompleteSuggestions = popularSearches
      .filter(item => item.query.startsWith(queryLower) && item.query !== queryLower)
      .slice(0, 4)
      .map(item => ({
        type: 'autocomplete',
        text: item.query,
        count: item.count,
        icon: '💡'
      }));

    suggestions.push(...historySuggestions, ...autocompleteSuggestions);

    // Sugerencias de categorías relacionadas
    const categoryMatches = Object.keys(searchStats.current.categories)
      .filter(category => category.includes(queryLower))
      .slice(0, 2)
      .map(category => ({
        type: 'category',
        text: `Buscar en ${category}`,
        category,
        icon: '📁'
      }));

    suggestions.push(...categoryMatches);

    return suggestions.slice(0, maxSuggestions);
  }, [minQueryLength, maxSuggestions, popularSearches, searchHistory]);

  // Función de búsqueda con debounce
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchFunction || !searchQuery || searchQuery.length < minQueryLength) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const startTime = Date.now();

    try {
      const searchResults = await searchFunction(searchQuery);
      setResults(searchResults || []);
      
      // Actualizar estadísticas de tiempo
      const timeSpent = Date.now() - startTime;
      searchStats.current.timeSpent[searchQuery] = timeSpent;
      
      logger.info('SEARCH_COMPLETED', 'Búsqueda completada', {
        query: searchQuery,
        resultsCount: searchResults?.length || 0,
        timeSpent
      });
      
    } catch (error) {
      logger.error('SEARCH_ERROR', 'Error durante búsqueda', {
        query: searchQuery,
        error: error.message
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchFunction, minQueryLength]);

  // Manejar cambio en el query con debounce
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    
    // Generar sugerencias inmediatamente
    const newSuggestions = generateSuggestions(newQuery);
    setSuggestions(newSuggestions);
    
    // Debounce para la búsqueda real
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      performSearch(newQuery);
    }, debounceMs);
  }, [generateSuggestions, performSearch, debounceMs]);

  // Ejecutar búsqueda inmediatamente
  const executeSearch = useCallback((searchQuery = query, category = 'general') => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setQuery(searchQuery);
    updateSearchStats(searchQuery, category);
    performSearch(searchQuery);
    
    // Limpiar sugerencias después de búsqueda
    setSuggestions([]);
  }, [query, updateSearchStats, performSearch]);

  // Seleccionar sugerencia
  const selectSuggestion = useCallback((suggestion) => {
    const searchQuery = suggestion.text;
    
    // Actualizar estadísticas de selección
    if (enableLearning) {
      searchStats.current.selections[searchQuery] = 
        (searchStats.current.selections[searchQuery] || 0) + 1;
    }
    
    executeSearch(searchQuery, suggestion.category || suggestion.type);
    
    logger.info('SUGGESTION_SELECTED', 'Sugerencia seleccionada', {
      type: suggestion.type,
      text: suggestion.text
    });
  }, [enableLearning, executeSearch]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  }, []);

  // Guardar datos periódicamente
  useEffect(() => {
    const interval = setInterval(saveSearchData, 30000); // Cada 30 segundos
    return () => {
      clearInterval(interval);
      saveSearchData(); // Guardar al desmontar
    };
  }, [saveSearchData]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Métricas de búsqueda
  const searchMetrics = useMemo(() => {
    const totalQueries = Object.values(searchStats.current.queries).reduce((a, b) => a + b, 0);
    const totalSelections = Object.values(searchStats.current.selections).reduce((a, b) => a + b, 0);
    const avgTimeSpent = Object.values(searchStats.current.timeSpent).length > 0 ?
      Object.values(searchStats.current.timeSpent).reduce((a, b) => a + b, 0) / Object.values(searchStats.current.timeSpent).length :
      0;

    return {
      totalQueries,
      totalSelections,
      avgTimeSpent: Math.round(avgTimeSpent),
      topQueries: Object.entries(searchStats.current.queries)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([query, count]) => ({ query, count }))
    };
  }, []);

  return {
    // Estado
    query,
    results,
    suggestions,
    isSearching,
    searchHistory: searchHistory.slice(0, 10),
    popularSearches: popularSearches.slice(0, 8),
    
    // Acciones
    handleQueryChange,
    executeSearch,
    selectSuggestion,
    clearSearch,
    
    // Métricas
    searchMetrics,
    
    // Estado computado
    hasResults: results.length > 0,
    hasSuggestions: suggestions.length > 0,
    hasHistory: searchHistory.length > 0
  };
}

/**
 * Hook especializado para búsqueda de contenido financiero
 */
export function useFinancialSearch(searchAPI) {
  const searchFunction = useCallback(async (query) => {
    const results = [];
    
    try {
      // Buscar en múltiples categorías
      const [stocks, news, blogs] = await Promise.allSettled([
        searchAPI.searchStocks?.(query) || Promise.resolve([]),
        searchAPI.searchNews?.(query) || Promise.resolve([]),
        searchAPI.searchBlogs?.(query) || Promise.resolve([])
      ]);
      
      // Agregar resultados de acciones
      if (stocks.status === 'fulfilled' && stocks.value) {
        results.push(...stocks.value.map(item => ({
          ...item,
          category: 'stocks',
          type: 'stock'
        })));
      }
      
      // Agregar resultados de noticias
      if (news.status === 'fulfilled' && news.value) {
        results.push(...news.value.map(item => ({
          ...item,
          category: 'news',
          type: 'news'
        })));
      }
      
      // Agregar resultados de blogs
      if (blogs.status === 'fulfilled' && blogs.value) {
        results.push(...blogs.value.map(item => ({
          ...item,
          category: 'blogs',
          type: 'blog'
        })));
      }
      
      // Ordenar por relevancia (esto podría ser más sofisticado)
      return results.sort((a, b) => {
        // Priorizar acciones si el query parece un ticker
        if (/^[A-Z]{1,5}$/.test(query.toUpperCase())) {
          if (a.type === 'stock' && b.type !== 'stock') return -1;
          if (b.type === 'stock' && a.type !== 'stock') return 1;
        }
        
        // Luego por fecha o relevancia
        return (b.relevance || 0) - (a.relevance || 0);
      });
      
    } catch (error) {
      logger.error('FINANCIAL_SEARCH_ERROR', 'Error en búsqueda financiera', {
        query,
        error: error.message
      });
      return [];
    }
  }, [searchAPI]);

  return useSmartSearch({
    searchFunction,
    minQueryLength: 1, // Para tickers de una letra
    debounceMs: 400,
    maxSuggestions: 10,
    storageKey: 'financial_search_data'
  });
}

export default useSmartSearch;
