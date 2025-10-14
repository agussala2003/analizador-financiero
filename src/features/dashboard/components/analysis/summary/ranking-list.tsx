import { Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";

interface RankingListProps {
    rankedAssets: { asset: { symbol: string; companyName: string }; score: number }[];
}

export default function RankingList({ rankedAssets }: RankingListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Ranking General
                </CardTitle>
                <CardDescription>
                    Clasificación basada en el análisis integral
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {rankedAssets.map((item, index) => (
                        <div 
                            key={item.asset.symbol} 
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                index === 0 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:bg-muted/30'
                            } transition-colors`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                    index === 0 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="font-bold">{item.asset.symbol}</div>
                                    <div className="text-xs text-muted-foreground">{item.asset.companyName}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-primary">{item.score}</div>
                                <div className="text-xs text-muted-foreground">pts</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
