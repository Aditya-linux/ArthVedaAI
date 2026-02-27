import { NextResponse } from 'next/server';
import { generateSignal } from '@/lib/signalGenerator';
import { fetchDirectYahooData } from '@/lib/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get('symbol');
    const sentiment = parseFloat(searchParams.get('sentiment') || '0');

    try {
        if (symbolParam) {
            // Single signal with real data
            const cleanSymbol = symbolParam.toUpperCase();
            // Fetch 6 months of daily data for strong indicators
            const data = await fetchDirectYahooData(cleanSymbol, '6mo', '1d');
            const signal = generateSignal(cleanSymbol, data.history, sentiment);
            return NextResponse.json(signal);
        }

        return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
    } catch (error) {
        console.error('Signal generation error:', error);
        return NextResponse.json({ error: 'Signal generation failed' }, { status: 500 });
    }
}
