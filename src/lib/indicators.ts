// ============================================
// Technical Indicator Calculations
// ============================================

import { OHLCV } from '@/types';

/** Simple Moving Average */
export function calculateSMA(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(null);
        } else {
            const slice = data.slice(i - period + 1, i + 1);
            const sum = slice.reduce((a, b) => a + b, 0);
            result.push(sum / period);
        }
    }
    return result;
}

/** Exponential Moving Average */
export function calculateEMA(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(null);
        } else if (i === period - 1) {
            const sma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
            result.push(sma);
        } else {
            const prev = result[i - 1]!;
            result.push((data[i] - prev) * multiplier + prev);
        }
    }
    return result;
}

/** Relative Strength Index */
export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
    const result: (number | null)[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            result.push(null);
            continue;
        }

        const change = data[i] - data[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);

        if (i < period) {
            result.push(null);
        } else if (i === period) {
            const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
            if (avgLoss === 0) {
                result.push(100);
            } else {
                const rs = avgGain / avgLoss;
                result.push(100 - 100 / (1 + rs));
            }
        } else {
            const prevRSI = result[i - 1]!;
            const prevAvgGain = (100 / (100 - prevRSI) - 1) > 0
                ? gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period
                : 0;
            const prevAvgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;

            if (prevAvgLoss === 0) {
                result.push(100);
            } else {
                const rs = prevAvgGain / prevAvgLoss;
                result.push(100 - 100 / (1 + rs));
            }
        }
    }
    return result;
}

/** MACD (12, 26, 9) */
export function calculateMACD(data: number[]): {
    macdLine: (number | null)[];
    signalLine: (number | null)[];
    histogram: (number | null)[];
} {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);

    const macdLine: (number | null)[] = ema12.map((val, i) => {
        if (val === null || ema26[i] === null) return null;
        return val - ema26[i]!;
    });

    const macdValues = macdLine.filter((v): v is number => v !== null);
    const signalRaw = calculateEMA(macdValues, 9);

    let signalIdx = 0;
    const signalLine: (number | null)[] = macdLine.map((val) => {
        if (val === null) return null;
        const sig = signalRaw[signalIdx++];
        return sig ?? null;
    });

    const histogram: (number | null)[] = macdLine.map((val, i) => {
        if (val === null || signalLine[i] === null) return null;
        return val - signalLine[i]!;
    });

    return { macdLine, signalLine, histogram };
}

/** Bollinger Bands (20, 2) */
export function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2): {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
} {
    const middle = calculateSMA(data, period);
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
        if (middle[i] === null) {
            upper.push(null);
            lower.push(null);
        } else {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = middle[i]!;
            const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
            const sd = Math.sqrt(variance) * stdDev;
            upper.push(mean + sd);
            lower.push(mean - sd);
        }
    }

    return { upper, middle, lower };
}

/** Get indicator snapshot for the latest data point */
export function getIndicatorSnapshot(candles: OHLCV[]) {
    const closes = candles.map(c => c.close);
    const rsiValues = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);

    const last = closes.length - 1;

    return {
        rsi: rsiValues[last] ?? 50,
        macd: {
            value: macd.macdLine[last] ?? 0,
            signal: macd.signalLine[last] ?? 0,
            histogram: macd.histogram[last] ?? 0,
        },
        sma20: sma20[last] ?? closes[last],
        sma50: sma50[last] ?? closes[last],
        ema12: ema12[last] ?? closes[last],
        ema26: ema26[last] ?? closes[last],
        sentiment: 0,
    };
}
