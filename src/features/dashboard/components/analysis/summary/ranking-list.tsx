import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";

interface RankingListProps {
    rankedAssets: { asset: { symbol: string; companyName: string }; score: number }[];
}

export default function RankingList({ rankedAssets }: RankingListProps) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Ranking General
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Clasificación basada en el análisis integral
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                    {rankedAssets.map((item, index) => (
                        <div 
                            key={item.asset.symbol} 
                            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
                                index === 0 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:bg-muted/30'
                            } transition-colors`}
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm ${
                                    index === 0 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-sm sm:text-base">{item.asset.symbol}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">{item.asset.companyName}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg sm:text-xl font-bold text-primary">{item.score}</div>
                                <div className="text-xs text-muted-foreground">pts</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
