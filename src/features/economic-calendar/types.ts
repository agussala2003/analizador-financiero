export interface EconomicEvent {
    date: string;
    country: string;
    event: string;
    currency: string;
    previous: number | null;
    estimate: number | null;
    actual: number | null;
    change: number | null;
    impact: 'Low' | 'Medium' | 'High' | 'None';
    changePercentage: number | null;
    unit: string | null;
}
