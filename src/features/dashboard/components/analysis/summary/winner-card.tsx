import { Award, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";

interface WinnerCardProps {
    symbol: string;
    companyName: string;
    score: number;
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
    totalMetrics: number;
}

const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    const styles = {
        low: { className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20', label: 'Bajo Riesgo' },
        medium: { className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20', label: 'Riesgo Moderado' },
        high: { className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20', label: 'Alto Riesgo' }
    };
    return styles[risk];
};

export default function WinnerCard({ symbol, companyName, score, recommendation, riskLevel, totalMetrics }: WinnerCardProps) {
    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        <div>
                            <CardTitle className="text-lg sm:text-xl">Activo Destacado</CardTitle>
                            <CardDescription className="text-xs sm:text-sm">
                                Análisis de {totalMetrics} métricas
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${getRiskBadge(riskLevel).className}`}>
                        {getRiskBadge(riskLevel).label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6">
                <div className="bg-background/80 p-3 sm:p-4 rounded-lg border">
                    <h3 className="font-bold text-base sm:text-lg text-primary mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        {symbol} - {score} pts
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/90 mb-2">
                        <strong>{companyName}</strong>
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                        {recommendation}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
