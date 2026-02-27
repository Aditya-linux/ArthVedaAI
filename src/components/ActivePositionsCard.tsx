'use client';

import React from 'react';
import Link from 'next/link';
import { useSimulator } from '@/context/SimulatorContext';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

export default function ActivePositionsCard() {
    const { state } = useSimulator();
    const { positions } = state;
    const activePositions = positions.slice(0, 3); // Show top 3

    if (positions.length === 0) {
        return (
            <div className="positions-card card">
                <div className="card-header">
                    <h3 className="section-title">My Positions</h3>
                </div>
                <div className="empty-state">
                    <p>No active positions.</p>
                    <Link href="/simulator" className="btn-start-trading">
                        Start Trading <ArrowRight size={16} />
                    </Link>
                </div>
                <style jsx>{`
                    .positions-card {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .section-title {
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: var(--text-primary);
                        margin: 0;
                    }
                    .empty-state {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 16px;
                        padding: 32px 24px;
                        text-align: center;
                        color: var(--text-secondary);
                        background: var(--bg-app);
                        border-radius: var(--radius-md);
                    }
                    .btn-start-trading {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        white-space: nowrap;
                        padding: 10px 24px;
                        background: var(--primary-blue);
                        color: white;
                        font-weight: 600;
                        font-size: 0.9rem;
                        text-decoration: none;
                        border-radius: var(--radius-full);
                        transition: all 0.2s;
                        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
                    }
                    .btn-start-trading:hover {
                        background: #2563eb;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="positions-card card">
            <div className="card-header">
                <h3 className="section-title">My Positions ({positions.length})</h3>
                <Link href="/simulator" className="view-all">
                    View All
                </Link>
            </div>

            <div className="positions-list">
                {activePositions.map(p => (
                    <div key={p.id} className="position-item">
                        <div className="pos-info">
                            <span className="symbol">{p.symbol}</span>
                            <span className={`side ${p.side.toLowerCase()}`}>{p.side}</span>
                        </div>
                        <div className="pos-metrics">
                            <div className="pnl-group">
                                <span className={`pnl ${p.pnl >= 0 ? 'pos' : 'neg'}`}>
                                    {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
                                </span>
                                <span className={`pnl-percent ${p.pnl >= 0 ? 'pos' : 'neg'}`}>
                                    ({p.pnlPercent.toFixed(2)}%)
                                </span>
                            </div>
                            <span className="price">
                                @ ${formatPrice(p.currentPrice)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .positions-card {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0;
                }
                .view-all {
                    font-size: 0.85rem;
                    color: var(--primary-blue);
                    font-weight: 500;
                    text-decoration: none;
                }
                .view-all:hover { text-decoration: underline; }

                .positions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .position-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                }

                .pos-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .symbol {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .side {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    text-transform: uppercase;
                }
                .side.buy { background: var(--green-bg); color: var(--green); }
                .side.sell { background: var(--red-bg); color: var(--red); }

                .pos-metrics {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .pnl-group {
                    display: flex;
                    gap: 6px;
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .pos { color: var(--green); }
                .neg { color: var(--red); }

                .price {
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                    margin-top: 2px;
                }
            `}</style>
        </div>
    );
}
