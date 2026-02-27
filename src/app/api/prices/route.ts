import { NextResponse } from 'next/server';
import { fetchDirectYahooData, fetchQuotes } from '@/lib/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const symbol = searchParams.get('symbol');
    const range = searchParams.get('range') || '1M';

    // 1. Handle Batch Quotes (for P&L updates)
    if (symbols) {
        try {
            const symbolList = symbols.split(',');
            const data = await fetchQuotes(symbolList);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
        }
    }

    // 2. Handle Single Symbol Chart Data (Existing logic)
    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // Map UI range to Yahoo API interval
        const intervalMap: Record<string, string> = {
            '1D': '5m',
            '5D': '15m',
            '1W': '30m',
            '1M': '1d',
            '3M': '1d',
            '6M': '1wk',
            '1Y': '1wk',
            '5Y': '1mo',
            'ALL': '1mo',
        };

        const interval = intervalMap[range] || '1d';

        // Use our robust direct fetch utility
        const data = await fetchDirectYahooData(symbol, range, interval);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Price API Error (${symbol}):`, error.message);
        return NextResponse.json(
            { error: 'Failed to fetch market data', details: error.message },
            { status: 500 }
        );
    }
}
