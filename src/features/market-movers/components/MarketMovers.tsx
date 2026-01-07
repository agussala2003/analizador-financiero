import { useEffect, useState } from 'react';
import { fetchGainers, fetchLosers, fetchActives } from '../services/market-movers-service';
import { MarketMover } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import PaginationDemo from '../../../components/ui/pagination-demo';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, Activity, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';

type TabType = 'gainers' | 'losers' | 'actives';
type SortConfig = { key: keyof MarketMover | null; direction: 'asc' | 'desc' };

export const MarketMovers = () => {
    const [activeTab, setActiveTab] = useState<TabType>('gainers');
    const [data, setData] = useState<MarketMover[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const itemsPerPage = 10;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                let result: MarketMover[] = [];
                switch (activeTab) {
                    case 'gainers':
                        result = await fetchGainers();
                        break;
                    case 'losers':
                        result = await fetchLosers();
                        break;
                    case 'actives':
                        result = await fetchActives();
                        break;
                }
                setData(result);
                setCurrentPage(1);
                setSortConfig({ key: null, direction: 'asc' }); // Reset sort on tab change
            } catch (err) {
                setError('Error al cargar datos del mercado.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab]);

    const handleSort = (key: keyof MarketMover) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatPercentage = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

    const getBadgeVariant = (val: number): "default" | "secondary" | "destructive" | "outline" => {
        if (val > 0) return 'default';
        if (val < 0) return 'destructive';
        return 'secondary';
    };

    const renderSortIcon = (columnKey: keyof MarketMover) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
    };

    const SortableHeader = ({ label, columnKey, align = "left" }: { label: string, columnKey: keyof MarketMover, align?: "left" | "right" }) => (
        <TableHead className={align === "right" ? "text-right" : ""}>
            <Button variant="ghost" onClick={() => handleSort(columnKey)} className={`hover:bg-transparent px-0 font-bold ${align === "right" ? "ml-auto" : ""}`}>
                {label}
                {renderSortIcon(columnKey)}
            </Button>
        </TableHead>
    );

    const renderTable = (items: MarketMover[]) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <SortableHeader label="Símbolo" columnKey="symbol" />
                        <SortableHeader label="Nombre" columnKey="name" />
                        <SortableHeader label="Precio" columnKey="price" align="right" />
                        <SortableHeader label="Cambio" columnKey="change" align="right" />
                        <SortableHeader label="% Cambio" columnKey="changesPercentage" align="right" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.symbol}>
                            <TableCell className="font-medium">{item.symbol}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={item.name}>{item.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className={`text-right ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge variant={getBadgeVariant(item.changesPercentage)} className={item.changesPercentage > 0 ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' : ''}>
                                    {formatPercentage(item.changesPercentage)}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Movimientos del Mercado</CardTitle>
                <CardDescription>Visualiza los mayores ganadores, perdedores y las acciones más activas del día.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="gainers" value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="gainers" className="flex gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Ganadores</TabsTrigger>
                        <TabsTrigger value="losers" className="flex gap-2"><TrendingDown className="w-4 h-4 text-red-500" /> Perdedores</TabsTrigger>
                        <TabsTrigger value="actives" className="flex gap-2"><Activity className="w-4 h-4 text-blue-500" /> Más Activos</TabsTrigger>
                    </TabsList>

                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : error ? (
                        <div className="text-destructive p-4 text-center">{error}</div>
                    ) : (
                        <>
                            {renderTable(currentItems)}
                            <div className="flex justify-center mt-6">
                                <PaginationDemo
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    );
};
