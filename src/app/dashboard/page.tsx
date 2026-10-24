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
        <div className="dash">
            {/* Header */}
            <header className="dash-header">
                <div className="dash-header-left">
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="symbol-select"
                    >
                        {ASSETS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    <button
                        className={`star-btn ${isAssetWatched ? 'active' : ''}`}
                        onClick={toggleWatchlist}
                        title={isAssetWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        disabled={!isLoaded}
                    >
                        <Star size={20} fill={isAssetWatched ? 'currentColor' : 'none'} />
                    </button>

                    <div className="price-block">
                        <span className="price-value">
                            {currentPrice ? formatPrice(currentPrice) : '---'}
                        </span>
                        <span className={`price-change ${isPositive ? 'up' : 'down'}`}>
                            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            {Math.abs(priceChange).toFixed(2)}%
                        </span>
                    </div>
                </div>

                <button onClick={fetchData} className="refresh-btn" title="Refresh Data">
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                </button>
            </header>

            {/* Grid */}
            <div className="dash-grid">
                {/* Watchlist */}
                <aside className="dash-watchlist card">
                    <Watchlist onSelect={setSymbol} currentSymbol={symbol} />
                </aside>

                {/* Chart */}
                <div className="dash-chart card" style={{ padding: 0, overflow: 'hidden' }}>
                    <TradingViewWidget symbol={symbol} />
                </div>

                {/* Right Panel */}
                <div className="dash-right">
                    <ActivePositionsCard />

                    {/* Signal */}
                    <div className="card">
                        <h3 className="panel-title">AI Trade Signal</h3>
                        {signal ? (
                            <div className="signal-body">
                                <div className="signal-top">
                                    <span className={`signal-type ${signal.type.toLowerCase()}`}>
                                        {signal.type}
                                    </span>
                                    <span className="signal-conf">{signal.confidence}%</span>
                                </div>

                                <div className="signal-targets">
                                    <div className="target-col">
                                        <span className="target-label">Target</span>
                                        <span className="target-val green">${formatPrice(signal.targetPrice)}</span>
                                    </div>
                                    <div className="target-col">
                                        <span className="target-label">Stop Loss</span>
                                        <span className="target-val red">${formatPrice(signal.stopLoss)}</span>
                                    </div>
                                </div>

                                <p className="signal-reason">{signal.reasoning}</p>

                                {signal.prediction && (
                                    <div className="prediction-strip">
                                        <div className="pred-row">
                                            <span className="pred-label">NLP Prediction</span>
                                            <span className={`pred-val ${signal.prediction.directionalForecast === 'Bullish' ? 'green' : signal.prediction.directionalForecast === 'Bearish' ? 'red' : 'yellow'}`}>
                                                {signal.prediction.directionalForecast} ({signal.prediction.probability}%)
                                            </span>
                                        </div>
                                        <span className="pred-driver">{signal.prediction.nlpDriver}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="empty-msg">Loading signal analysis...</div>
                        )}
                    </div>

                    {/* News */}
                    <div className="card">
                        <h3 className="panel-title">Latest Intelligence</h3>
                        <div className="intel-list">
                            {news.slice(0, 5).map(n => (
                                <div key={n.id} className="intel-row">
                                    <span className={`dot ${n.sentiment.label.toLowerCase()}`} />
                                    <div className="intel-text">
                                        <span className="intel-headline">{n.headline}</span>
                                        <span className="intel-meta">
                                            {new Date(n.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -- {n.source}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {news.length === 0 && <div className="empty-msg">No recent intel found.</div>}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dash {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Header */
                .dash-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bg-surface);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                }

                .dash-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .symbol-select {
                    appearance: none;
                    background: var(--bg-app);
                    color: var(--text-primary);
                    font-weight: 700;
                    padding: 8px 32px 8px 12px;
                    border-radius: var(--radius-md);
                    font-size: 1.25rem;
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                    font-family: var(--font-sans);
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                    background-size: 14px;
                }

                .symbol-select:focus {
                    outline: 2px solid var(--primary-blue);
                    outline-offset: 1px;
                }

                .star-btn {
                    background: none;
                    border: none;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 50%;
                    transition: color 0.15s;
                    display: flex;
                }

                .star-btn.active { color: var(--yellow); }
                .star-btn:hover { color: var(--yellow); }

                .price-block {
                    display: flex;
                    align-items: baseline;
                    gap: 10px;
                }

                .price-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    letter-spacing: -0.5px;
                    font-family: var(--font-mono);
                }

                .price-change {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    padding: 3px 8px;
                    border-radius: var(--radius-full);
                    font-size: 0.813rem;
                    font-weight: 600;
                }

                .price-change.up { background: var(--green-bg); color: var(--green); }
                .price-change.down { background: var(--red-bg); color: var(--red); }

                .refresh-btn {
                    background: var(--bg-app);
                    border: 1px solid var(--border-color);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .refresh-btn:hover {
                    color: var(--primary-blue);
                    border-color: var(--primary-blue);
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* Grid */
                .dash-grid {
                    display: grid;
                    grid-template-columns: 220px 1fr 320px;
                    gap: 16px;
                }

                .dash-watchlist {
                    padding: 16px;
                    overflow: hidden;
                }

                .dash-chart {
                    min-height: 550px;
                }

                .dash-right {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Panel Titles */
                .panel-title {
                    font-size: 0.938rem;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--text-primary);
                }

                /* Signal */
                .signal-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .signal-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .signal-type {
                    padding: 4px 12px;
                    border-radius: var(--radius-sm);
                    font-weight: 700;
                    font-size: 0.813rem;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .signal-type.buy { background: var(--green-bg); color: var(--green); }
                .signal-type.sell { background: var(--red-bg); color: var(--red); }
                .signal-type.hold { background: var(--yellow-bg); color: var(--yellow); }

                .signal-conf {
                    font-size: 0.813rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .signal-targets {
                    display: flex;
                    gap: 12px;
                    padding: 10px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                }

                .target-col {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    gap: 2px;
                }

                .target-label {
                    font-size: 0.688rem;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                }

                .target-val {
                    font-weight: 700;
                    font-family: var(--font-mono);
                    font-size: 0.875rem;
                }

                .target-val.green { color: var(--green); }
                .target-val.red { color: var(--red); }

                .signal-reason {
                    font-size: 0.813rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0;
                }

                .prediction-strip {
                    padding: 10px 12px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                }

                .pred-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .pred-label {
                    font-size: 0.688rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--primary-blue);
                    letter-spacing: 0.03em;
                }

                .pred-val {
                    font-weight: 700;
                    font-size: 0.813rem;
                }

                .pred-val.green { color: var(--green); }
                .pred-val.red { color: var(--red); }
                .pred-val.yellow { color: var(--yellow); }

                .pred-driver {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                /* Intel */
                .intel-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .intel-row {
                    display: flex;
                    gap: 10px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border-color);
                }

                .intel-row:last-child { border-bottom: none; padding-bottom: 0; }

                .dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    margin-top: 7px;
                    flex-shrink: 0;
                }

                .dot.bullish { background: var(--green); }
                .dot.bearish { background: var(--red); }
                .dot.neutral { background: var(--yellow); }

                .intel-text {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    min-width: 0;
                }

                .intel-headline {
                    font-size: 0.813rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .intel-meta {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                }

                .empty-msg {
                    padding: 20px;
                    text-align: center;
                    color: var(--text-tertiary);
                    font-size: 0.875rem;
                }

                /* ── Responsive ── */
                @media (max-width: 1280px) {
                    .dash-grid {
                        grid-template-columns: 200px 1fr 280px;
                    }
                }

                @media (max-width: 1024px) {
                    .dash-grid {
                        display: flex;
                        flex-direction: column;
                    }

                    .dash-chart {
                        order: 1;
                        min-height: 400px;
                    }

                    .dash-watchlist {
                        order: 2;
                        max-height: 300px;
                    }

                    .dash-right {
                        order: 3;
                    }
                }

                @media (max-width: 640px) {
                    .dash-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                        padding: 12px 16px;
                    }

                    .dash-header-left {
                        flex-wrap: wrap;
                        gap: 10px;
                    }

                    .symbol-select {
                        font-size: 1rem;
                        padding: 6px 28px 6px 10px;
                    }

                    .price-value {
                        font-size: 1.25rem;
                    }

                    .refresh-btn {
                        align-self: flex-end;
                    }

                    .dash-chart {
                        min-height: 320px;
                    }
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
