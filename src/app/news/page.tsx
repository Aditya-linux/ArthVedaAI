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
            <header className="page-header">
                <div>
                    <h1 className="page-title">Market Intelligence</h1>
                    <p className="page-subtitle">Real-time sentiment analysis for {sym}</p>
                </div>

                <div className="controls">
                    <select className="select-input" value={sym} onChange={e => setSym(e.target.value)}>
                        {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </header>

            <div className="tabs-container">
                {(['all', 'Bullish', 'Neutral', 'Bearish'] as SentFilter[]).map(f => (
                    <button
                        key={f}
                        className={`tab-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All Intel' : f}
                    </button>
                ))}
            </div>

            <EducationCard />

            <div className="news-grid">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="card skeleton-card" />)
                ) : (
                    filtered.map(a => (
                        <div key={a.id} className="card news-card">
                            <div className="card-header">
                                <div className="source-badge">{a.source}</div>
                                <span className="time-ago">{formatTimeAgo(a.datetime)}</span>
                            </div>

                            <h3 className="news-headline">{a.headline}</h3>
                            <p className="news-summary">{a.summary}</p>

                            <div className="card-footer">
                                <Badge sentiment={a.sentiment} />
                                <div className="score-text">
                                    Conf: {a.sentiment.confidence.toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {!loading && filtered.length === 0 && (
                    <div className="empty-state">No intelligence found matching criteria.</div>
                )}
            </div>

            <style jsx>{`
                .news-page {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .select-input {
                    padding: 10px 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: var(--bg-surface);
                    font-family: var(--font-sans);
                    font-size: 1rem;
                    color: var(--text-primary);
                    min-width: 150px;
                }

                .tabs-container {
                    display: flex;
                    gap: 8px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 0;
                }

                .tab-btn {
                    background: none;
                    border: none;
                    padding: 12px 24px;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .tab-btn:hover { color: var(--text-primary); }

                .tab-btn.active {
                    color: var(--primary-blue);
                    border-bottom-color: var(--primary-blue);
                    font-weight: 600;
                }

                .news-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 24px;
                }

                .news-card {
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .news-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.06);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .source-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .time-ago {
                    font-size: 0.85rem;
                    color: var(--text-tertiary);
                }

                .news-headline {
                    font-size: 1.25rem;
                    font-weight: 700;
                    line-height: 1.3;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .news-summary {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 24px;
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
                    border-top: 1px solid var(--border-color);
                    padding-top: 16px;
                }

                .score-text {
                    font-size: 0.85rem;
                    color: var(--text-tertiary);
                    font-weight: 500;
                }

                .skeleton-card {
                    height: 300px;
                    background: linear-gradient(110deg, var(--bg-surface) 8%, var(--bg-app) 18%, var(--bg-surface) 33%);
                    background-size: 200% 100%;
                    animation: shine 1.5s linear infinite;
                }

                @keyframes shine {
                    to { background-position-x: -200%; }
                }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 48px;
                    text-align: center;
                    color: var(--text-secondary);
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    border: 1px dashed var(--border-color);
                }
            `}</style>
        </div>
    );
}
