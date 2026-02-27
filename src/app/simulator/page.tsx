'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { RotateCcw, Activity, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSimulator } from '@/context/SimulatorContext';
import AuthGuard from '@/components/AuthGuard';
import { formatPrice } from '@/lib/formatters';
import { getMarketStatus, type MarketStatus } from '@/lib/market';
import type { PriceData, OrderSide } from '@/types';
import { useLivePrices } from '@/hooks/useLivePrices';

// Dynamic import for TradingViewWidget
const TradingViewWidget = dynamic(
    () => import('@/components/TradingViewWidget'),
    { ssr: false }
);

const LEVERAGES = [1, 2, 5, 10, 25, 50, 100];
const ASSETS = [
    { s: 'AAPL', n: 'Apple Inc.' },
    { s: 'GOOGL', n: 'Alphabet Inc.' },
    { s: 'MSFT', n: 'Microsoft' },
    { s: 'TSLA', n: 'Tesla' },
    { s: 'NVDA', n: 'NVIDIA' },
    { s: 'BTC-USD', n: 'Bitcoin' },
    { s: 'ETH-USD', n: 'Ethereum' },
];

export default function SimulatorPage() {
    const { state, openPosition, closePosition, updatePrices, modifyPosition, resetAccount } = useSimulator();
    const [symbol, setSymbol] = useState('AAPL');
    const [priceData, setPriceData] = useState<PriceData | null>(null);
    const [side, setSide] = useState<OrderSide>('BUY');
    const [quantity, setQuantity] = useState(10);
    const [leverage, setLeverage] = useState(1);
    const [stopLoss, setStopLoss] = useState('');
    const [takeProfit, setTakeProfit] = useState('');
    const [marketStatus, setMarketStatus] = useState<MarketStatus>({ isOpen: true, message: '' });

    // 1. WebSocket Live Stream
    // Get unique symbols from open positions + the current selected symbol
    const symbolsToWatch = Array.from(new Set([...state.positions.map(p => p.symbol), symbol]));
    const livePrices = useLivePrices(symbolsToWatch);

    // Initial Fetch (for full PriceData struct like OHLCV/changes/history etc.)
    const fetchPriceData = useCallback(async () => {
        try {
            const resp = await fetch(`/api/prices?symbol=${symbol}&range=1D`);
            if (!resp.ok) return;
            const data = await resp.json();
            setPriceData(data);
        } catch (error) {
            console.error('Price fetch failed:', error);
        }
    }, [symbol]);

    // Update Market Status & Fetch Initial Data on Symbol Change
    useEffect(() => {
        fetchPriceData();
        setMarketStatus(getMarketStatus(symbol));
    }, [fetchPriceData, symbol]);

    // React to WebSocket updates: Update local priceData and global P&L Context
    useEffect(() => {
        if (Object.keys(livePrices).length === 0) return;

        // Update Global P&L
        const pricesArray = Object.entries(livePrices).map(([sym, price]) => ({ symbol: sym, price }));
        updatePrices(pricesArray);

        // Update local selected symbol price 
        if (livePrices[symbol] && priceData?.price !== livePrices[symbol]) {
            setPriceData(prev => prev ? { ...prev, price: livePrices[symbol] } : null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [livePrices]); // We only want to trigger this when new tick comes in

    const handlePlaceOrder = () => {
        if (!priceData || !marketStatus.isOpen) return;

        openPosition({
            symbol,
            side,
            orderType: 'MARKET',
            entryPrice: priceData.price,
            quantity,
            leverage,
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        });
        toast.success(`Successfully placed ${side} order for ${symbol}`);
        setStopLoss('');
        setTakeProfit('');
    };

    const marginRequired = priceData ? (quantity * priceData.price) / leverage : 0;
    const canAfford = marginRequired <= state.account.freeMargin;
    const isTradingDisabled = !marketStatus.isOpen || !priceData || !canAfford;

    return (
        <AuthGuard>
            <div className="simulator-page">
                <div className="header-row">
                    <div className="header-title">
                        <Activity size={24} className="icon-pulse" />
                        <h1>Paper Trading</h1>
                    </div>
                    <button className="btn-reset" onClick={resetAccount}>
                        <RotateCcw size={14} /> Reset Account
                    </button>
                </div>

                {/* 1. Account Overview Panel */}
                <div className="stats-panel card">
                    <div className="stat-item main-balance">
                        <span className="label">Total Balance</span>
                        <span className="value">${formatPrice(state.account.balance)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Equity</span>
                        <span className="value">${formatPrice(state.account.equity)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Total P&L</span>
                        <span className={`value ${state.account.totalPnL >= 0 ? 'pos' : 'neg'}`}>
                            {state.account.totalPnL >= 0 ? '+' : ''}${Math.abs(state.account.totalPnL).toFixed(2)}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Free Margin</span>
                        <span className="value">${formatPrice(state.account.freeMargin)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Win Rate</span>
                        <span className="value">{state.account.winRate.toFixed(1)}%</span>
                    </div>
                </div>

                {/* 2. Trading Section (Widget + Order Box) */}
                <div className="trading-section">
                    {/* Chart Widget */}
                    <div className="chart-box card" style={{ padding: 0, overflow: 'hidden', minHeight: '600px' }}>
                        <TradingViewWidget symbol={symbol} />
                    </div>

                    {/* Order Box */}
                    <div className="order-box card">
                        <h3 className="section-title">Trade Simulation</h3>

                        {/* Market Status Banner */}
                        <div className={`status-banner ${marketStatus.isOpen ? 'open' : 'closed'}`}>
                            {marketStatus.isOpen ? <Unlock size={14} /> : <Lock size={14} />}
                            {marketStatus.message}
                        </div>

                        <div className="asset-select">
                            <label className="input-label">Select Asset</label>
                            <select className="select-input" value={symbol} onChange={e => setSymbol(e.target.value)}>
                                {ASSETS.map(a => <option key={a.s} value={a.s}>{a.s} - {a.n}</option>)}
                            </select>
                        </div>

                        <div className="price-live">
                            <span className="label">Current Price</span>
                            <span className={`price ${priceData?.change && priceData.change >= 0 ? 'pos' : 'neg'}`}>
                                ${priceData ? formatPrice(priceData.price) : '---'}
                            </span>
                        </div>

                        <div className="tabs-capsule">
                            <button className={`cap-btn buy ${side === 'BUY' ? 'active' : ''}`} onClick={() => setSide('BUY')}>BUY</button>
                            <button className={`cap-btn sell ${side === 'SELL' ? 'active' : ''}`} onClick={() => setSide('SELL')}>SELL</button>
                        </div>

                        <div className="form-row">
                            <div className="field">
                                <label>Quantity</label>
                                <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                            </div>
                            <div className="field">
                                <label>Leverage</label>
                                <select value={leverage} onChange={e => setLeverage(Number(e.target.value))}>
                                    {LEVERAGES.map(l => <option key={l} value={l}>1:{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="margin-check">
                            <span>Required Margin: <strong>${formatPrice(marginRequired)}</strong></span>
                            {!canAfford && <span className="warning">Insufficient Funds</span>}
                        </div>

                        <button
                            className={`action-btn ${side === 'BUY' ? 'buy-btn' : 'sell-btn'}`}
                            onClick={handlePlaceOrder}
                            disabled={isTradingDisabled}
                            title={!marketStatus.isOpen ? 'Market is Closed' : 'Place Order'}
                        >
                            {!marketStatus.isOpen ? 'MARKET CLOSED' : `${side} ${symbol}`}
                        </button>
                    </div>
                </div>

                {/* 3. History & Positions */}
                <div className="history-section card">
                    <h3 className="section-title">Active Positions & History</h3>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Symbol</th>
                                    <th>Side</th>
                                    <th>Size</th>
                                    <th>Entry</th>
                                    <th>Current/Close</th>
                                    <th>P&L</th>
                                    <th>Action/Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...state.positions].reverse().map(p => (
                                    <tr key={p.id} className="row-open">
                                        <td>{new Date(p.openTime).toLocaleTimeString()}</td>
                                        <td><strong>{p.symbol}</strong></td>
                                        <td><span className={`badge ${p.side === 'BUY' ? 'b-buy' : 'b-sell'}`}>{p.side}</span></td>
                                        <td>{p.quantity}</td>
                                        <td>${p.entryPrice.toFixed(2)}</td>
                                        <td>${p.currentPrice.toFixed(2)}</td>
                                        <td className={p.pnl >= 0 ? 'pos' : 'neg'}>{p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}</td>
                                        <td>
                                            <div className="action-group">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => {
                                                        toast.custom(
                                                            (t) => (
                                                                <div className={`toast-modal ${t.visible ? 'animate-in' : 'animate-out'}`}>
                                                                    <div className="modal-header">
                                                                        <h4>Edit Orders: {p.symbol}</h4>
                                                                    </div>
                                                                    <form onSubmit={(e) => {
                                                                        e.preventDefault();
                                                                        const formData = new FormData(e.currentTarget);
                                                                        const sl = formData.get('sl') as string;
                                                                        const tp = formData.get('tp') as string;

                                                                        modifyPosition(
                                                                            p.id,
                                                                            sl ? parseFloat(sl) : (sl === '' ? null : undefined),
                                                                            tp ? parseFloat(tp) : (tp === '' ? null : undefined)
                                                                        );
                                                                        toast.dismiss(t.id);
                                                                        toast.success(`Updated orders for ${p.symbol}`);
                                                                    }}>
                                                                        <div className="modal-body">
                                                                            <div className="field">
                                                                                <label>Stop Loss (leave empty to remove)</label>
                                                                                <input name="sl" type="number" step="any" defaultValue={p.stopLoss?.toString() || ''} placeholder="e.g. 150.50" />
                                                                            </div>
                                                                            <div className="field">
                                                                                <label>Take Profit (leave empty to remove)</label>
                                                                                <input name="tp" type="number" step="any" defaultValue={p.takeProfit?.toString() || ''} placeholder="e.g. 180.00" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="modal-footer">
                                                                            <button type="button" className="btn-cancel" onClick={() => toast.dismiss(t.id)}>Cancel</button>
                                                                            <button type="submit" className="btn-submit">Save</button>
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                            ),
                                                            { duration: Infinity, position: 'top-center' }
                                                        );
                                                    }}
                                                    disabled={!marketStatus.isOpen}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-close"
                                                    onClick={() => {
                                                        closePosition(p.id, p.currentPrice);
                                                        toast.success(`Closed position for ${p.symbol}`);
                                                    }}
                                                    disabled={!marketStatus.isOpen}
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {[...state.history].reverse().map(h => (
                                    <tr key={h.id} className="row-history">
                                        <td>{new Date(h.closeTime).toLocaleTimeString()}</td>
                                        <td>{h.symbol}</td>
                                        <td><span className={`badge ${h.side === 'BUY' ? 'b-buy' : 'b-sell'}`}>{h.side}</span></td>
                                        <td>{h.quantity}</td>
                                        <td>${h.entryPrice.toFixed(2)}</td>
                                        <td>${h.closePrice.toFixed(2)}</td>
                                        <td className={h.pnl >= 0 ? 'pos' : 'neg'}>{h.pnl >= 0 ? '+' : ''}{h.pnl.toFixed(2)}</td>
                                        <td><span className="status-closed">CLOSED</span></td>
                                    </tr>
                                ))}
                                {state.positions.length === 0 && state.history.length === 0 && (
                                    <tr><td colSpan={8} className="empty-cell">No trading activity yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <style jsx>{`
                .simulator-page {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .header-title h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                }

                .icon-pulse { color: var(--primary-blue); }

                .btn-reset {
                    background: none;
                    border: 1px solid var(--border-color);
                    padding: 6px 12px;
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                /* Stats Panel */
                .stats-panel {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 24px;
                    padding: 24px 32px;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .stat-item .label {
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-item .value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    font-family: var(--font-mono);
                }

                .stat-item .value.pos { color: var(--green); }
                .stat-item .value.neg { color: var(--red); }

                /* Trading Section */
                .trading-section {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    min-height: 600px;
                }

                .chart-box {
                    display: flex;
                    flex-direction: column;
                    /* padding removed for widget */
                }

                .order-box {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 24px;
                }

                .status-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .status-banner.open {
                    background: var(--green-bg);
                    color: var(--green);
                }

                .status-banner.closed {
                    background: var(--red-bg);
                    color: var(--red);
                }

                .section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }

                .input-label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                    font-weight: 500;
                }

                .select-input, .field input, .field select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--bg-app);
                    color: var(--text-primary);
                    font-family: var(--font-sans);
                }

                .price-live {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                }
                
                .price-live .price {
                    font-size: 1.2rem;
                    font-weight: 700;
                }

                .price.pos { color: var(--green); }
                .price.neg { color: var(--red); }

                .tabs-capsule {
                    display: flex;
                    background: var(--bg-app);
                    padding: 4px;
                    border-radius: var(--radius-md);
                }

                .cap-btn {
                    flex: 1;
                    padding: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 700;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cap-btn.buy.active { background: var(--green-bg); color: var(--green); }
                .cap-btn.sell.active { background: var(--red-bg); color: var(--red); }

                .form-row {
                    display: flex;
                    gap: 12px;
                }

                .field { flex: 1; }

                .margin-check {
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                    display: flex;
                    justify-content: space-between;
                }

                .warning { color: var(--red); font-weight: 600; }

                .action-btn {
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: var(--radius-full);
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    color: white;
                    margin-top: auto;
                    transition: all 0.2s;
                }

                .buy-btn { background: var(--green); }
                .sell-btn { background: var(--red); }
                .action-btn:disabled { opacity: 0.5; cursor: not-allowed; background: var(--text-tertiary); }

                /* History Section */
                .history-section {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .data-table th {
                    text-align: left;
                    padding: 12px;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .data-table td {
                    padding: 12px;
                    border-bottom: 1px solid var(--border-color);
                    color: var(--text-primary);
                }
                
                .pos { color: var(--green);   font-weight: 600;}
                .neg { color: var(--red); font-weight: 600;}

                .badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                
                .b-buy { background: var(--green-bg); color: var(--green); }
                .b-sell { background: var(--red-bg); color: var(--red); }

                .btn-close {
                    padding: 4px 12px;
                    border: 1px solid var(--red);
                    background: var(--red-bg);
                    color: var(--red);
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .btn-close:hover:not(:disabled) {
                    background: var(--red-bg);
                    color: var(--red);
                    border-color: var(--red-bg);
                }
                
                .btn-close:disabled { opacity: 0.5; cursor: not-allowed; }

                .action-group {
                    display: flex;
                    gap: 8px;
                }

                .btn-edit {
                    padding: 4px 12px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-surface);
                    border-radius: 12px;
                    cursor: pointer;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .btn-edit:hover:not(:disabled) {
                    background: var(--bg-app);
                    color: var(--primary-blue);
                    border-color: var(--primary-blue);
                }

                .empty-cell { text-align: center; color: var(--text-tertiary); padding: 24px; }
                .status-closed { color: var(--text-tertiary); font-size: 0.8rem; }

                .table-responsive {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                @media (max-width: 1024px) {
                    .trading-section {
                        grid-template-columns: 1fr;
                        min-height: auto;
                    }
                    
                    .chart-box {
                        min-height: 450px !important;
                    }
                    
                    .stats-panel {
                        grid-template-columns: 1fr 1fr;
                        padding: 16px;
                    }
                    
                    .header-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    
                    .btn-reset {
                        width: 100%;
                        justify-content: center;
                    }
                }

                /* Toast Modal */
                :global(.toast-modal) {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    width: 350px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
                    pointer-events: auto;
                }
                :global(.modal-header h4) {
                    margin: 0 0 16px 0;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                }
                :global(.modal-body) {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                :global(.modal-footer) {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                :global(.btn-cancel) {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 600;
                }
                :global(.btn-submit) {
                    padding: 8px 16px;
                    background: var(--primary-blue);
                    border: none;
                    color: white;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 600;
                }
                :global(.toast-modal input) {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    background: var(--bg-app);
                    color: var(--text-primary);
                    margin-top: 4px;
                }
                :global(.toast-modal label) {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }
            `}</style>
            </div>
        </AuthGuard>
    );
}
