// ============================================
// Sentiment Analysis Engine
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

/**
 * Analyze sentiment of financial text.
 * Combines basic NLP with financial keyword boosting.
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

    // Calculate raw score
    const keywordTotal = bullishCount + bearishCount;
    let score: number;

    if (keywordTotal === 0) {
        score = 0;
    } else {
        score = (bullishCount - bearishCount) / keywordTotal;
    }

    // Clamp score to [-1, 1]
    score = Math.max(-1, Math.min(1, score));

    // Determine label
    let label: SentimentResult['label'];
    if (score > 0.15) label = 'Bullish';
    else if (score < -0.15) label = 'Bearish';
    else label = 'Neutral';

    // Confidence based on keyword density
    const confidence = Math.min(100, Math.round((keywordTotal / Math.max(totalWords, 1)) * 500));

    return {
        score,
        comparative: keywordTotal > 0 ? score / keywordTotal : 0,
        label,
        confidence: Math.max(20, confidence), // minimum 20% confidence
    };
}

/**
 * Aggregate multiple sentiment results into one.
 */
export function aggregateSentiment(results: SentimentResult[]): SentimentResult {
    if (results.length === 0) {
        return { score: 0, comparative: 0, label: 'Neutral', confidence: 0 };
    }

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    let label: SentimentResult['label'];
    if (avgScore > 0.15) label = 'Bullish';
    else if (avgScore < -0.15) label = 'Bearish';
    else label = 'Neutral';

    return {
        score: avgScore,
        comparative: avgScore / results.length,
        label,
        confidence: Math.round(avgConfidence),
    };
}
