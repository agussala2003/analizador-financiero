import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import type { Config } from '../../types/config';
import type { StockNewsItem, UnifiedNewsItem, NewsCategory } from '../../types/news';

/**
 * Busca noticias específicas de un activo usando la API de FMP (vía proxy).
 */
export async function fetchStockNews(
    symbol: string,
    config: Config,
    page: number = 0,
    limit: number = 20
): Promise<StockNewsItem[]> {
    const { stockNews } = config.api.fmpProxyEndpoints;
    // Si no está configurado el endpoint (por caché vieja), usar fallback
    const endpoint = stockNews || 'stable/news/stock';

    try {
        const { data, error } = await supabase.functions.invoke('fmp-proxy', {
            body: {
                endpointPath: `${endpoint}?symbols=${symbol}&page=${page}&limit=${limit}`
            }
        });

        if (error) throw error;
        if (!data) return [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error fetching news';
        logger.error('NEWS_FETCH_ERROR', `Failed to fetch news for ${symbol}`, { error: msg });
        return [];
    }
}

/**
 * Obtiene noticias por categoría unificada.
 */
export async function fetchNewsByCategory(
    category: NewsCategory,
    config: Config,
    page: number = 0,
    limit: number = 20,
    searchQuery?: string
): Promise<UnifiedNewsItem[]> {
    // Base endpoints strings from config (assuming raw paths without -latest suffix in config for flexibility, 
    // but in previous step I added them as base or full paths?
    // In config.json I added "stockNews": "stable/news/stock", "pressReleases": "stable/news/press-releases", etc.
    // In code I did + '-latest' for feed.

    const baseEndpoints: Record<NewsCategory, string> = {
        'general': config.api.fmpProxyEndpoints.generalNews, // stable/news/general-latest
        'stock': config.api.fmpProxyEndpoints.stockNews, // stable/news/stock
        'crypto': config.api.fmpProxyEndpoints.cryptoNews, // stable/news/crypto
        'forex': config.api.fmpProxyEndpoints.forexNews, // stable/news/forex
        'press-releases': config.api.fmpProxyEndpoints.pressReleases, // stable/news/press-releases
        'fmp-articles': config.api.fmpProxyEndpoints.fmpArticles // stable/fmp-articles
    };

    let endpointPath = baseEndpoints[category];

    if (!endpointPath) {
        console.warn(`No endpoint configured for category: ${category}`);
        return [];
    }

    // Determine if we need search or feed
    let queryParams = `page=${page}&limit=${limit}`;

    // Categories that support symbol search
    const searchableCategories: NewsCategory[] = ['stock', 'crypto', 'forex', 'press-releases'];

    if (searchQuery && searchQuery.trim() !== '' && searchableCategories.includes(category)) {
        // Search Mode
        // Endpoint should be the base one (e.g. stable/news/stock) without -latest
        // My config.json has base paths for stock, crypto, forex, press-releases?
        // Let's check config.json again.
        // stockNews: "stable/news/stock" -> Searchable. Feed is "stable/news/stock-latest"? 
        // User Docs: 
        // Stock News API (Feed): stable/news/stock-latest
        // Search Stock News API: stable/news/stock?symbols=AAPL

        // So for Feed, I append "-latest" (except if it is already in config?)
        // In Types/Config I defined them.

        // Logic:
        // IF search: use base `endpointPath` + `?symbols=${searchQuery}`
        // IF no search: use base `endpointPath` + `-latest` (unless general/fmp-articles)

        queryParams += `&symbols=${encodeURIComponent(searchQuery.toUpperCase())}`;
    } else {
        // Feed Mode
        if (searchableCategories.includes(category)) {
            // Append -latest for these categories to get the general feed
            endpointPath += '-latest';
        }
    }

    try {
        const { data, error } = await supabase.functions.invoke('fmp-proxy', {
            body: {
                endpointPath: `${endpointPath}?${queryParams}`
            }
        });

        if (error) throw error;
        if (!data || !Array.isArray(data)) return [];

        return data.map((item: any) => mapToUnifiedItem(item, category));
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error fetching news';
        logger.error('NEWS_FETCH_ERROR', `Failed to fetch ${category} news`, { error: msg });
        return [];
    }
}

function mapToUnifiedItem(raw: any, category: NewsCategory): UnifiedNewsItem {
    // FMP articles have 'content' instead of 'text' and 'date' instead of 'publishedDate'
    const isFmpArticle = category === 'fmp-articles';
    const dateStr = isFmpArticle ? raw.date : raw.publishedDate;

    // Fallback image if missing
    let image = raw.image;
    if (!image && raw.symbol) {
        image = `https://images.financialmodelingprep.com/symbol/${raw.symbol}.jpg`;
    }

    return {
        id: raw.url || raw.link || `${dateStr}-${raw.title}`,
        title: raw.title,
        date: dateStr,
        url: raw.url || raw.link,
        image: image,
        source: raw.site || raw.publisher || 'FMP',
        summary: raw.text || raw.content || '', // text for most, content for articles
        symbol: raw.symbol || (raw.tickers?.split(':')[1]) || null, // Parse ticker from "NYSE:MRK" if needed
        category,
        grade: raw.newGrade // only for grade news if we mix them later
    };
}
