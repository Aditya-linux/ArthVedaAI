'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { formatPrice, formatPercent } from '@/lib/formatters';

interface WatchlistProps {
    onSelect: (symbol: string) => void;
    currentSymbol: string;
}

export default function Watchlist({ onSelect, currentSymbol }: WatchlistProps) {
    const { watchlist, removeFromWatchlist } = useWatchlist();
    const [quotes, setQuotes] = useState<{ symbol: string; price: number; change?: number; changePercent?: number }[]>([]);

    useEffect(() => {
        if (watchlist.length === 0) {
            setQuotes([]);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch basic quotes (price only) - we might need to enhance the API for change % later if needed,
                // but for now let's reuse the batch quote endpoint which returns basic price info.
                // NOTE: The current batch endpoint returns { symbol, price }. 
                // To get change %, we ideally need a richer endpoint, but let's start with price.
                const resp = await fetch(`/api/prices?symbols=${watchlist.join(',')}`);
                if (!resp.ok) return;
                const data = await resp.json();
                setQuotes(data);
            } catch (error) {
                console.error('Watchlist fetch error:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [watchlist]);

    if (watchlist.length === 0) {
        return (
            <div className="watchlist-empty">
                <Star size={24} className="text-secondary" />
                <p>Your watchlist is empty.</p>
                <span className="hint">Star assets to track them here.</span>
            </div>
        );
    }

    return (
        <div className="watchlist-container">
            <h3 className="watchlist-title">Watchlist</h3>
            <div className="watchlist-list">
                {watchlist.map(symbol => {
                    const quote = quotes.find(q => q.symbol === symbol);
                    return (
                        <div
                            key={symbol}
                            className={`watchlist-item ${symbol === currentSymbol ? 'active' : ''}`}
                            onClick={() => onSelect(symbol)}
                        >
                            <div className="item-info">
                                <span className="item-symbol">{symbol}</span>
                                <span className="item-price">
                                    {quote ? `$${formatPrice(quote.price)}` : 'Loading...'}
                                </span>
                            </div>
                            <button
                                className="btn-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromWatchlist(symbol);
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
            <style jsx>{`
                .watchlist-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }
                .watchlist-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .watchlist-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    overflow-y: auto;
                    flex: 1;
                }
                .watchlist-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .watchlist-item:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary-blue);
                }
                .watchlist-item.active {
                    background: var(--bg-hover);
                    border-color: var(--primary-blue);
                    box-shadow: 0 0 0 1px var(--primary-blue);
                }
                .item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .item-symbol {
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }
                .item-price {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-family: var(--font-mono);
                }
                .btn-remove {
                    padding: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s;
                    border-radius: 4px;
                }
                .watchlist-item:hover .btn-remove {
                    opacity: 1;
                }
                .btn-remove:hover {
                    background: var(--red-bg);
                    color: var(--red);
                }

                .watchlist-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px;
                    text-align: center;
                    color: var(--text-tertiary);
                    border: 1px dashed var(--border-color);
                    border-radius: var(--radius-md);
                    height: 150px;
                }
                .watchlist-empty p {
                    margin: 8px 0 4px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .watchlist-empty .hint {
                    font-size: 0.8rem;
                }
            `}</style>
        </div>
    );
}
