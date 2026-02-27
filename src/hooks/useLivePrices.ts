import { useState, useEffect } from 'react';

// Shared global state for the Finnhub WebSocket to prevent rate-limit connection issues
let globalWs: WebSocket | null = null;
let connectionPromise: Promise<void> | null = null;
let subscribers = 0;
let globalPrices: { [symbol: string]: number } = {};

const priceListeners = new Set<(prices: { [symbol: string]: number }) => void>();

function notifyListeners() {
    priceListeners.forEach(listener => listener({ ...globalPrices }));
}

async function connectGlobalWs() {
    if (globalWs || connectionPromise) return connectionPromise;

    connectionPromise = (async () => {
        try {
            const res = await fetch('/api/ws-token');
            const { token } = await res.json();
            if (!token) return;

            const ws = new WebSocket(`wss://ws.finnhub.io?token=${token}`);
            globalWs = ws;

            ws.onopen = () => {
                console.log('Finnhub Global WebSocket Connected');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'trade') {
                    const priceUpdates: { [key: string]: number } = {};
                    data.data.forEach((trade: any) => {
                        let originalSymbol = trade.s;
                        if (originalSymbol === 'BINANCE:BTCUSDT') originalSymbol = 'BTC-USD';
                        if (originalSymbol === 'BINANCE:ETHUSDT') originalSymbol = 'ETH-USD';

                        priceUpdates[originalSymbol] = trade.p;
                        globalPrices[originalSymbol] = trade.p;
                    });

                    notifyListeners();
                }
            };

            ws.onclose = (event) => {
                console.log(`Finnhub Global WebSocket Disconnected (Code: ${event.code}, Reason: ${event.reason || 'None'})`);
                globalWs = null;
                connectionPromise = null;
                // Attempt reconnect if we still have active subscribers
                if (subscribers > 0) {
                    setTimeout(connectGlobalWs, 5000);
                }
            };

            ws.onerror = (error) => {
                console.error('Finnhub Global WebSocket Error. Connection failed.', error);
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close();
                }
            };
        } catch (error) {
            console.error('Failed to get WS token or connect globally', error);
            globalWs = null;
            connectionPromise = null;
        }
    })();

    return connectionPromise;
}

function subscribeToFinnhub(symbol: string) {
    if (!globalWs || globalWs.readyState !== WebSocket.OPEN) return;
    let finnHubSymbol = symbol;
    if (symbol === 'BTC-USD') finnHubSymbol = 'BINANCE:BTCUSDT';
    if (symbol === 'ETH-USD') finnHubSymbol = 'BINANCE:ETHUSDT';
    globalWs.send(JSON.stringify({ type: 'subscribe', symbol: finnHubSymbol }));
}

function unsubscribeFromFinnhub(symbol: string) {
    if (!globalWs || globalWs.readyState !== WebSocket.OPEN) return;
    let finnHubSymbol = symbol;
    if (symbol === 'BTC-USD') finnHubSymbol = 'BINANCE:BTCUSDT';
    if (symbol === 'ETH-USD') finnHubSymbol = 'BINANCE:ETHUSDT';
    try {
        globalWs.send(JSON.stringify({ type: 'unsubscribe', symbol: finnHubSymbol }));
    } catch (e) { }
}

export function useLivePrices(symbols: string[]) {
    const [prices, setPrices] = useState<{ [symbol: string]: number }>(globalPrices);

    useEffect(() => {
        const updateListener = (newPrices: { [symbol: string]: number }) => {
            setPrices(newPrices);
        };
        priceListeners.add(updateListener);
        setPrices(globalPrices);

        return () => {
            priceListeners.delete(updateListener);
        };
    }, []);

    useEffect(() => {
        if (symbols.length === 0) return;

        let isCancelled = false;
        subscribers++;

        const initConnection = async () => {
            await connectGlobalWs();
            if (isCancelled) return;

            // Wait until it's actually OPEN to send subscription packets
            if (globalWs?.readyState === WebSocket.OPEN) {
                symbols.forEach(subscribeToFinnhub);
            } else if (globalWs) {
                const onOpen = () => symbols.forEach(subscribeToFinnhub);
                globalWs.addEventListener('open', onOpen);
                return () => globalWs?.removeEventListener('open', onOpen);
            }
        };

        const cleanupSubscriptions = initConnection();

        return () => {
            isCancelled = true;
            subscribers--;

            // Clean up Finnhub subscriptions for the given symbols
            symbols.forEach(unsubscribeFromFinnhub);

            cleanupSubscriptions.then(cleanup => {
                if (typeof cleanup === 'function') cleanup();
            });

            // Close fully if no more subscribers are left
            if (subscribers <= 0 && globalWs) {
                if (globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING) {
                    globalWs.close();
                }
                globalWs = null;
                connectionPromise = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(symbols)]);

    return prices;
}
