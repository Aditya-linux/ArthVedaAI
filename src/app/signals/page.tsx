'use client';

import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, Minus, RefreshCw, Clock, ChevronDown, ChevronUp, Newspaper, ExternalLink } from 'lucide-react';
import { formatPrice, formatTimeAgo } from '@/lib/formatters';
import AuthGuard from '@/components/AuthGuard';
import type { TradeSignal, NewsArticle } from '@/types';

const WATCHLIST = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'META', name: 'Meta Platforms' },
];

interface StockSignalData {
    symbol: string;
    name: string;
    signal: TradeSignal | null;
    news: NewsArticle[];
    loading: boolean;
    error: boolean;
}

export default function SignalsPage() {
    const [stocks, setStocks] = useState<StockSignalData[]>(
        WATCHLIST.map(w => ({ symbol: w.symbol, name: w.name, signal: null, news: [], loading: true, error: false }))
    );
    const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAll = async () => {
        setRefreshing(true);
        const results = await Promise.allSettled(
            WATCHLIST.map(async (w) => {
                const [sigRes, newsRes] = await Promise.all([
                    fetch(`/api/signals?symbol=${w.symbol}`),
                    fetch(`/api/news?symbol=${w.symbol}&limit=5`),
                ]);
                const signal = sigRes.ok ? await sigRes.json() : null;
                const newsData = newsRes.ok ? await newsRes.json() : [];
                return {
                    symbol: w.symbol,
                    name: w.name,
                    signal: signal && !signal.error ? signal : null,
                    news: Array.isArray(newsData) ? newsData : [],
                    loading: false,
                    error: !signal || signal.error,
                };
            })
        );

        setStocks(results.map((r, i) =>
            r.status === 'fulfilled'
                ? r.value
                : { ...WATCHLIST[i], signal: null, news: [], loading: false, error: true } as StockSignalData
        ));
        setRefreshing(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const loaded = stocks.filter(s => !s.loading && s.signal);
    const stats = {
        buy: loaded.filter(s => s.signal?.type === 'BUY').length,
        sell: loaded.filter(s => s.signal?.type === 'SELL').length,
        hold: loaded.filter(s => s.signal?.type === 'HOLD').length,
        avgConf: loaded.length > 0
            ? Math.round(loaded.reduce((sum, s) => sum + (s.signal?.confidence || 0), 0) / loaded.length)
            : 0,
    };

    const toggleExpand = (sym: string) => {
        setExpandedSymbol(prev => prev === sym ? null : sym);
    };

    return (
        <AuthGuard>
            <div className="signals-page">
                {/* Header */}
                <div className="page-header">
                    <h2><Zap size={20} />AI Trade Signals</h2>
                    <button className="refresh-btn" onClick={fetchAll} disabled={refreshing}>
                        <RefreshCw size={14} className={refreshing ? 'spinning' : ''} />
                        {refreshing ? 'Analyzing...' : 'Refresh'}
                    </button>
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    {[
                        { label: 'Buy', value: stats.buy, color: 'var(--green)' },
                        { label: 'Sell', value: stats.sell, color: 'var(--red)' },
                        { label: 'Hold', value: stats.hold, color: 'var(--yellow, #EAB308)' },
                        { label: 'Avg Confidence', value: `${stats.avgConf}%`, color: 'var(--primary-blue)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <span className="stat-label">{s.label}</span>
                            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Signal Cards */}
                <div className="signal-list">
                    {stocks.map(stock => (
                        <div key={stock.symbol} className="signal-card">
                            {/* Main Row */}
                            <div className="card-main" onClick={() => stock.signal && toggleExpand(stock.symbol)}>
                                <div className="stock-info">
                                    <span className="stock-symbol">{stock.symbol}</span>
                                    <span className="stock-name">{stock.name}</span>
                                </div>

                                {stock.loading ? (
                                    <div className="loading-pill">Analyzing...</div>
                                ) : stock.signal ? (
                                    <div className="signal-row">
                                        <div className="signal-meta">
                                            <span className="entry-price">${formatPrice(stock.signal.entryPrice)}</span>
                                            <span className="target-label">
                                                Target: <span style={{ color: 'var(--green)' }}>${formatPrice(stock.signal.targetPrice)}</span>
                                            </span>
                                        </div>

                                        <div className="signal-badges">
                                            <span className={`signal-badge ${stock.signal.type.toLowerCase()}`}>
                                                {stock.signal.type === 'BUY' ? <TrendingUp size={12} /> : stock.signal.type === 'SELL' ? <TrendingDown size={12} /> : <Minus size={12} />}
                                                {stock.signal.type}
                                            </span>
                                            <span className="confidence-badge">{stock.signal.confidence}%</span>
                                        </div>

                                        <div className="expand-icon">
                                            {expandedSymbol === stock.symbol ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="error-pill">Failed</div>
                                )}
                            </div>

                            {/* Expanded Section */}
                            {expandedSymbol === stock.symbol && stock.signal && (
                                <div className="card-expanded">
                                    {/* Signal Details */}
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Entry</span>
                                            <span className="detail-value">${formatPrice(stock.signal.entryPrice)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Target</span>
                                            <span className="detail-value green">${formatPrice(stock.signal.targetPrice)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Stop Loss</span>
                                            <span className="detail-value red">${formatPrice(stock.signal.stopLoss)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">RSI</span>
                                            <span className="detail-value">{stock.signal.indicators.rsi.toFixed(1)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">MACD</span>
                                            <span className="detail-value">{stock.signal.indicators.macd.value.toFixed(3)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">SMA 20</span>
                                            <span className="detail-value">${formatPrice(stock.signal.indicators.sma20)}</span>
                                        </div>
                                    </div>

                                    {/* Reasoning */}
                                    <div className="reasoning">
                                        <p>{stock.signal.reasoning}</p>
                                    </div>

                                    {/* Confidence Bar */}
                                    <div className="confidence-section">
                                        <div className="confidence-header">
                                            <span>Confidence</span>
                                            <span className="conf-value">{stock.signal.confidence}%</span>
                                        </div>
                                        <div className="confidence-track">
                                            <div
                                                className={`confidence-fill ${stock.signal.confidence > 65 ? 'high' : stock.signal.confidence > 40 ? 'medium' : 'low'}`}
                                                style={{ width: `${stock.signal.confidence}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* News Section */}
                                    {stock.news.length > 0 && (
                                        <div className="news-section">
                                            <h4><Newspaper size={14} /> Related News</h4>
                                            <div className="news-list">
                                                {stock.news.map(article => (
                                                    <a key={article.id} href={article.url !== '#' ? article.url : undefined} target="_blank" rel="noopener noreferrer" className="news-item">
                                                        <div className="news-content">
                                                            <span className="news-headline">{article.headline}</span>
                                                            <div className="news-meta">
                                                                <span className="news-source">{article.source}</span>
                                                                <span className="news-time"><Clock size={10} /> {formatTimeAgo(article.datetime)}</span>
                                                                <span className={`sentiment-pill ${article.sentiment.label.toLowerCase()}`}>
                                                                    {article.sentiment.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {article.url !== '#' && <ExternalLink size={14} className="news-link-icon" />}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <style jsx>{`
                    .signals-page {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 0 16px;
                    }

                    /* Header */
                    .page-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    .page-header h2 {
                        font-size: 1.2rem;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: var(--text-primary);
                        margin: 0;
                    }
                    .refresh-btn {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 8px 16px;
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-full);
                        color: var(--text-secondary);
                        font-size: 0.8rem;
                        font-weight: 500;
                        cursor: pointer;
                        font-family: inherit;
                        transition: all 0.2s;
                    }
                    .refresh-btn:hover:not(:disabled) {
                        border-color: var(--text-tertiary);
                        color: var(--text-primary);
                    }
                    .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                    :global(.spinning) { animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }

                    /* Stats Row */
                    .stats-row {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        margin-bottom: 20px;
                    }
                    .stat-card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        padding: 14px 16px;
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        text-align: center;
                    }
                    .stat-label {
                        font-size: 0.7rem;
                        color: var(--text-tertiary);
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        font-weight: 600;
                    }
                    .stat-value {
                        font-size: 1.5rem;
                        font-weight: 800;
                        font-family: var(--font-mono, monospace);
                    }

                    /* Signal Cards */
                    .signal-list {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .signal-card {
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-lg, 12px);
                        overflow: hidden;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                        height: fit-content;
                    }
                    .signal-card:hover {
                        border-color: var(--primary-blue);
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        transform: translateY(-2px);
                    }

                    .card-main {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 20px 24px;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .card-main:hover {
                        background: rgba(255, 255, 255, 0.03);
                    }
                    .stock-info {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        min-width: 200px;
                    }
                    .stock-symbol {
                        font-size: 1.1rem;
                        font-weight: 800;
                        color: var(--text-primary);
                        font-family: var(--font-mono, monospace);
                    }
                    .stock-name {
                        font-size: 0.9rem;
                        color: var(--text-tertiary);
                    }

                    .signal-row {
                        display: flex;
                        align-items: center;
                        gap: 20px;
                    }
                    .signal-meta {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        gap: 2px;
                    }
                    .entry-price {
                        font-size: 1.05rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        font-family: var(--font-mono, monospace);
                    }
                    .target-label {
                        font-size: 0.75rem;
                        color: var(--text-tertiary);
                    }

                    .signal-badges {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .signal-badge {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        padding: 5px 12px;
                        border-radius: var(--radius-full);
                        font-size: 0.75rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.03em;
                    }
                    .signal-badge.buy {
                        background: var(--green-bg);
                        color: var(--green);
                    }
                    .signal-badge.sell {
                        background: var(--red-bg);
                        color: var(--red);
                    }
                    .signal-badge.hold {
                        background: rgba(234, 179, 8, 0.1);
                        color: #EAB308;
                    }
                    .confidence-badge {
                        font-size: 0.75rem;
                        font-weight: 700;
                        color: var(--primary-blue);
                        font-family: var(--font-mono, monospace);
                        padding: 4px 10px;
                        background: rgba(59, 130, 246, 0.08);
                        border-radius: var(--radius-full);
                    }
                    .expand-icon {
                        color: var(--text-tertiary);
                        margin-left: 4px;
                    }

                    .loading-pill, .error-pill {
                        font-size: 0.8rem;
                        padding: 6px 14px;
                        border-radius: var(--radius-full);
                    }
                    .loading-pill {
                        color: var(--text-tertiary);
                        background: var(--bg-app);
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    .error-pill {
                        color: var(--red);
                        background: var(--red-bg);
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }

                    /* Expanded */
                    .card-expanded {
                        border-top: 1px solid var(--border-color);
                        padding: 24px;
                        background: var(--bg-app);
                        box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
                    }

                    .detail-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                        margin-bottom: 16px;
                    }
                    .detail-item {
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        padding: 10px 12px;
                        background: var(--bg-surface);
                        border-radius: var(--radius-sm, 8px);
                        border: 1px solid var(--border-color);
                    }
                    .detail-label {
                        font-size: 0.65rem;
                        color: var(--text-tertiary);
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        font-weight: 600;
                    }
                    .detail-value {
                        font-size: 0.9rem;
                        font-weight: 700;
                        font-family: var(--font-mono, monospace);
                        color: var(--text-primary);
                    }
                    .detail-value.green { color: var(--green); }
                    .detail-value.red { color: var(--red); }

                    .reasoning {
                        padding: 12px 14px;
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-sm, 8px);
                        margin-bottom: 16px;
                    }
                    .reasoning p {
                        font-size: 0.82rem;
                        color: var(--text-secondary);
                        line-height: 1.6;
                        margin: 0;
                    }

                    /* Confidence */
                    .confidence-section { margin-bottom: 16px; }
                    .confidence-header {
                        display: flex;
                        justify-content: space-between;
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: var(--text-secondary);
                        margin-bottom: 6px;
                    }
                    .conf-value {
                        font-family: var(--font-mono, monospace);
                        font-weight: 700;
                    }
                    .confidence-track {
                        height: 6px;
                        background: var(--border-color);
                        border-radius: 3px;
                        overflow: hidden;
                    }
                    .confidence-fill {
                        height: 100%;
                        border-radius: 3px;
                        transition: width 0.5s ease;
                    }
                    .confidence-fill.high { background: var(--green); }
                    .confidence-fill.medium { background: #EAB308; }
                    .confidence-fill.low { background: var(--red); }

                    /* News */
                    .news-section h4 {
                        font-size: 0.8rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        margin: 0 0 12px 0;
                    }
                    .news-list {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    .news-item {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 12px 14px;
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-sm, 8px);
                        text-decoration: none;
                        transition: all 0.15s;
                        cursor: pointer;
                    }
                    .news-item:hover {
                        border-color: var(--text-tertiary);
                        transform: translateX(2px);
                    }
                    .news-content { flex: 1; min-width: 0; }
                    .news-headline {
                        font-size: 0.8rem;
                        font-weight: 600;
                        color: var(--text-primary);
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .news-meta {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-top: 6px;
                    }
                    .news-source {
                        font-size: 0.7rem;
                        font-weight: 600;
                        color: var(--primary-blue);
                    }
                    .news-time {
                        font-size: 0.68rem;
                        color: var(--text-tertiary);
                        display: flex;
                        align-items: center;
                        gap: 3px;
                    }
                    .sentiment-pill {
                        font-size: 0.65rem;
                        font-weight: 700;
                        padding: 2px 8px;
                        border-radius: var(--radius-full);
                        text-transform: uppercase;
                        letter-spacing: 0.03em;
                    }
                    .sentiment-pill.bullish {
                        background: var(--green-bg);
                        color: var(--green);
                    }
                    .sentiment-pill.bearish {
                        background: var(--red-bg);
                        color: var(--red);
                    }
                    .sentiment-pill.neutral {
                        background: rgba(234, 179, 8, 0.1);
                        color: #EAB308;
                    }
                    .news-link-icon {
                        color: var(--text-tertiary);
                        flex-shrink: 0;
                        margin-top: 2px;
                    }

                    /* Responsive */
                    @media (max-width: 768px) {
                        .stats-row { grid-template-columns: repeat(2, 1fr); }
                        .card-main { flex-direction: column; align-items: flex-start; gap: 10px; }
                        .signal-row { width: 100%; justify-content: space-between; }
                        .signal-meta { align-items: flex-start; }
                        .detail-grid { grid-template-columns: repeat(2, 1fr); }
                    }
                    @media (max-width: 480px) {
                        .stats-row { grid-template-columns: 1fr 1fr; }
                        .detail-grid { grid-template-columns: 1fr; }
                    }
                `}</style>
            </div>
        </AuthGuard>
    );
}
