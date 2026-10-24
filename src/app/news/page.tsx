'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatTimeAgo } from '@/lib/formatters';
import EducationCard from '@/components/EducationCard';
import type { NewsArticle, SentimentResult } from '@/types';

type SentFilter = 'all' | 'Bullish' | 'Bearish' | 'Neutral';
const SYMBOLS = ['AAPL', 'GOOGL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', 'MSFT', 'META'];

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
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [sym]);

    useEffect(() => { fetchNews(); }, [fetchNews]);

    const filtered = filter === 'all' ? news : news.filter(n => n.sentiment.label === filter);

    return (
        <div className="news-page">
            <header className="page-top">
                <div>
                    <h1 className="page-heading">Market Intelligence</h1>
                    <p className="page-sub">Real-time sentiment analysis for {sym}</p>
                </div>

                <select className="sym-select" value={sym} onChange={e => setSym(e.target.value)}>
                    {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </header>

            <div className="filter-tabs">
                {(['all', 'Bullish', 'Neutral', 'Bearish'] as SentFilter[]).map(f => (
                    <button
                        key={f}
                        className={`tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All Intel' : f}
                    </button>
                ))}
            </div>

            <EducationCard />

            <div className="news-grid">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="card skeleton" />)
                ) : (
                    filtered.map(a => (
                        <article key={a.id} className="card news-card">
                            <div className="card-top">
                                <span className="source">{a.source}</span>
                                <span className="time">{formatTimeAgo(a.datetime)}</span>
                            </div>
                            <h3 className="headline">{a.headline}</h3>
                            <p className="summary">{a.summary}</p>
                            <div className="card-bottom">
                                <Badge sentiment={a.sentiment} />
                                <span className="conf">Conf: {a.sentiment.confidence.toFixed(0)}%</span>
                            </div>
                        </article>
                    ))
                )}
                {!loading && filtered.length === 0 && (
                    <div className="empty">No intelligence found matching criteria.</div>
                )}
            </div>

            <style jsx>{`
                .news-page {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .page-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .page-heading {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                    letter-spacing: -0.3px;
                }

                .page-sub {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .sym-select {
                    padding: 8px 14px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: var(--bg-surface);
                    font-family: var(--font-sans);
                    font-size: 0.875rem;
                    color: var(--text-primary);
                    font-weight: 500;
                    min-width: 120px;
                }

                .filter-tabs {
                    display: flex;
                    gap: 0;
                    border-bottom: 1px solid var(--border-color);
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .tab {
                    background: none;
                    border: none;
                    padding: 10px 20px;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: color 0.15s;
                    white-space: nowrap;
                    font-family: var(--font-sans);
                }

                .tab:hover { color: var(--text-primary); }

                .tab.active {
                    color: var(--primary-blue);
                    border-bottom-color: var(--primary-blue);
                    font-weight: 600;
                }

                .news-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                }

                .news-card {
                    display: flex;
                    flex-direction: column;
                    transition: border-color 0.15s;
                }

                .news-card:hover {
                    border-color: var(--text-tertiary);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .source {
                    font-size: 0.688rem;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .time {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                }

                .headline {
                    font-size: 1rem;
                    font-weight: 600;
                    line-height: 1.35;
                    margin: 0 0 8px 0;
                    color: var(--text-primary);
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .summary {
                    font-size: 0.813rem;
                    color: var(--text-secondary);
                    line-height: 1.55;
                    margin: 0 0 16px 0;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid var(--border-color);
                    padding-top: 12px;
                }

                .conf {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .skeleton {
                    height: 240px;
                    background: linear-gradient(110deg, var(--bg-surface) 8%, var(--bg-app) 18%, var(--bg-surface) 33%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s linear infinite;
                }

                @keyframes shimmer {
                    to { background-position-x: -200%; }
                }

                .empty {
                    grid-column: 1 / -1;
                    padding: 40px;
                    text-align: center;
                    color: var(--text-secondary);
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    border: 1px dashed var(--border-color);
                    font-size: 0.875rem;
                }

                /* Badges */
                :global(.badge) {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 10px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                :global(.badge-bullish) { background: var(--green-bg); color: var(--green); }
                :global(.badge-bearish) { background: var(--red-bg); color: var(--red); }
                :global(.badge-neutral) { background: var(--yellow-bg); color: var(--yellow); }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-top {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .sym-select {
                        width: 100%;
                    }

                    .news-grid {
                        grid-template-columns: 1fr;
                    }

                    .filter-tabs {
                        gap: 0;
                    }

                    .tab {
                        padding: 10px 14px;
                        font-size: 0.813rem;
                    }
                }

                @media (max-width: 480px) {
                    .page-heading {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
}
