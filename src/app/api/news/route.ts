import { NextResponse } from 'next/server';
import { analyzeSentiment } from '@/lib/sentimentEngine';

// Generate realistic financial news
function generateMockNews(symbol: string) {
    const companies: Record<string, string> = {
        'AAPL': 'Apple', 'GOOGL': 'Alphabet', 'MSFT': 'Microsoft', 'AMZN': 'Amazon',
        'TSLA': 'Tesla', 'NVDA': 'NVIDIA', 'META': 'Meta', 'JPM': 'JPMorgan',
        'V': 'Visa', 'WMT': 'Walmart', 'BTC-USD': 'Bitcoin', 'ETH-USD': 'Ethereum',
        'SOL-USD': 'Solana', 'BNB-USD': 'BNB', 'XRP-USD': 'XRP',
    };

    const company = companies[symbol] || symbol;

    const newsTemplates = [
        { headline: `${company} Shares Surge After Strong Quarterly Earnings Beat Expectations`, summary: `${company} reported earnings that exceeded expectations, with revenue growth of 15% year-over-year. The company's strong performance was driven by expansion in key markets and successful product launches.`, source: 'Bloomberg' },
        { headline: `Analysts Upgrade ${company} Stock Amid Bullish Growth Outlook`, summary: `Multiple Wall Street analysts have upgraded their price targets for ${company}, citing strong momentum and favorable market positioning. The stock rally continues to drive bullish sentiment.`, source: 'Reuters' },
        { headline: `${company} Announces Major Partnership Deal Worth $2B`, summary: `${company} has entered a strategic partnership that could accelerate its innovation pipeline. The acquisition is expected to drive long-term growth and expand its market presence.`, source: 'CNBC' },
        { headline: `${company} Faces Regulatory Headwinds as Investigation Widens`, summary: `Regulators are expanding their investigation into ${company}'s practices, raising concerns about potential penalties. The warning signs have sent shares lower in early trading.`, source: 'WSJ' },
        { headline: `Market Volatility: ${company} Stock Drops on Economic Fear`, summary: `${company} shares declined as macro concerns including recession risk and inflation fears weighed on the broader market. Investors remain cautious amid the correction.`, source: 'Financial Times' },
        { headline: `${company} Reports Record Revenue Driven by AI Innovation`, summary: `${company} posted record quarterly revenue, propelled by its investment in AI technology and strong growth in its cloud computing division.`, source: 'Bloomberg' },
        { headline: `Key Technical Levels to Watch for ${company} Trading`, summary: `Technical analysis suggests ${company} is approaching a breakout above key resistance. Momentum indicators show uptrend strength with RSI approaching overbought levels.`, source: 'MarketWatch' },
        { headline: `${company} Layoffs Signal Cost-Cutting Strategy Amid Downturn`, summary: `${company} announced significant layoffs as part of a restructuring plan. The cost-cutting move comes amid a broader industry slump and declining profit margins.`, source: 'Yahoo Finance' },
        { headline: `${company} Dividend Increase Signals Confidence in Future Growth`, summary: `${company} announced a 10% increase in its quarterly dividend, reflecting management's confidence in the company's long-term expansion and profitability.`, source: 'Barron\'s' },
        { headline: `Insider Trading: ${company} Executive Sells $5M in Shares`, summary: `A senior ${company} executive sold a significant block of shares, raising questions among investors about the company's near-term outlook.`, source: 'SEC Filings' },
        { headline: `${company} Stock: Why It's a Top Pick for 2026`, summary: `Analysts highlight ${company} as a top pick for the year, citing strong fundamentals, positive growth trajectory, and expanding market share in key segments.`, source: 'Motley Fool' },
        { headline: `${company} Under Pressure as Competition Intensifies`, summary: `${company} faces mounting competitive pressure from emerging rivals. Market share erosion and pricing weakness have led to a cautious outlook among investors.`, source: 'Forbes' },
    ];

    const editorialImages = [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', // Financial chart surge
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', // Wall Street market graph
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Corporate skyscraper deal
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80', // Regulatory gavel / law
        'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80', // Market volatility / trading terminal
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', // AI Silicon & chips
        'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80', // Candlestick technical breakout
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', // Modern corporate boardroom
        'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=80', // Dividend / capital growth
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', // Executive insider business
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80', // Analytics / top pick
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', // Competitive data networks
    ];

    const now = Date.now();
    return newsTemplates.map((template, i) => {
        const sentiment = analyzeSentiment(template.headline + ' ' + template.summary);
        return {
            id: `news-${symbol}-${i}`,
            headline: template.headline,
            summary: template.summary,
            source: template.source,
            url: '#',
            image: editorialImages[i % editorialImages.length],
            datetime: now - i * 3600000 * (1 + Math.random() * 4),
            relatedSymbols: [symbol],
            sentiment,
        };
    });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'AAPL';
    const limit = parseInt(searchParams.get('limit') || '12');

    try {
        // Try Finnhub if API key is present
        const apiKey = process.env.FINNHUB_API_KEY;
        if (apiKey && !symbol.includes('-USD') && !symbol.includes('=X')) {
            try {
                const now = Math.floor(Date.now() / 1000);
                const from = now - 7 * 24 * 3600;
                const resp = await fetch(
                    `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${new Date(from * 1000).toISOString().split('T')[0]}&to=${new Date(now * 1000).toISOString().split('T')[0]}&token=${apiKey}`,
                    { next: { revalidate: 300 } }
                );

                if (resp.ok) {
                    const data = await resp.json();
                    if (Array.isArray(data) && data.length > 0) {
                        // Use Promise.all to fetch sentiment for all articles in parallel
                        const articles = await Promise.all(data.slice(0, limit).map(async (item: Record<string, unknown>, i: number) => {
                            const text = `${item.headline as string} ${item.summary as string}`;
                            let sentiment;

                            // Try FinBERT service
                            try {
                                const finbertResp = await fetch('http://localhost:8000/predict', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ text }),
                                });
                                if (finbertResp.ok) {
                                    const res = await finbertResp.json();
                                    sentiment = {
                                        label: res.label,
                                        score: res.score,
                                        comparative: res.score,
                                        confidence: Math.round(res.score * 100)
                                    };
                                } else {
                                    sentiment = analyzeSentiment(text);
                                }
                            } catch {
                                // Fallback to local sentiment engine
                                sentiment = analyzeSentiment(text);
                            }

                            return {
                                id: `news-${symbol}-${i}`,
                                headline: item.headline as string,
                                summary: item.summary as string,
                                source: item.source as string,
                                url: item.url as string,
                                image: item.image as string,
                                datetime: ((item.datetime as number) || 0) * 1000,
                                relatedSymbols: [symbol],
                                sentiment,
                            };
                        }));
                        return NextResponse.json(articles);
                    }
                }
            } catch {
                console.log('Finnhub API failed, using mock news');
            }
        }

        // Fallback: mock news data
        const news = generateMockNews(symbol).slice(0, limit);
        return NextResponse.json(news);

    } catch (error) {
        console.error('News fetch error:', error);
        return NextResponse.json(generateMockNews(symbol).slice(0, limit));
    }
}
