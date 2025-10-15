// src/features/asset-detail/components/ratings/asset-grades-tab.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus, Building2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { SuspenseFallback } from '../../../../components/suspense';
import { useConfig } from '../../../../hooks/use-config';
import { supabase } from '../../../../lib/supabase';
import { logger } from '../../../../lib/logger';
import { cn } from '../../../../lib/utils';

/**
 * Interfaz para una calificación individual de un activo.
 */
interface StockGrade {
  symbol: string;
  date: string;
  gradingCompany: string;
  previousGrade: string;
  newGrade: string;
  action: 'upgrade' | 'downgrade' | 'maintain' | 'initiated' | 'reiterated';
}

/**
 * Props para el componente AssetGradesTab.
 * @property symbol - Símbolo del activo
 */
interface AssetGradesTabProps {
  symbol: string;
}

/**
 * Interfaz para los datos crudos de la API (puede venir en diferentes formatos)
 */
interface RawGradeData {
  symbol?: string;
  date?: string;
  publishedDate?: string;
  gradingCompany?: string;
  newsPublisher?: string;
  previousGrade?: string;
  oldGrade?: string;
  newGrade?: string;
  action?: string;
}

/**
 * Obtiene las calificaciones de un activo desde la API a través del proxy de Supabase.
 * Implementa cache para reducir llamadas a la API.
 * 
 * @param symbol - Símbolo del activo
 * @param endpoint - Endpoint configurado en config.json
 * @returns Array de calificaciones
 */
