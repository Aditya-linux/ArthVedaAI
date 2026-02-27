'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { ArrowUp, ArrowDown, RefreshCw, Star } from 'lucide-react';
import { useSimulator } from '@/context/SimulatorContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import Watchlist from '@/components/Watchlist';
import '@/app/globals.css';
import { formatPrice, formatPercent } from '@/lib/formatters';
import ActivePositionsCard from '@/components/ActivePositionsCard';
import { useLivePrices } from '@/hooks/useLivePrices';
import type { PriceData, TradeSignal, NewsArticle, Timeframe } from '@/types';

// Dynamic import for TradingViewWidget to avoid SSR issues
const TradingViewWidget = dynamic(
    () => import('@/components/TradingViewWidget'),
    { ssr: false }
);

const ASSETS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'BTC-USD', 'ETH-USD'];

function DashboardContent() {
    const searchParams = useSearchParams();
    const [symbol, setSymbol] = useState(searchParams.get('symbol') || 'AAPL');
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [signal, setSignal] = useState<TradeSignal | null>(null);
    const [loading, setLoading] = useState(true);
    const [priceData, setPriceData] = useState<PriceData | null>(null);

    const { addToWatchlist, removeFromWatchlist, isWatched, isLoaded } = useWatchlist();

    // Initial fetch for news and signals only. Chart fetches its own data.
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // We fetch simplified price data just for the header stats
            // The chart handles its own real-time data
            const [priceResp, newsResp, signalResp] = await Promise.all([
                fetch(`/api/prices?symbol=${symbol}&range=1D`),
                fetch(`/api/news?symbol=${symbol}&limit=5`),
                fetch(`/api/signals?symbol=${symbol}`),
            ]);

            const priceJson = await priceResp.json();
            const newsJson = await newsResp.json();
            const signalJson = await signalResp.json();

            setPriceData(priceJson);
            setNews(newsJson);
            setSignal(signalJson.error ? null : signalJson);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchData();
        // Polling interval (30s) for non-chart data updates (News, Signals)
        const intervalId = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [fetchData]);

    // WebSocket Live Pricing Integration
    const livePrices = useLivePrices([symbol]);
    useEffect(() => {
        if (livePrices[symbol] && priceData?.price !== livePrices[symbol]) {
            setPriceData(prev => prev ? { ...prev, price: livePrices[symbol] } : null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [livePrices]); // Only react to livePrices updates

    const currentPrice = priceData?.price;
    const priceChange = priceData?.changePercent ?? 0;
    const isPositive = priceChange >= 0;
    const isAssetWatched = isWatched(symbol);

    const toggleWatchlist = () => {
        if (isAssetWatched) {
            removeFromWatchlist(symbol);
        } else {
            addToWatchlist(symbol);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <header className="dashboard-header card">
                <div className="asset-info">
                    <div className="symbol-selector-wrapper">
                        <select
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}
                            className="symbol-selector"
                        >
                            {ASSETS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Watchlist Toggle */}
                    <button
                        className={`star-btn ${isAssetWatched ? 'active' : ''}`}
                        onClick={toggleWatchlist}
                        title={isAssetWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        disabled={!isLoaded}
                    >
                        <Star size={24} fill={isAssetWatched ? 'currentColor' : 'none'} />
                    </button>

                    <div className="price-info">
                        <h1 className="current-price">
                            {currentPrice ? formatPrice(currentPrice) : '---'}
                        </h1>
                        <div className={`change-badge ${isPositive ? 'positive' : 'negative'}`}>
                            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            {Math.abs(priceChange).toFixed(2)}%
                        </div>
                    </div>
                </div>
                <div className="controls">
                    <button onClick={fetchData} className="refresh-btn" title="Refresh Data">
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </header>

            <style jsx>{`
               .symbol-selector {
                   appearance: none;
                   background: var(--bg-app);
                   color: var(--text-primary);
                   font-weight: 700;
                   padding: 8px 16px;
                   padding-right: 32px; /* Space for chevron */
                   border-radius: var(--radius-md);
                   font-size: 1.5rem; /* Larger font for main symbol */
                   border: 1px solid var(--border-color);
                   cursor: pointer;
                   font-family: var(--font-sans);
                   background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                   background-repeat: no-repeat;
                   background-position: right 8px center;
                   background-size: 16px;
               }
               
               .symbol-selector:focus {
                   outline: 2px solid var(--primary-blue);
                   outline-offset: 2px;
               }

               .star-btn {
                   background: none;
                   border: none;
                   color: var(--text-tertiary);
                   cursor: pointer;
                   transition: all 0.2s;
                   padding: 8px;
                   border-radius: 50%;
               }

               .star-btn:hover {
                   background: var(--bg-surface);
                   color: var(--yellow);
               }

               .star-btn.active {
                   color: var(--yellow);
               }
            `}</style>


            {/* Main Content Grid */}
            <div className="content-grid">

                {/* Watchlist Panel (Left or collapsed) */}
                <div className="watchlist-panel card">
                    <Watchlist onSelect={setSymbol} currentSymbol={symbol} />
                </div>

                {/* Chart Card */}
                <div className="chart-card card" style={{ padding: 0, overflow: 'hidden', minHeight: '600px' }}>
                    <TradingViewWidget symbol={symbol} />
                </div>

                {/* Right Column */}
                <div className="right-column">
                    <ActivePositionsCard />

                    {/* Trade Signal Card */}
                    <div className="signal-card card">
                        <h3 className="section-title">AI Trade Signal</h3>
                        {signal ? (
                            <div className="signal-content">
                                <div className="signal-header">
                                    <div className={`signal-badge ${signal.type.toLowerCase()}`}>
                                        {signal.type}
                                    </div>
                                    <div className="confidence">
                                        {signal.confidence}% Confidence
                                    </div>
                                </div>

                                <div className="signal-targets">
                                    <div className="target-item">
                                        <span className="label">Target</span>
                                        <span className="value success">${formatPrice(signal.targetPrice)}</span>
                                    </div>
                                    <div className="target-item">
                                        <span className="label">Stop Loss</span>
                                        <span className="value danger">${formatPrice(signal.stopLoss)}</span>
                                    </div>
                                </div>

                                <div className="reasoning">
                                    <p>{signal.reasoning}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">Loading signal analysis...</div>
                        )}
                    </div>

                    {/* News/Intel Card */}
                    <div className="intel-card card">
                        <h3 className="section-title">Latest Intelligence</h3>
                        <div className="intel-list">
                            {news.slice(0, 5).map(n => (
                                <div key={n.id} className="intel-item">
                                    <span className={`sentiment-dot ${n.sentiment.label.toLowerCase()}`} />
                                    <div className="intel-content">
                                        <h4 className="intel-headline">{n.headline}</h4>
                                        <span className="intel-meta">
                                            {new Date(n.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.source}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {news.length === 0 && <div className="empty-state">No recent intel found.</div>}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    height: 100vh;
                    overflow-y: auto; /* Enable scroll for the container */
                }

                @media (max-width: 1024px) {
                    .dashboard-container {
                        height: auto;
                        min-height: 100vh;
                        overflow-y: visible;
                    }
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                }

                .asset-info {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .price-info {
                    display: flex;
                    align-items: baseline;
                    gap: 12px;
                }

                .current-price {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                    letter-spacing: -1px;
                }

                .change-badge {
                    display: flex;
                    align-items: center;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .change-badge.positive { background: var(--green-bg); color: var(--green); }
                .change-badge.negative { background: var(--red-bg); color: var(--red); }

                .controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .refresh-btn {
                    background: var(--bg-app);
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .refresh-btn:hover {
                    background: var(--bg-surface);
                    color: var(--primary-blue);
                    box-shadow: var(--shadow-soft);
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 16px;
                    }
                    
                    .asset-info {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .controls {
                        align-self: flex-end;
                    }
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 250px 1fr 350px;
                    gap: 24px;
                    flex: 1;
                    min-height: 0; /* Important for scroll */
                }

                @media (max-width: 1280px) {
                    .content-grid {
                        grid-template-columns: 220px 1fr 300px; /* Slightly tighter on medium screens */
                    }
                }

                @media (max-width: 1024px) {
                    .content-grid {
                        display: flex;
                        flex-direction: column;
                        min-height: auto; /* Allow full height scrolling on mobile */
                    }

                    .watchlist-panel {
                        order: 2; /* Move watchlist below chart */
                        max-height: 400px; /* Limit height */
                    }

                    .chart-card {
                        order: 1; /* Chart first */
                        min-height: 500px; /* Ensure good height for chart */
                    }

                    .right-column {
                        order: 3; /* Signals/News last */
                    }
                }

                .watchlist-panel {
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    padding: 16px;
                }

                .chart-card {
                    display: flex;
                    flex-direction: column;
                    /* padding removed for widget */
                }

                .right-column {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .signal-card, .intel-card {
                    display: flex;
                    flex-direction: column;
                    padding: 24px;
                }

                .signal-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .signal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .signal-badge {
                    padding: 6px 12px;
                    border-radius: var(--radius-sm);
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }

                .signal-badge.buy { background: var(--green-bg); color: var(--green); }
                .signal-badge.sell { background: var(--red-bg); color: var(--red); }
                .signal-badge.hold { background: var(--bg-tertiary); color: var(--text-secondary); }

                .confidence {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .signal-targets {
                    display: flex;
                    gap: 16px;
                    padding: 12px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                }

                .target-item {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .target-item .label {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .target-item .value {
                    font-weight: 700;
                    font-family: var(--font-mono);
                }

                .value.success { color: var(--green); }
                .value.danger { color: var(--red); }

                .reasoning {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .section-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }

                .intel-list {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding-right: 8px; /* Space for scrollbar */
                }

                .intel-item {
                    display: flex;
                    gap: 12px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .intel-item:last-child { border-bottom: none; }

                .sentiment-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-top: 6px;
                    flex-shrink: 0;
                }

                .sentiment-dot.bullish { background: var(--green); }
                .sentiment-dot.bearish { background: var(--red); }
                .sentiment-dot.neutral { background: var(--yellow); }

                .intel-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .intel-headline {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    line-height: 1.4;
                    margin: 0;
                }

                .intel-meta {
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                }
            `}</style>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
