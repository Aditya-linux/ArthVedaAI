'use client';

import React, { useEffect, useRef, memo } from 'react';

type TradingViewWidgetProps = {
    symbol: string;
};

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Clear previous widget
        container.current.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        // Map our symbols to TradingView symbols
        let tvSymbol = symbol;
        if (symbol === 'BTC-USD') tvSymbol = 'BINANCE:BTCUSDT';
        if (symbol === 'ETH-USD') tvSymbol = 'BINANCE:ETHUSDT';
        if (!tvSymbol.includes(':') && !['BTC-USD', 'ETH-USD'].includes(symbol)) {
            tvSymbol = `NASDAQ:${symbol}`; // Default to NASDAQ for stocks if not specified
        }

        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": tvSymbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tradingview_widget",
            "hide_side_toolbar": false,
            "studies": [
                "RSI@tv-basicstudies",
                "MASimple@tv-basicstudies"
            ],
            "show_popup_button": true,
            "popup_width": "1000",
            "popup_height": "650",
            "support_host": "https://www.tradingview.com"
        });

        container.current.appendChild(script);

    }, [symbol]);

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
            <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
        </div>
    );
}

export default memo(TradingViewWidget);
