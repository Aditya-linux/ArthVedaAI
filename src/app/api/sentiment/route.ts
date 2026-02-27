import { NextResponse } from 'next/server';
import { analyzeSentiment, aggregateSentiment } from '@/lib/sentimentEngine';

export async function POST(request: Request) {
    try {
        const { text, texts } = await request.json();

        if (texts && Array.isArray(texts)) {
            const results = texts.map((t: string) => analyzeSentiment(t));
            const aggregate = aggregateSentiment(results);
            return NextResponse.json({ results, aggregate });
        }

        if (text) {
            const result = analyzeSentiment(text);
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Provide "text" or "texts" in body' }, { status: 400 });
    } catch (error) {
        console.error('Sentiment error:', error);
        return NextResponse.json({ error: 'Sentiment analysis failed' }, { status: 500 });
    }
}
