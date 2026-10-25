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

    // Edit modal state
    const [editingPosition, setEditingPosition] = useState<string | null>(null);
    const [editSL, setEditSL] = useState('');
    const [editTP, setEditTP] = useState('');

    const openEditModal = (posId: string, currentSL: number | null, currentTP: number | null) => {
        setEditingPosition(posId);
        setEditSL(currentSL?.toString() || '');
        setEditTP(currentTP?.toString() || '');
    };

    const handleEditSave = () => {
        if (!editingPosition) return;
        modifyPosition(
            editingPosition,
            editSL ? parseFloat(editSL) : (editSL === '' ? null : undefined),
            editTP ? parseFloat(editTP) : (editTP === '' ? null : undefined)
        );
        setEditingPosition(null);
        toast.success('Position updated');
    };

    return (
        <AuthGuard>
            <div className="sim">
                {/* Header */}
                <div className="sim-header">
                    <div className="sim-header-left">
                        <Activity size={20} className="icon-blue" />
                        <h1>Paper Trading</h1>
                    </div>
                    <button className="btn-reset" onClick={resetAccount}>
                        <RotateCcw size={14} /> Reset Account
                    </button>
                </div>

                {/* Account Stats */}
                <div className="stats-row">
                    <div className="stat-box main">
                        <span className="stat-label">Total Balance</span>
                        <span className="stat-val">${formatPrice(state.account.balance)}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Equity</span>
                        <span className="stat-val">${formatPrice(state.account.equity)}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Total P&L</span>
                        <span className={`stat-val ${state.account.totalPnL >= 0 ? 'green' : 'red'}`}>
                            {state.account.totalPnL >= 0 ? '+' : ''}${Math.abs(state.account.totalPnL).toFixed(2)}
                        </span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Free Margin</span>
                        <span className="stat-val">${formatPrice(state.account.freeMargin)}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Win Rate</span>
                        <span className="stat-val">{state.account.winRate.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Trading Area */}
                <div className="trade-area">
                    <div className="chart-panel card" style={{ padding: 0, overflow: 'hidden' }}>
                        <TradingViewWidget symbol={symbol} />
                    </div>

                    <div className="order-panel card">
                        <h3 className="panel-title">Trade Simulation</h3>

                        <div className={`status-bar ${marketStatus.isOpen ? 'open' : 'closed'}`}>
                            {marketStatus.isOpen ? <Unlock size={14} /> : <Lock size={14} />}
                            <span>{marketStatus.message}</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select Asset</label>
                            <select className="form-input" value={symbol} onChange={e => setSymbol(e.target.value)}>
                                {ASSETS.map(a => <option key={a.s} value={a.s}>{a.s} - {a.n}</option>)}
                            </select>
                        </div>

                        <div className="live-price-row">
                            <span className="form-label">Current Price</span>
                            <span className={`live-price ${priceData?.change && priceData.change >= 0 ? 'green' : 'red'}`}>
                                ${priceData ? formatPrice(priceData.price) : '---'}
                            </span>
                        </div>

                        <div className="side-toggle">
                            <button className={`side-btn buy ${side === 'BUY' ? 'active' : ''}`} onClick={() => setSide('BUY')}>BUY</button>
                            <button className={`side-btn sell ${side === 'SELL' ? 'active' : ''}`} onClick={() => setSide('SELL')}>SELL</button>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Quantity</label>
                                <input className="form-input" type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Leverage</label>
                                <select className="form-input" value={leverage} onChange={e => setLeverage(Number(e.target.value))}>
                                    {LEVERAGES.map(l => <option key={l} value={l}>1:{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="margin-info">
                            <span>Required Margin: <strong>${formatPrice(marginRequired)}</strong></span>
                            {!canAfford && <span className="warn">Insufficient Funds</span>}
                        </div>

                        <button
                            className={`place-btn ${side === 'BUY' ? 'buy' : 'sell'}`}
                            onClick={handlePlaceOrder}
                            disabled={isTradingDisabled}
                        >
                            {!marketStatus.isOpen ? 'Market Closed (Weekend)' : `${side} ${symbol}`}
                        </button>
                    </div>
                </div>

                {/* Edit Modal */}
                {editingPosition && (
                    <div className="modal-overlay" onClick={() => setEditingPosition(null)}>
                        <div className="modal-box" onClick={e => e.stopPropagation()}>
                            <h4 className="modal-title">Edit Stop Loss / Take Profit</h4>
                            <div className="modal-form">
                                <div className="form-group">
                                    <label className="form-label">Stop Loss (empty to remove)</label>
                                    <input className="form-input" type="number" step="any" value={editSL} onChange={e => setEditSL(e.target.value)} placeholder="e.g. 150.50" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Take Profit (empty to remove)</label>
                                    <input className="form-input" type="number" step="any" value={editTP} onChange={e => setEditTP(e.target.value)} placeholder="e.g. 180.00" />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn cancel" onClick={() => setEditingPosition(null)}>Cancel</button>
                                <button className="modal-btn save" onClick={handleEditSave}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Positions / History Table */}
                <div className="card history-section">
                    <h3 className="panel-title">Active Positions & History</h3>
                    <div className="table-wrap">
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
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...state.positions].reverse().map(p => (
                                    <tr key={p.id}>
                                        <td>{new Date(p.openTime).toLocaleTimeString()}</td>
                                        <td><strong>{p.symbol}</strong></td>
                                        <td><span className={`side-tag ${p.side === 'BUY' ? 'buy' : 'sell'}`}>{p.side}</span></td>
                                        <td>{p.quantity}</td>
                                        <td className="mono">${p.entryPrice.toFixed(2)}</td>
                                        <td className="mono">${p.currentPrice.toFixed(2)}</td>
                                        <td className={p.pnl >= 0 ? 'green' : 'red'}>{p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="act-btn edit"
                                                    onClick={() => openEditModal(p.id, p.stopLoss, p.takeProfit)}
                                                    disabled={!marketStatus.isOpen}
                                                >Edit</button>
                                                <button
                                                    className="act-btn close"
                                                    onClick={() => {
                                                        closePosition(p.id, p.currentPrice);
                                                        toast.success(`Closed position for ${p.symbol}`);
                                                    }}
                                                    disabled={!marketStatus.isOpen}
                                                >Close</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {[...state.history].reverse().map(h => (
                                    <tr key={h.id} className="row-closed">
                                        <td>{new Date(h.closeTime).toLocaleTimeString()}</td>
                                        <td>{h.symbol}</td>
                                        <td><span className={`side-tag ${h.side === 'BUY' ? 'buy' : 'sell'}`}>{h.side}</span></td>
                                        <td>{h.quantity}</td>
                                        <td className="mono">${h.entryPrice.toFixed(2)}</td>
                                        <td className="mono">${h.closePrice.toFixed(2)}</td>
                                        <td className={h.pnl >= 0 ? 'green' : 'red'}>{h.pnl >= 0 ? '+' : ''}{h.pnl.toFixed(2)}</td>
                                        <td><span className="closed-tag">CLOSED</span></td>
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
                    .sim {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }

                    .sim-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 12px;
                    }

                    .sim-header-left {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }

                    .sim-header-left h1 {
                        font-size: 1.25rem;
                        font-weight: 700;
                        margin: 0;
                    }

                    .icon-blue { color: var(--primary-blue); }

                    .btn-reset {
                        background: none;
                        border: 1px solid var(--border-color);
                        padding: 6px 14px;
                        border-radius: var(--radius-full);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 0.813rem;
                        color: var(--text-secondary);
                        font-family: var(--font-sans);
                        transition: border-color 0.15s;
                    }

                    .btn-reset:hover { border-color: var(--text-tertiary); }

                    /* Stats */
                    .stats-row {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                        gap: 12px;
                    }

                    .stat-box {
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        padding: 14px 16px;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                    }

                    .stat-label {
                        font-size: 0.688rem;
                        color: var(--text-tertiary);
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.04em;
                    }

                    .stat-val {
                        font-size: 1.125rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        font-family: var(--font-mono);
                    }

                    .stat-val.green,
                    .stat-val.red {
                        color: var(--text-primary) !important;
                    }

                    /* Trade Area */
                    .trade-area {
                        display: grid;
                        grid-template-columns: 1fr 340px;
                        gap: 16px;
                        min-height: 500px;
                    }

                    .chart-panel {
                        min-height: 500px;
                    }

                    .order-panel {
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                    }

                    .panel-title {
                        font-size: 0.938rem;
                        font-weight: 700;
                        color: var(--text-primary);
                        margin: 0;
                    }

                    .status-bar {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        padding: 8px 12px;
                        border-radius: var(--radius-sm);
                        font-size: 0.75rem;
                        font-weight: 600;
                    }

                    .status-bar.open {
                        background: #FFFFFF;
                        color: #000000 !important;
                        border: 1px solid #FFFFFF;
                    }
                    .status-bar.closed {
                        background: rgba(255, 255, 255, 0.06);
                        color: #FFFFFF !important;
                        border: 1px solid var(--border-color);
                    }
                    [data-theme='light'] .status-bar.open {
                        background: #000000;
                        color: #FFFFFF !important;
                    }
                    [data-theme='light'] .status-bar.closed {
                        background: rgba(0, 0, 0, 0.06);
                        color: #000000 !important;
                    }

                    .form-group { display: flex; flex-direction: column; gap: 4px; }

                    .form-label {
                        font-size: 0.75rem;
                        color: var(--text-secondary);
                        font-weight: 500;
                    }

                    .form-input {
                        width: 100%;
                        padding: 8px 10px;
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-md);
                        background: var(--bg-app);
                        color: var(--text-primary);
                        font-family: var(--font-sans);
                        font-size: 0.875rem;
                    }

                    .form-input:focus {
                        outline: 2px solid var(--text-primary);
                        outline-offset: 1px;
                    }

                    .live-price-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px 12px;
                        background: var(--bg-app);
                        border-radius: var(--radius-md);
                        border: 1px solid var(--border-color);
                    }

                    .live-price {
                        font-size: 1.125rem;
                        font-weight: 700;
                        font-family: var(--font-mono);
                        color: var(--text-primary) !important;
                    }

                    .live-price.green,
                    .live-price.red {
                        color: var(--text-primary) !important;
                    }

                    .side-toggle {
                        display: flex;
                        background: var(--bg-app);
                        padding: 3px;
                        border-radius: var(--radius-md);
                        gap: 3px;
                        border: 1px solid var(--border-color);
                    }

                    .side-btn {
                        flex: 1;
                        padding: 8px;
                        border: none;
                        background: transparent;
                        color: var(--text-secondary);
                        font-weight: 700;
                        border-radius: var(--radius-sm);
                        cursor: pointer;
                        transition: all 0.15s;
                        font-size: 0.813rem;
                        font-family: var(--font-sans);
                    }

                    .side-btn.buy.active {
                        background: #FFFFFF;
                        color: #000000 !important;
                    }
                    .side-btn.sell.active {
                        background: rgba(255, 255, 255, 0.12);
                        color: #FFFFFF !important;
                        border: 1px solid rgba(255, 255, 255, 0.22);
                    }
                    [data-theme='light'] .side-btn.buy.active {
                        background: #000000;
                        color: #FFFFFF !important;
                    }
                    [data-theme='light'] .side-btn.sell.active {
                        background: rgba(0, 0, 0, 0.1);
                        color: #000000 !important;
                    }

                    .form-row { display: flex; gap: 10px; }
                    .form-row > .form-group { flex: 1; }

                    .margin-info {
                        font-size: 0.75rem;
                        color: var(--text-tertiary);
                        display: flex;
                        justify-content: space-between;
                    }

                    .warn { color: var(--text-primary); font-weight: 600; text-decoration: underline; }

                    .place-btn {
                        width: 100%;
                        padding: 12px;
                        border: none;
                        border-radius: var(--radius-md);
                        font-size: 0.875rem;
                        font-weight: 700;
                        cursor: pointer;
                        margin-top: auto;
                        transition: all 0.15s ease;
                        font-family: var(--font-sans);
                    }

                    .place-btn.buy {
                        background: #FFFFFF;
                        color: #000000 !important;
                        border: 1px solid #FFFFFF;
                    }
                    .place-btn.sell {
                        background: rgba(255, 255, 255, 0.12);
                        color: #FFFFFF !important;
                        border: 1px solid rgba(255, 255, 255, 0.25);
                    }
                    [data-theme='light'] .place-btn.buy {
                        background: #000000;
                        color: #FFFFFF !important;
                    }
                    [data-theme='light'] .place-btn.sell {
                        background: rgba(0, 0, 0, 0.1);
                        color: #000000 !important;
                    }
                    .place-btn:hover:not(:disabled) {
                        opacity: 0.9;
                        transform: scale(0.99);
                    }
                    .place-btn:disabled { 
                        opacity: 1 !important; 
                        cursor: not-allowed !important; 
                        background: rgba(255, 255, 255, 0.08) !important; 
                        color: rgba(255, 255, 255, 0.5) !important;
                        border: 1px solid rgba(255, 255, 255, 0.12) !important;
                        font-weight: 600;
                    }
                    [data-theme='light'] .place-btn:disabled {
                        background: rgba(0, 0, 0, 0.05) !important;
                        color: rgba(0, 0, 0, 0.4) !important;
                        border: 1px solid rgba(0, 0, 0, 0.1) !important;
                    }

                    /* Modal */
                    .modal-overlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 1000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 16px;
                    }

                    .modal-box {
                        background: var(--bg-surface);
                        border: 1px solid var(--border-color);
                        border-radius: var(--radius-lg);
                        padding: 24px;
                        width: 100%;
                        max-width: 380px;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }

                    .modal-title {
                        font-size: 1rem;
                        font-weight: 700;
                        margin: 0 0 16px 0;
                        color: var(--text-primary);
                    }

                    .modal-form {
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        margin-bottom: 20px;
                    }

                    .modal-actions {
                        display: flex;
                        justify-content: flex-end;
                        gap: 8px;
                    }

                    .modal-btn {
                        padding: 8px 16px;
                        border-radius: var(--radius-md);
                        font-weight: 600;
                        font-size: 0.813rem;
                        cursor: pointer;
                        font-family: var(--font-sans);
                    }

                    .modal-btn.cancel {
                        background: transparent;
                        border: 1px solid var(--border-color);
                        color: var(--text-secondary);
                    }

                    .modal-btn.save {
                        background: var(--text-primary);
                        border: 1px solid var(--text-primary);
                        color: var(--bg-app);
                        font-weight: 600;
                    }

                    /* History */
                    .history-section { overflow: hidden; }

                    .table-wrap {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }

                    .data-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.813rem;
                        min-width: 700px;
                    }

                    .data-table th {
                        text-align: left;
                        padding: 10px 12px;
                        border-bottom: 2px solid var(--border-color);
                        color: var(--text-secondary);
                        font-weight: 600;
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 0.03em;
                    }

                    .data-table td {
                        padding: 10px 12px;
                        border-bottom: 1px solid var(--border-color);
                        color: var(--text-primary);
                    }

                    .mono { font-family: var(--font-mono); }
                    .green, .red { color: var(--text-primary) !important; font-weight: 600; }

                    .side-tag {
                        padding: 2px 8px;
                        border-radius: var(--radius-full);
                        font-size: 0.688rem;
                        font-weight: 700;
                    }

                    .side-tag.buy {
                        background: #FFFFFF;
                        color: #000000 !important;
                        border: 1px solid #FFFFFF;
                    }
                    .side-tag.sell {
                        background: rgba(255, 255, 255, 0.1);
                        color: #FFFFFF !important;
                        border: 1px solid rgba(255, 255, 255, 0.25);
                    }
                    [data-theme='light'] .side-tag.buy {
                        background: #000000;
                        color: #FFFFFF !important;
                    }
                    [data-theme='light'] .side-tag.sell {
                        background: rgba(0, 0, 0, 0.08);
                        color: #000000 !important;
                    }

                    .action-btns { display: flex; gap: 6px; }

                    .act-btn {
                        padding: 4px 10px;
                        border-radius: var(--radius-sm);
                        font-size: 0.688rem;
                        font-weight: 600;
                        cursor: pointer;
                        font-family: var(--font-sans);
                        transition: opacity 0.15s;
                    }

                    .act-btn.edit {
                        border: 1px solid var(--border-color);
                        background: var(--bg-surface);
                        color: var(--text-secondary);
                    }

                    .act-btn.close {
                        border: 1px solid var(--border-color);
                        background: rgba(255, 255, 255, 0.08);
                        color: var(--text-primary);
                    }
                    [data-theme='light'] .act-btn.close {
                        background: rgba(0, 0, 0, 0.05);
                        color: #000000;
                    }

                    .act-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                    .closed-tag {
                        font-size: 0.688rem;
                        color: var(--text-tertiary);
                        font-weight: 500;
                    }

                    .row-closed td { opacity: 0.6; }

                    .empty-cell {
                        text-align: center;
                        color: var(--text-tertiary);
                        padding: 24px;
                    }

                    /* Responsive */
                    @media (max-width: 1024px) {
                        .trade-area {
                            grid-template-columns: 1fr;
                        }

                        .chart-panel {
                            min-height: 380px;
                        }
                    }

                    @media (max-width: 768px) {
                        .stats-row {
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                        }

                        .stat-box.main {
                            grid-column: 1 / -1;
                        }

                        .stat-box {
                            padding: 10px 14px;
                        }

                        .stat-val {
                            font-size: 1.05rem;
                        }

                        .sim-header {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 8px;
                        }

                        .btn-reset {
                            width: 100%;
                            justify-content: center;
                        }

                        .form-input {
                            padding: 10px 12px;
                            font-size: 0.938rem;
                        }

                        .side-btn {
                            padding: 10px;
                            font-size: 0.875rem;
                        }

                        .place-btn {
                            padding: 14px;
                            font-size: 0.938rem;
                        }
                    }

                    @media (max-width: 480px) {
                        .form-row {
                            flex-direction: column;
                        }
                    }
                `}</style>
            </div>
        </AuthGuard>
    );
}
