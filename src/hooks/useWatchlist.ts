import { useState, useEffect } from 'react';

const STORAGE_KEY = 'finnews_watchlist';

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse watchlist', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage whenever watchlist changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
        }
    }, [watchlist, isLoaded]);

    const addToWatchlist = (symbol: string) => {
        if (!watchlist.includes(symbol)) {
            setWatchlist(prev => [...prev, symbol]);
        }
    };

    const removeFromWatchlist = (symbol: string) => {
        setWatchlist(prev => prev.filter(s => s !== symbol));
    };

    const isWatched = (symbol: string) => watchlist.includes(symbol);

    return { watchlist, addToWatchlist, removeFromWatchlist, isWatched, isLoaded };
}
