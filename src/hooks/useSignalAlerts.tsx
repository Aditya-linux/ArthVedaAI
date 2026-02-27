import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useWatchlist } from './useWatchlist';
import type { TradeSignal } from '../types';

export function useSignalAlerts() {
    const { watchlist, isLoaded } = useWatchlist();
    const lastNotified = useRef<Record<string, number>>({});

    useEffect(() => {
        if (!isLoaded || watchlist.length === 0) return;

        const checkSignals = async () => {
            for (const symbol of watchlist) {
                try {
                    const res = await fetch(`/api/signals?symbol=${symbol}`);
                    if (!res.ok) continue;
                    const signal: TradeSignal = await res.json();

                    // Only alert on high confidence signals
                    if (signal.confidence >= 80) {
                        const now = Date.now();
                        const lastTime = lastNotified.current[symbol] || 0;

                        // Only notify once every 1 hour per symbol to prevent spam
                        if (now - lastTime > 60 * 60 * 1000) {
                            lastNotified.current[symbol] = now;

                            toast.custom((t) => (
                                <div
                                    className={`toast-modal cursor-pointer ${t.visible ? 'animate-in' : 'animate-out'}`}
                                    onClick={() => toast.dismiss(t.id)}
                                >
                                    <div className="modal-header flex items-center justify-between !mb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="px-2 py-1 rounded text-xs font-bold"
                                                style={{
                                                    backgroundColor: signal.type === 'BUY' ? 'var(--green-bg)' : signal.type === 'SELL' ? 'var(--red-bg)' : 'rgba(234, 179, 8, 0.1)',
                                                    color: signal.type === 'BUY' ? 'var(--green)' : signal.type === 'SELL' ? 'var(--red)' : '#EAB308'
                                                }}
                                            >
                                                {signal.type}
                                            </span>
                                            <span className="font-bold text-lg">{symbol}</span>
                                        </div>
                                        <span className="text-[var(--primary-blue)] font-bold">{signal.confidence}% Match</span>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] m-0 line-clamp-2">
                                        {signal.reasoning.substring(0, 100)}...
                                    </p>
                                </div>
                            ), { duration: 8000, position: 'top-right' });
                        }
                    }
                } catch (e) {
                    console.error('Failed to fetch signal for alert', e);
                }
            }
        };

        const interval = setInterval(checkSignals, 60000); // Check every minute
        // Small delay for initial check to avoid spamming on mount
        const timeout = setTimeout(checkSignals, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [watchlist, isLoaded]);
}
