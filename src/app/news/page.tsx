'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatters';
import EducationCard from '@/components/EducationCard';
import type { NewsArticle, SentimentResult } from '@/types';

type SentFilter = 'all' | 'Bullish' | 'Bearish' | 'Neutral';
const SYMBOLS = ['AAPL', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'MSFT', 'META'];

const FALLBACK_EDITORIAL_IMAGES: Record<string, string[]> = {
    AAPL: [
        'https://images.unsplash.com/photo-1510519138111-57771239f9a3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80',
    ],
    GOOGL: [
        'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    ],
    TSLA: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    ],
    NVDA: [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    ],
    'BTC-USD': [
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    ],
    'ETH-USD': [
        'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    ],
    MSFT: [
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    ],
    META: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80',
    ],
    DEFAULT: [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    ]
};

function getArticleImage(article: NewsArticle, symbol: string, index: number): string {
    if (
        article.image &&
        article.image.startsWith('http') &&
        !article.image.includes('yahoo_finance_en-US') &&
        !article.image.includes('default') &&
        !article.image.includes('placeholder')
    ) {
        return article.image;
    }
    const pool = FALLBACK_EDITORIAL_IMAGES[symbol] || FALLBACK_EDITORIAL_IMAGES.DEFAULT;
    return pool[index % pool.length];
}

