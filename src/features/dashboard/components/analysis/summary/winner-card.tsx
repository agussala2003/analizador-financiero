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
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="w-8 h-8 text-primary" />
                        <div>
                            <CardTitle className="text-xl">Activo Destacado</CardTitle>
                            <CardDescription>
                                Análisis de {totalMetrics} métricas
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className={getRiskBadge(riskLevel).className}>
                        {getRiskBadge(riskLevel).label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="bg-background/80 p-4 rounded-lg border">
                    <h3 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {symbol} - {score} pts
                    </h3>
                    <p className="text-sm text-foreground/90 mb-2">
                        <strong>{companyName}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                        {recommendation}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
