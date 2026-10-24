import { NextResponse } from 'next/server';
import { generateSignal } from '@/lib/signalGenerator';
import { fetchDirectYahooData } from '@/lib/api';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbolParam = searchParams.get('symbol');
    let sentiment = parseFloat(searchParams.get('sentiment') || '0');

    try {
        if (symbolParam) {
            const cleanSymbol = symbolParam.toUpperCase();

            // If sentiment was not passed, dynamically derive from recent news
            if (sentiment === 0) {
                try {
                    const host = request.headers.get('host') || 'localhost:3000';
                    const protocol = host.includes('localhost') ? 'http' : 'https';
                    const newsRes = await fetch(`${protocol}://${host}/api/news?symbol=${cleanSymbol}&limit=6`, {
                        cache: 'no-store'
                    });
                    if (newsRes.ok) {
                        const articles = await newsRes.json();
                        if (Array.isArray(articles) && articles.length > 0) {
                            const scores = articles.map(a => {
                                if (a.sentiment?.label === 'Bullish') return a.sentiment.score || 0.6;
                                if (a.sentiment?.label === 'Bearish') return -(a.sentiment.score || 0.6);
                                return 0;
                            });
                            sentiment = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                        }
                    }
                } catch {
                    // Fallback to default neutral
                }
            }

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