function Badge({ sentiment }: { sentiment: SentimentResult }) {
    const label = sentiment.label.toLowerCase();
    return (
        <span className={`badge badge-${label}`}>
            {sentiment.label}
        </span>
    );
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [sym, setSym] = useState('AAPL');
    const [filter, setFilter] = useState<SentFilter>('all');

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/news?symbol=${sym}&limit=12`);
            setNews(await r.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [sym]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const filtered = filter === 'all' ? news : news.filter(n => n.sentiment.label === filter);

    return (
        <div className="news-page">
            <header className="page-top">
                <div className="title-area">
                    <div className="kicker-row">
                        <span className="newspaper-kicker">FINANCIAL INTELLIGENCE DISPATCH</span>
                        <span className="edition-badge">LIVE EDITION</span>
                    </div>
                    <h1 className="page-heading">Market Intelligence Wire</h1>
                    <p className="page-sub">
                        Algorithmic news surveillance and real-time FinBERT polarity extraction for <strong>{sym}</strong>
                    </p>
                </div>

                <div className="top-controls">
                    <select className="sym-select" value={sym} onChange={e => setSym(e.target.value)}>
                        {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </header>

            <div className="filter-tabs">
                {(['all', 'Bullish', 'Neutral', 'Bearish'] as SentFilter[]).map(f => (
                    <button
                        key={f}
                        className={`tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All Dispatches' : f}
                    </button>
                ))}
            </div>

            <EducationCard />

            <div className="newspaper-grid">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="card newspaper-card skeleton-card">
                            <div className="skeleton-img" />
                            <div className="skeleton-body">
                                <div className="skeleton-line short" />
                                <div className="skeleton-line title" />
                                <div className="skeleton-line" />
                                <div className="skeleton-line" />
                            </div>
                        </div>
                    ))
                ) : (
                    filtered.map((a, idx) => {
                        const fallbackUrl = (FALLBACK_EDITORIAL_IMAGES[sym] || FALLBACK_EDITORIAL_IMAGES.DEFAULT)[idx % (FALLBACK_EDITORIAL_IMAGES[sym] || FALLBACK_EDITORIAL_IMAGES.DEFAULT).length];
                        return (
                            <article key={a.id} className="card newspaper-card">
                                {/* Mobile Newspaper Image Header */}
                                <div className="newspaper-image-container">
                                    <img
                                        src={getArticleImage(a, sym, idx)}
                                        alt={a.headline}
                                        className="newspaper-thumb"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                                        }}
                                    />
                                    <div className="image-overlay-top">
                                        <span className="newspaper-source-badge">{a.source}</span>
                                        <Badge sentiment={a.sentiment} />
                                    </div>
                                    <div className="image-overlay-bottom">
                                        <span className="reading-time">
                                            <Clock size={11} />
                                            {formatTimeAgo(a.datetime)}
                                        </span>
                                    </div>
                                </div>

                                {/* Article Body */}
                                <div className="newspaper-content">
                                    <div className="editorial-meta">
                                        <span className="ticker-pill">{sym}</span>
                                        <span className="meta-separator">•</span>
                                        <span className="wire-tag">WIRE INTEL</span>
                                    </div>

                                    <h3 className="headline">
                                        <a href={a.url && a.url !== '#' ? a.url : undefined} target="_blank" rel="noopener noreferrer" className="headline-link">
                                            {a.headline}
                                        </a>
                                    </h3>

                                    <p className="summary">{a.summary}</p>

                                    <div className="card-footer">
                                        <div className="nlp-confidence">
                                            <Sparkles size={12} />
                                            <span>FinBERT Confidence: <strong>{a.sentiment.confidence.toFixed(0)}%</strong></span>
                                        </div>

                                        <a
                                            href={a.url && a.url !== '#' ? a.url : undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="external-action-btn"
                                            title="View Source Story"
                                        >
                                            <ExternalLink size={13} />
                                        </a>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}

                {!loading && filtered.length === 0 && (
                    <div className="empty">
                        <Newspaper size={36} className="empty-icon" />
                        <p>No intelligence dispatches found matching criteria for {sym}.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .news-page {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .page-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .kicker-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                }

                .newspaper-kicker {
                    font-size: 0.688rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--text-tertiary);
                }

                .edition-badge {
                    font-size: 0.625rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                    letter-spacing: 0.04em;
                }

                [data-theme='light'] .edition-badge {
                    background: rgba(0, 0, 0, 0.05);
                }

                .page-heading {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 6px 0;
                    letter-spacing: -0.02em;
                    font-family: var(--font-heading);
                }

                .page-sub {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin: 0;
                    line-height: 1.5;
                }

                .page-sub strong {
                    color: var(--text-primary);
                }

                .sym-select {
                    padding: 9px 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: var(--bg-surface);
                    font-family: var(--font-sans);
                    font-size: 0.875rem;
                    color: var(--text-primary);
                    font-weight: 600;
                    min-width: 140px;
                    cursor: pointer;
                    transition: border-color 0.15s;
                }

                .sym-select:focus {
                    outline: 2px solid var(--text-primary);
                    outline-offset: 1px;
                }

                .filter-tabs {
                    display: flex;
                    gap: 4px;
                    border-bottom: 1px solid var(--border-color);
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .tab {
                    background: none;
                    border: none;
                    padding: 10px 18px;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.15s;
                    white-space: nowrap;
                    font-family: var(--font-sans);
                }

                .tab:hover { 
                    color: var(--text-primary); 
                }

                .tab.active {
                    color: var(--text-primary);
                    border-bottom-color: var(--text-primary);
                    font-weight: 700;
                }

                /* Mobile Newspaper Grid */
                .newspaper-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 22px;
                }

                .newspaper-card {
                    padding: 0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    background: var(--bg-surface);
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;
                }

                .newspaper-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.25);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
                }

                [data-theme='light'] .newspaper-card:hover {
                    border-color: rgba(0, 0, 0, 0.2);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
                }

                /* Newspaper Image Container */
                .newspaper-image-container {
                    position: relative;
                    width: 100%;
                    height: 195px;
                    overflow: hidden;
                    background: var(--bg-card);
                }

                .newspaper-thumb {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    filter: contrast(1.03) brightness(0.95);
                }

                .newspaper-card:hover .newspaper-thumb {
                    transform: scale(1.04);
                }

                .image-overlay-top {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    right: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    z-index: 2;
                }

                .newspaper-source-badge {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    padding: 4px 9px;
                    border-radius: var(--radius-sm);
                    background: rgba(0, 0, 0, 0.72);
                    color: #FFFFFF;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }

                .image-overlay-bottom {
                    position: absolute;
                    bottom: 10px;
                    left: 12px;
                    z-index: 2;
                }

                .reading-time {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.688rem;
                    font-weight: 500;
                    padding: 3px 8px;
                    border-radius: var(--radius-sm);
                    background: rgba(0, 0, 0, 0.65);
                    color: rgba(255, 255, 255, 0.88);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                }

                /* Newspaper Article Content */
                .newspaper-content {
                    padding: 18px 20px 16px 20px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .editorial-meta {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 10px;
                    font-size: 0.688rem;
                    color: var(--text-tertiary);
                    font-weight: 600;
                    letter-spacing: 0.04em;
                }

                .ticker-pill {
                    color: var(--text-primary);
                    background: rgba(255, 255, 255, 0.06);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: var(--font-mono);
                }

                [data-theme='light'] .ticker-pill {
                    background: rgba(0, 0, 0, 0.05);
                }

                .headline {
                    font-size: 1.05rem;
                    font-weight: 700;
                    line-height: 1.38;
                    margin: 0 0 10px 0;
                    color: var(--text-primary);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-family: var(--font-heading);
                }

                .headline-link {
                    color: inherit;
                    text-decoration: none;
                    transition: opacity 0.15s;
                }

                .headline-link:hover {
                    opacity: 0.85;
                }

                .summary {
                    font-size: 0.813rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin: 0 0 16px 0;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 14px;
                    border-top: 1px solid var(--border-color);
                    margin-top: auto;
                }

                .nlp-confidence {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.72rem;
                    color: var(--text-tertiary);
                }

                .nlp-confidence strong {
                    color: var(--text-primary);
                    font-family: var(--font-mono);
                }

                .external-action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: var(--radius-sm);
                    background: var(--bg-hover);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                    transition: all 0.15s;
                }

                .external-action-btn:hover {
                    background: var(--text-primary);
                    color: var(--bg-app);
                }

                /* Skeletons */
                .skeleton-card {
                    height: 380px;
                }

                .skeleton-img {
                    height: 195px;
                    background: linear-gradient(110deg, var(--bg-surface) 8%, var(--bg-hover) 18%, var(--bg-surface) 33%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s linear infinite;
                }

                .skeleton-body {
                    padding: 18px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .skeleton-line {
                    height: 14px;
                    border-radius: 4px;
                    background: linear-gradient(110deg, var(--bg-surface) 8%, var(--bg-hover) 18%, var(--bg-surface) 33%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s linear infinite;
                }

                .skeleton-line.short { width: 35%; height: 12px; }
                .skeleton-line.title { width: 85%; height: 18px; margin-bottom: 4px; }

                @keyframes shimmer {
                    to { background-position-x: -200%; }
                }

                .empty {
                    grid-column: 1 / -1;
                    padding: 50px 20px;
                    text-align: center;
                    color: var(--text-secondary);
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    border: 1px dashed var(--border-color);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .empty-icon {
                    color: var(--text-tertiary);
                    opacity: 0.6;
                }

                /* Monochromatic Apple Badges */
                :global(.badge) {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 9px;
                    border-radius: var(--radius-full);
                    font-size: 0.688rem;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    font-family: var(--font-sans);
                    text-transform: uppercase;
                }

                :global(.badge-bullish) {
                    background: #FFFFFF;
                    color: #000000 !important;
                    border: 1px solid #FFFFFF;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }
                :global(.badge-bearish) {
                    background: rgba(0, 0, 0, 0.75);
                    color: #FFFFFF !important;
                    border: 1px solid rgba(255, 255, 255, 0.35);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }
                :global(.badge-neutral) {
                    background: rgba(0, 0, 0, 0.65);
                    color: #D4D4D8 !important;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                }

                :global([data-theme='light'] .badge-bullish) {
                    background: #000000;
                    color: #FFFFFF !important;
                    border: 1px solid #000000;
                }
                :global([data-theme='light'] .badge-bearish) {
                    background: rgba(255, 255, 255, 0.9);
                    color: #000000 !important;
                    border: 1px solid rgba(0, 0, 0, 0.25);
                }
                :global([data-theme='light'] .badge-neutral) {
                    background: rgba(255, 255, 255, 0.85);
                    color: #000000 !important;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                }

                /* Mobile Viewport - True Mobile Newspaper Layout */
                @media (max-width: 768px) {
                    .newspaper-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .newspaper-image-container {
                        height: 220px;
                    }

                    .page-top {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .sym-select {
                        width: 100%;
                    }

                    .newspaper-content {
                        padding: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .newspaper-image-container {
                        height: 180px;
                    }

                    .page-heading {
                        font-size: 1.35rem;
                    }
                }
            `}</style>
        </div>
    );
}
