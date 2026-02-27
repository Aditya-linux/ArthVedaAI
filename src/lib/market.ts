
export interface MarketStatus {
    isOpen: boolean;
    nextOpen?: Date;
    nextClose?: Date;
    message: string;
}

export function getMarketStatus(symbol: string): MarketStatus {
    // 1. Crypto is always open
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('-USD')) {
        return { isOpen: true, message: 'Market Open (24/7)' };
    }

    // 2. US Stock Market Rules (NYSE/NASDAQ)
    // Open: Mon-Fri 9:30 AM - 4:00 PM ET (America/New_York)

    const now = new Date();

    // Convert current time to ET
    const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = etTime.getDay(); // 0 = Sun, 6 = Sat
    const hour = etTime.getHours();
    const minute = etTime.getMinutes();
    const totalMinutes = hour * 60 + minute;

    const MARKET_OPEN_MINUTES = 9 * 60 + 30; // 9:30 AM = 570
    const MARKET_CLOSE_MINUTES = 16 * 60;    // 4:00 PM = 960

    // Check Weekend
    if (day === 0 || day === 6) {
        return { isOpen: false, message: 'Market Closed (Weekend)' };
    }

    // Check Hours
    if (totalMinutes >= MARKET_OPEN_MINUTES && totalMinutes < MARKET_CLOSE_MINUTES) {
        return { isOpen: true, message: 'Market Open' };
    }

    // Determine reason for closed
    if (totalMinutes < MARKET_OPEN_MINUTES) {
        return { isOpen: false, message: 'Market Closed (Pre-market)' };
    }

    return { isOpen: false, message: 'Market Closed (After-hours)' };
}
