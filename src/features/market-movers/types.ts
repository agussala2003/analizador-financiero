/**
 * Represents a stock with significant market movement.
 * Used for displaying gainers, losers, and most active stocks.
 * 
 * @property symbol - Stock ticker symbol (e.g., 'AAPL')
 * @property name - Full company name
 * @property price - Current stock price in USD
 * @property change - Price change in USD since previous close
 * @property changesPercentage - Percentage change since previous close
 */
export interface MarketMover {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changesPercentage: number;
}
