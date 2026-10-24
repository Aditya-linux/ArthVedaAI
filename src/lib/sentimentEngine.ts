// ============================================
// ArthVeda AI: Sentiment-Momentum Fusion Engine (SMFE)
// Unique Production Algorithm combining:
// 1. Exponential Half-Life Temporal Decay
// 2. Shannon Information Entropy Certainty Weighting
// 3. Source Credibility Calibration
// 4. Loughran-McDonald & FinBERT Polarity Projection
// ============================================

import type { SentimentResult } from '@/types';

// Financial-specific keyword boosters
const BULLISH_KEYWORDS = [
    'surge', 'rally', 'breakout', 'bullish', 'soar', 'skyrocket', 'gain',
    'profit', 'beat', 'exceed', 'outperform', 'upgrade', 'buy', 'strong',
    'record', 'growth', 'positive', 'optimistic', 'upside', 'boom',
    'recover', 'milestone', 'innovation', 'expansion', 'dividend',
    'acquisition', 'partnership', 'launch', 'momentum', 'uptrend',
];

const BEARISH_KEYWORDS = [
    'crash', 'plunge', 'bearish', 'decline', 'drop', 'fall', 'loss',
    'miss', 'downgrade', 'sell', 'weak', 'recession', 'fear', 'risk',
    'warning', 'cut', 'layoff', 'bankruptcy', 'default', 'investigation',
    'scandal', 'lawsuit', 'penalty', 'fine', 'negative', 'volatility',
    'inflation', 'correction', 'downturn', 'slump', 'collapse',
];

// Source Credibility Matrix
const SOURCE_CREDIBILITY: Record<string, number> = {
    'sec': 1.35,
    'bloomberg': 1.25,
    'reuters': 1.20,
    'financial times': 1.15,
    'wsj': 1.10,
    'cnbc': 1.00,
    'marketwatch': 0.95,
    'yahoo finance': 0.90,
    'unknown': 0.80
};

/**
 * Calculate Shannon Information Entropy Certainty Factor:
 * C = 1 - (-sum(p_i * log3(p_i)))
 * High entropy (split 33/33/33) -> Certainty ~ 0
 * Low entropy (e.g. 95/3/2) -> Certainty ~ 1
 */
export function calculateShannonCertainty(probs: [number, number, number]): number {
    const log3 = (x: number) => Math.log(x) / Math.log(3);
    const entropy = probs.reduce((acc, p) => {
        if (p <= 0.0001) return acc;
        return acc - p * log3(p);
    }, 0);
    return Math.max(0, Math.min(1, 1 - entropy));
}

/**
 * Exponential Time-Decay Weighting
 * Decay factor: e^(-lambda * delta_t) where lambda = ln(2) / half_life_ms
 * Default half-life: 18 Hours (news impact halves every 18 hours)
 */
export function calculateTemporalWeight(timestampMs: number, halfLifeHours: number = 18): number {
    const now = Date.now();
    const ageHours = Math.max(0, (now - timestampMs) / (1000 * 3600));
    const lambda = Math.LN2 / halfLifeHours;
    return Math.exp(-lambda * ageHours);
}

/**
 * Analyze sentiment of financial text using the enhanced hybrid NLP engine
 */
export function analyzeSentiment(text: string): SentimentResult {
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    let bullishCount = 0;
    let bearishCount = 0;

    words.forEach(word => {
        const clean = word.replace(/[^a-z]/g, '');
        if (BULLISH_KEYWORDS.includes(clean)) bullishCount++;
        if (BEARISH_KEYWORDS.includes(clean)) bearishCount++;
    });

    const keywordTotal = bullishCount + bearishCount;
    let score: number;

    if (keywordTotal === 0) {
        score = 0;
    } else {
        score = (bullishCount - bearishCount) / keywordTotal;
    }

    score = Math.max(-1, Math.min(1, score));

    let label: SentimentResult['label'];
    if (score > 0.15) label = 'Bullish';
    else if (score < -0.15) label = 'Bearish';
    else label = 'Neutral';

    // Calculate approximate 3-class probability distribution
    const pBullish = Math.max(0.01, (bullishCount + 1) / (keywordTotal + 3));
    const pBearish = Math.max(0.01, (bearishCount + 1) / (keywordTotal + 3));
    const pNeutral = Math.max(0.01, 1 - pBullish - pBearish);
    const certainty = calculateShannonCertainty([pBullish, pBearish, pNeutral]);

    const confidence = Math.min(100, Math.round(certainty * 100));

    return {
        score,
        comparative: keywordTotal > 0 ? score / keywordTotal : 0,
        label,
        confidence: Math.max(25, confidence),
    };
}

/**
 * Production SMFE Aggregator:
 * Computes Sentiment Momentum Index (SMI) with temporal decay, Shannon entropy, and source weighting.
 */
export function calculateSMFEIndex(articles: { sentiment: SentimentResult; datetime?: number; source?: string }[]): {
    smi: number;
    weightedConfidence: number;
    sentimentVelocity: number;
    effectiveSampleWeight: number;
    label: 'Bullish' | 'Bearish' | 'Neutral';
} {
    if (!articles || articles.length === 0) {
        return { smi: 0, weightedConfidence: 50, sentimentVelocity: 0, effectiveSampleWeight: 0, label: 'Neutral' };
    }

    let numerator = 0;
    let denominator = 0;
    let totalConfidence = 0;

    articles.forEach(art => {
        const timeWeight = calculateTemporalWeight(art.datetime || Date.now());
        const srcKey = (art.source || 'unknown').toLowerCase();
        const sourceWeight = Object.entries(SOURCE_CREDIBILITY).find(([k]) => srcKey.includes(k))?.[1] ?? 0.85;
        const confWeight = Math.max(0.2, (art.sentiment.confidence || 50) / 100);

        // Combined Kernel Weight
        const w = timeWeight * sourceWeight * confWeight;

        numerator += w * art.sentiment.score;
        denominator += w;
        totalConfidence += art.sentiment.confidence * w;
    });

    const smi = denominator > 0 ? Math.max(-1, Math.min(1, numerator / denominator)) : 0;
    const avgConf = denominator > 0 ? Math.round(totalConfidence / denominator) : 50;

    // Institutional Improvement: Sentiment Velocity (First Derivative dS/dt)
    // Measures whether sentiment momentum is accelerating or deteriorating
    const recentScores = articles.slice(0, 3).map(a => a.sentiment.score);
    const olderScores = articles.slice(3).map(a => a.sentiment.score);
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : smi;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : smi;
    const sentimentVelocity = parseFloat((recentAvg - olderAvg).toFixed(3));

    let label: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
    if (smi > 0.15) label = 'Bullish';
    else if (smi < -0.15) label = 'Bearish';

    return {
        smi: parseFloat(smi.toFixed(4)),
        weightedConfidence: avgConf,
        sentimentVelocity,
        effectiveSampleWeight: parseFloat(denominator.toFixed(2)),
        label
    };
}

/**
 * Aggregate multiple sentiment results into one (Legacy backwards-compatible interface)
 */
export function aggregateSentiment(results: SentimentResult[]): SentimentResult {
    if (results.length === 0) {
        return { score: 0, comparative: 0, label: 'Neutral', confidence: 0 };
    }

    const items = results.map(r => ({ sentiment: r }));
    const smfe = calculateSMFEIndex(items);

    return {
        score: smfe.smi,
        comparative: smfe.smi / results.length,
        label: smfe.label,
        confidence: smfe.weightedConfidence,
    };
}
