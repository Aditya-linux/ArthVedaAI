
interface Candle {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface PriceData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
    history: Candle[];
}

const CACHE: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function fetchDirectYahooData(symbol: string, range: string = '1M', interval: string = '1d'): Promise<PriceData> {
    const cacheKey = `${symbol}-${range}-${interval}`;

    if (CACHE[cacheKey] && (Date.now() - CACHE[cacheKey].timestamp < CACHE_TTL)) {
        return CACHE[cacheKey].data;
    }

    const queryUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

    try {
        const response = await fetch(queryUrl);
        if (!response.ok) {
            throw new Error(`Yahoo API error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const result = json.chart.result[0];

        if (!result) {
            throw new Error('No data found');
        }

        const meta = result.meta;
        const quotes = result.indicators.quote[0];
        const timestamps = result.timestamp;

        if (!timestamps || !quotes) {
            throw new Error('Invalid data structure');
        }

        const history: Candle[] = timestamps.map((t: number, i: number) => ({
            time: new Date(t * 1000).toISOString().split('T')[0],
            open: quotes.open[i] || 0,
            high: quotes.high[i] || 0,
            low: quotes.low[i] || 0,
            close: quotes.close[i] || 0,
            volume: quotes.volume[i] || 0,
        })).filter((c: Candle) => c.close !== 0 && c.open !== 0); // Filter bad data

        const latest = history[history.length - 1];
        const prev = history[history.length - 2] || history[0];

        const change = latest.close - (prev ? prev.close : latest.open);
        const changePercent = (change / (prev ? prev.close : latest.open)) * 100;

        const data: PriceData = {
            symbol: meta.symbol,
            name: meta.symbol, // Yahoo doesn't guarantee full name in chart endpoint easily
            price: latest.close,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            high: latest.high,
            low: latest.low,
            volume: latest.volume,
            history
        };

        CACHE[cacheKey] = { data, timestamp: Date.now() };
        return data;

    } catch (error: any) {
        console.error(`Direct fetch error for ${symbol}:`, error.message);
        throw error;
    }
}

export async function fetchQuotes(symbols: string[]): Promise<{ symbol: string; price: number }[]> {
    if (!symbols.length) return [];

    // v7 endpoint is blocked or unreliable (401). 
    // Fallback to fetching chart data for each symbol in parallel using v8 endpoint.
    // This is less efficient but more reliable.

    try {
        const promises = symbols.map(async (symbol) => {
            try {
                // Fetch just 1 day of data to get the latest close
                const data = await fetchDirectYahooData(symbol, '1d', '15m');
                return { symbol, price: data.price };
            } catch (error) {
                console.error(`Failed to fetch quote for ${symbol}`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter((r): r is { symbol: string; price: number } => r !== null);

    } catch (error) {
        console.error('Quote fetch error:', error);
        return [];
    }
}
