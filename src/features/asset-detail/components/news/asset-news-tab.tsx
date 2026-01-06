import { useQuery } from '@tanstack/react-query';
import { useConfig } from '../../../../hooks/use-config';
import { fetchStockNews } from '../../../../services/api/news-api';
import { Card, CardContent } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Badge } from '../../../../components/ui/badge';
import { CalendarDays, ExternalLink, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AssetNewsTabProps {
    symbol: string;
}

export function AssetNewsTab({ symbol }: AssetNewsTabProps) {
    const config = useConfig();

    const { data: news, isLoading } = useQuery({
        queryKey: ['asset-news', symbol, config],
        queryFn: () => fetchStockNews(symbol, config!, 0, 20),
        enabled: !!config && !!symbol,
        staleTime: 1000 * 60 * 15, // 15 minutos
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-full">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!news || news.length === 0) {
        return (
            <Card className="flex items-center justify-center h-48 sm:h-64">
                <div className="text-center px-4">
                    <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-muted-foreground">
                        No se encontraron noticias recientes para {symbol}.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
            {news.map((item, index) => (
                <Card key={`${item.url}-${index}`} className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row h-full">
                            {/* Imagen */}
                            <div className="w-full sm:w-1/3 h-48 sm:h-auto relative overflow-hidden group">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.financialmodelingprep.com/symbol/' + item.symbol + '.jpg'; // Fallback
                                        target.onerror = null; // Prevent infinite loop
                                    }}
                                />
                                <div className="absolute top-2 left-2">
                                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                                        {item.site}
                                    </Badge>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <CalendarDays className="w-3 h-3" />
                                        <span>
                                            {format(new Date(item.publishedDate), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                                        </span>
                                    </div>

                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group"
                                    >
                                        <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                    </a>

                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                        {item.text}
                                    </p>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs font-medium text-primary hover:underline gap-1"
                                    >
                                        Leer más <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
