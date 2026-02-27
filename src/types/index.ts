// ============================================
// ArthVeda AI — Type Definitions
// ============================================

// --- Price & Chart ---
export interface OHLCV {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  history: OHLCV[];
}

export type Timeframe = '1D' | '5D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
export type ChartType = 'candlestick' | 'line' | 'area';

// --- News & Sentiment ---
export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
  relatedSymbols: string[];
  sentiment: SentimentResult;
}

export interface SentimentResult {
  score: number;       // -1.0 to +1.0
  comparative: number;
  label: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;  // 0 to 100
}

// --- Trade Signals ---
export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface TradeSignal {
  id: string;
  symbol: string;
  type: SignalType;
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  indicators: IndicatorSnapshot;
  timestamp: number;
}

export interface IndicatorSnapshot {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  sentiment: number;
}

// --- Trading Simulator ---
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED' | 'CLOSED';

export interface SimulatorAccount {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  totalPnL: number;
  totalTrades: number;
  winRate: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage: number;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number;
  pnlPercent: number;
  openTime: number;
  status: OrderStatus;
}

export interface TradeRecord extends Position {
  closePrice: number;
  closeTime: number;
  result: 'WIN' | 'LOSS';
}

// --- Asset ---
export type AssetCategory = 'stock' | 'crypto' | 'forex';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  exchange?: string;
}

// --- Indicators ---
export interface IndicatorConfig {
  sma: boolean;
  ema: boolean;
  rsi: boolean;
  macd: boolean;
  bollinger: boolean;
  volume: boolean;
  smaPeriod: number;
  emaPeriod: number;
}