async function fetchStockGrades(
  symbol: string,
  endpoint: string
): Promise<StockGrade[]> {
  const CACHE_KEY = `stock_grades_${symbol}`;
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  try {
    // 1. Intentar obtener datos del cache
    const { data: cached } = await supabase
      .from('asset_data_cache')
      .select('data, last_updated_at')
      .eq('symbol', CACHE_KEY)
      .single();

    // 2. Si hay cache válido, usarlo
    if (cached?.data && cached?.last_updated_at) {
      const cacheAge = Date.now() - new Date(String(cached.last_updated_at)).getTime();
      if (cacheAge < CACHE_DURATION) {
        const cachedGrades = Array.isArray(cached.data) ? cached.data : [];
        await logger.info('FETCH_STOCK_GRADES_CACHE_HIT', 'Using cached grades', {
          symbol,
          gradesCount: cachedGrades.length,
          cacheAge: Math.round(cacheAge / 1000 / 60), // minutos
        });
        return cachedGrades as StockGrade[];
      }
    }

    // 3. Obtener datos frescos de la API
    const endpointPath = `${endpoint}?symbol=${symbol}`;
    const response = await supabase.functions.invoke('fmp-proxy', {
      body: { endpointPath },
    });

    if (response.error) {
      const errorMessage = response.error instanceof Error 
        ? response.error.message 
        : String(response.error);
      
      await logger.error('FETCH_STOCK_GRADES_ERROR', 'Supabase function error', {
        symbol,
        endpointPath,
        errorMessage,
        errorDetails: JSON.stringify(response.error),
      });
      
      // Si hay error pero tenemos cache antiguo, usarlo como fallback
      if (cached?.data && Array.isArray(cached.data)) {
        await logger.warn('FETCH_STOCK_GRADES_FALLBACK', 'Using stale cache due to API error', {
          symbol,
        });
        return cached.data as StockGrade[];
      }
      
      throw response.error;
    }

    // 4. Normalizar y mapear datos
    const data = response.data as unknown;
    if (!data || !Array.isArray(data)) {
      await logger.warn('FETCH_STOCK_GRADES_EMPTY', 'No grades data received', {
        symbol,
        endpointPath,
        dataType: typeof data,
      });
      return [];
    }

    const grades: StockGrade[] = (data as RawGradeData[]).map((item) => ({
      symbol: item.symbol ?? symbol,
      date: item.publishedDate ?? item.date ?? new Date().toISOString(),
      gradingCompany: item.gradingCompany ?? item.newsPublisher ?? 'Unknown',
      previousGrade: item.previousGrade ?? item.oldGrade ?? '-',
      newGrade: item.newGrade ?? '-',
      action: ((item.action ?? 'maintain').toLowerCase() as StockGrade['action']),
    }));

    // 5. Guardar en cache
    await supabase
      .from('asset_data_cache')
      .upsert({
        symbol: CACHE_KEY,
        data: grades,
        last_updated_at: new Date().toISOString(),
      });

    await logger.info('FETCH_STOCK_GRADES_SUCCESS', 'Stock grades fetched and cached', {
      symbol,
      endpointPath,
      gradesCount: grades.length,
    });

    return grades;
  } catch (error) {
    await logger.error('FETCH_STOCK_GRADES_ERROR', 'Error fetching stock grades', {
      symbol,
      endpoint,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Devuelve el icono apropiado según la acción de calificación.
 */
function getActionIcon(action: StockGrade['action']) {
  switch (action) {
    case 'upgrade':
      return <TrendingUp className="h-4 w-4" />;
    case 'downgrade':
      return <TrendingDown className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
}

/**
 * Devuelve la variante de badge según la acción.
 */
function getActionVariant(
  action: StockGrade['action']
): 'default' | 'destructive' | 'secondary' {
  switch (action) {
    case 'upgrade':
      return 'default';
    case 'downgrade':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Devuelve el texto de la acción en español.
 */
function getActionText(action: StockGrade['action']): string {
  const actions: Record<StockGrade['action'], string> = {
    upgrade: 'Mejora',
    downgrade: 'Rebaja',
    maintain: 'Mantiene',
    initiated: 'Inicia Cobertura',
    reiterated: 'Reitera',
  };
  return actions[action] ?? action;
}

/**
 * Traduce y formatea los grados de calificación al español.
 */
function translateGrade(grade: string): string {
  const gradeMap: Record<string, string> = {
    // Grados principales
    'Buy': 'Comprar',
    'Strong Buy': 'Compra Fuerte',
    'Outperform': 'Superar',
    'Overweight': 'Sobreponderado',
    'Hold': 'Mantener',
    'Neutral': 'Neutral',
    'Equal Weight': 'Peso Igual',
    'Equal-Weight': 'Peso Igual',
    'Market Perform': 'Performance de Mercado',
    'Sector Perform': 'Performance del Sector',
    'Underperform': 'Bajo Rendimiento',
    'Underweight': 'Subponderado',
    'Sell': 'Vender',
    'Strong Sell': 'Venta Fuerte',
    'Reduce': 'Reducir',
    
    // Variaciones
    'In-Line': 'En Línea',
    'Peer Perform': 'Performance de Pares',
    'Market Weight': 'Peso de Mercado',
    'Sector Weight': 'Peso del Sector',
    'Positive': 'Positivo',
    'Negative': 'Negativo',
    'Cautious': 'Cauteloso',
    'Speculative Buy': 'Compra Especulativa',
    
    // Otros
    '-': '-',
    'N/A': 'N/D',
    'Unknown': 'Desconocido',
  };

  // Buscar coincidencia exacta
  if (gradeMap[grade]) {
    return gradeMap[grade];
  }

  // Buscar coincidencia parcial (case insensitive)
  const lowerGrade = grade.toLowerCase();
  for (const [key, value] of Object.entries(gradeMap)) {
    if (lowerGrade === key.toLowerCase()) {
      return value;
    }
  }

  // Si no hay traducción, devolver el original
  return grade;
}

/**
 * Obtiene una explicación simple del grado para usuarios no expertos.
 */
function getGradeExplanation(grade: string): string {
  const normalized = grade.toLowerCase().trim();
  
  // Compra fuerte
  if (normalized.includes('strong buy') || normalized.includes('compra fuerte')) {
    return '💪 Los analistas creen firmemente que la acción va a subir. Momento ideal para comprar.';
  }
  
  // Compra
  if (normalized.includes('buy') || normalized.includes('comprar')) {
    return '👍 Se espera que la acción suba de precio. Buena oportunidad de compra.';
  }
  
  // Superar / Sobreponderado
  if (normalized.includes('outperform') || normalized.includes('overweight') || 
      normalized.includes('superar') || normalized.includes('sobreponderado')) {
    return '📈 Se espera que rinda mejor que el promedio del mercado. Recomendable comprar.';
  }
  
  // Mantener / Neutral / Peso igual
  if (normalized.includes('hold') || normalized.includes('neutral') || 
      normalized.includes('equal') || normalized.includes('mantener') ||
      normalized.includes('peso igual') || normalized.includes('market perform')) {
    return '⏸️ Conserva tus acciones si ya las tienes, pero no es urgente comprar más ahora.';
  }
  
  // Bajo rendimiento / Subponderado
  if (normalized.includes('underperform') || normalized.includes('underweight') ||
      normalized.includes('bajo rendimiento') || normalized.includes('subponderado')) {
    return '📉 Se espera que rinda peor que el promedio. Considera no comprar o vender.';
  }
  
  // Vender
  if (normalized.includes('sell') || normalized.includes('vender') || normalized.includes('reduce')) {
    return '⚠️ Los analistas recomiendan vender. Se espera que el precio baje.';
  }
  
  // Venta fuerte
  if (normalized.includes('strong sell') || normalized.includes('venta fuerte')) {
    return '🚨 Recomendación fuerte de vender. Alta probabilidad de caída en el precio.';
  }
  
  // Default
  return '📊 Los analistas están evaluando esta acción.';
}

/**
 * Obtiene el color apropiado según el grado (para mejor visualización).
 */
function getGradeColor(grade: string): string {
  const normalized = grade.toLowerCase().trim();
  
  // Verde oscuro - Compra fuerte
  if (normalized.includes('strong buy') || normalized.includes('compra fuerte')) {
    return 'text-green-600 dark:text-green-400';
  }
  
  // Verde - Compra / Outperform / Overweight
  if (normalized.includes('buy') || normalized.includes('comprar') ||
      normalized.includes('outperform') || normalized.includes('overweight') ||
      normalized.includes('superar') || normalized.includes('sobreponderado')) {
    return 'text-green-500 dark:text-green-400';
  }
  
  // Amarillo - Hold / Neutral
  if (normalized.includes('hold') || normalized.includes('neutral') || 
      normalized.includes('equal') || normalized.includes('mantener') ||
      normalized.includes('market perform')) {
    return 'text-yellow-600 dark:text-yellow-400';
  }
  
  // Naranja - Underperform / Underweight
  if (normalized.includes('underperform') || normalized.includes('underweight') ||
      normalized.includes('bajo rendimiento') || normalized.includes('subponderado')) {
    return 'text-orange-500 dark:text-orange-400';
  }
  
  // Rojo - Sell
  if (normalized.includes('sell') || normalized.includes('vender') || normalized.includes('reduce')) {
    return 'text-red-500 dark:text-red-400';
  }
  
  // Default
  return 'text-foreground';
}

/**
 * Formatea la fecha en formato legible.
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Componente que muestra las calificaciones de analistas para un activo.
 * Incluye historial de upgrades, downgrades y cambios de calificación.
 * Ahora con paginación y explicaciones para usuarios no expertos.
 * 
 * @example
 * ```tsx
 * <AssetGradesTab symbol="AAPL" />
 * ```
 */
export function AssetGradesTab({ symbol }: AssetGradesTabProps) {
  const config = useConfig();
  const endpoint = config.api.fmpProxyEndpoints.stockGrades;
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: grades, isLoading, isError } = useQuery<StockGrade[]>({
    queryKey: ['stockGrades', symbol],
    queryFn: () => fetchStockGrades(symbol, endpoint),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });

  // Calcular paginación
  const totalPages = grades ? Math.ceil(grades.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGrades = grades?.slice(startIndex, endIndex) ?? [];

  if (isLoading) {
    return <SuspenseFallback type="page" message="Cargando calificaciones..." />;
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Error al cargar las calificaciones. Intenta nuevamente más tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!grades || grades.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No hay calificaciones disponibles para este activo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calificaciones de Analistas</CardTitle>
              <CardDescription>
                Historial de cambios en las calificaciones de {symbol} por parte de
                firmas analistas
              </CardDescription>
            </div>
            {grades && grades.length > itemsPerPage && (
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(endIndex, grades.length)} de {grades.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedGrades.map((grade, index) => (
              <div
                key={`${grade.date}-${grade.gradingCompany}-${index}`}
                className={cn(
                  'flex flex-col gap-3 p-4 rounded-lg border',
                  'hover:bg-accent/50 transition-colors'
                )}
              >
                {/* Header con empresa y acción */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{grade.gradingCompany}</span>
                  </div>
                  <Badge variant={getActionVariant(grade.action)}>
                    <span className="flex items-center gap-1">
                      {getActionIcon(grade.action)}
                      {getActionText(grade.action)}
                    </span>
                  </Badge>
                </div>

                {/* Fecha */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(grade.date)}</span>
                </div>

                {/* Cambio de calificación con colores */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  {grade.previousGrade && grade.previousGrade !== '-' && (
                    <>
                      <span className="text-muted-foreground">Cambió de:</span>
                      <span className={cn('font-semibold', getGradeColor(grade.previousGrade))}>
                        {translateGrade(grade.previousGrade)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                    </>
                  )}
                  <span className="text-muted-foreground">
                    {grade.previousGrade && grade.previousGrade !== '-' ? 'a:' : 'Calificación:'}
                  </span>
                  <span className={cn('font-bold text-base', getGradeColor(grade.newGrade))}>
                    {translateGrade(grade.newGrade)}
                  </span>
                </div>

                {/* Explicación simple para no expertos */}
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                  <p className="text-muted-foreground leading-relaxed">
                    {getGradeExplanation(grade.newGrade)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Controles de paginación */}
          {grades && grades.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
