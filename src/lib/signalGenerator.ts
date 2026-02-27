// ============================================
// AI Trade Signal Generator
// ============================================

import type { TradeSignal, OHLCV, IndicatorSnapshot } from '@/types';
import { getIndicatorSnapshot } from './indicators';

/**
 * Generate trade signal based on technical indicators + sentiment.
 */
export function generateSignal(
    symbol: string,
    candles: OHLCV[],
    sentimentScore: number = 0
): TradeSignal {
    if (candles.length < 50) {
        return createNeutralSignal(symbol, candles[candles.length - 1]?.close ?? 0);
    }

    const snapshot = getIndicatorSnapshot(candles);
    snapshot.sentiment = sentimentScore;

    const currentPrice = candles[candles.length - 1].close;
    let score = 0; // -100 to +100

    // --- RSI Analysis (weight: 25%) ---
    if (snapshot.rsi < 30) score += 25;           // Oversold → Buy
    else if (snapshot.rsi > 70) score -= 25;       // Overbought → Sell
    else if (snapshot.rsi < 40) score += 10;
    else if (snapshot.rsi > 60) score -= 10;

    // --- MACD Analysis (weight: 25%) ---
    if (snapshot.macd.histogram > 0 && snapshot.macd.value > snapshot.macd.signal) {
        score += 25; // Bullish crossover
    } else if (snapshot.macd.histogram < 0 && snapshot.macd.value < snapshot.macd.signal) {
        score -= 25; // Bearish crossover
    }

    // --- Moving Average Analysis (weight: 25%) ---
    if (currentPrice > snapshot.sma20 && snapshot.sma20 > snapshot.sma50) {
        score += 25; // Price above MAs, golden alignment
    } else if (currentPrice < snapshot.sma20 && snapshot.sma20 < snapshot.sma50) {
        score -= 25; // Price below MAs, death alignment
    } else if (currentPrice > snapshot.sma20) {
        score += 10;
    } else {
        score -= 10;
    }

    // --- Sentiment Analysis (weight: 25%) ---
    score += Math.round(sentimentScore * 25);

    // --- Determine Signal ---
    const confidence = Math.min(95, Math.max(15, Math.abs(score)));
    let type: TradeSignal['type'];

    if (score > 20) type = 'BUY';
    else if (score < -20) type = 'SELL';
    else type = 'HOLD';

    // Calculate targets based on ATR approximation
    const recentCandles = candles.slice(-14);
    const avgRange = recentCandles.reduce((sum, c) => sum + (c.high - c.low), 0) / recentCandles.length;
    const atr = avgRange;

    let targetPrice: number;
    let stopLoss: number;
    let reasoning: string;

    if (type === 'BUY') {
        targetPrice = currentPrice + atr * 2.5;
        stopLoss = currentPrice - atr * 1.5;
        reasoning = buildReasoning('bullish', snapshot, sentimentScore);
    } else if (type === 'SELL') {
        targetPrice = currentPrice - atr * 2.5;
        stopLoss = currentPrice + atr * 1.5;
        reasoning = buildReasoning('bearish', snapshot, sentimentScore);
    } else {
        targetPrice = currentPrice;
        stopLoss = currentPrice - atr;
        reasoning = buildReasoning('neutral', snapshot, sentimentScore);
    }

    return {
        id: `sig-${symbol}-${Date.now()}`,
        symbol,
        type,
        confidence,
        entryPrice: currentPrice,
        targetPrice: Math.round(targetPrice * 100) / 100,
        stopLoss: Math.round(stopLoss * 100) / 100,
        reasoning,
        indicators: snapshot,
        timestamp: Date.now(),
    };
}

function buildReasoning(
    bias: 'bullish' | 'bearish' | 'neutral',
    snap: IndicatorSnapshot,
    sentiment: number
): string {
    const parts: string[] = [];

    if (bias === 'bullish') {
        if (snap.rsi < 40) parts.push(`RSI at ${snap.rsi.toFixed(1)} indicates oversold conditions`);
        if (snap.macd.histogram > 0) parts.push('MACD histogram is positive, showing bullish momentum');
        if (sentiment > 0.15) parts.push(`News sentiment is bullish (${(sentiment * 100).toFixed(0)}%)`);
        if (parts.length === 0) parts.push('Multiple technical indicators align for an upward move');
    } else if (bias === 'bearish') {
        if (snap.rsi > 60) parts.push(`RSI at ${snap.rsi.toFixed(1)} indicates overbought conditions`);
        if (snap.macd.histogram < 0) parts.push('MACD histogram is negative, showing bearish momentum');
        if (sentiment < -0.15) parts.push(`News sentiment is bearish (${(sentiment * 100).toFixed(0)}%)`);
        if (parts.length === 0) parts.push('Multiple technical indicators align for a downward move');
    } else {
        parts.push('Mixed signals from technical indicators suggest a wait-and-see approach');
        parts.push(`RSI at ${snap.rsi.toFixed(1)} is in neutral territory`);
    }

    return parts.join('. ') + '.';
}

function createNeutralSignal(symbol: string, price: number): TradeSignal {
    return {
        id: `sig-${symbol}-${Date.now()}`,
        symbol,
        type: 'HOLD',
        confidence: 20,
        entryPrice: price,
        targetPrice: price,
        stopLoss: price * 0.95,
        reasoning: 'Insufficient data for reliable signal generation. Waiting for more price history.',
        indicators: {
            rsi: 50, macd: { value: 0, signal: 0, histogram: 0 },
            sma20: price, sma50: price, ema12: price, ema26: price, sentiment: 0,
        },
        timestamp: Date.now(),
    };
}
