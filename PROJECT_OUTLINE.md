# 🧭  — Project Outline

> **FinNews Proj** | Next.js 16 · Supabase · Yahoo Finance · Finnhub  
> Last updated: Feb 21, 2026

---

## ✅ Completed Features

### 1. Landing Page
- Premium glassmorphism design with animated gradient orbs
- Dark/Light theme toggle
- Hero section, feature cards, FAQ accordion
- HD typography with Inter + DM Sans fonts
- Responsive layout (mobile → 4K)

### 2. Dashboard (`/dashboard`)
- **Public** — no login required
- Real-time stock price cards (AMZN, META, AAPL)
- Interactive TradingView-style chart (Line / Candlestick / Area)
- Timeframe selector (1D → ALL)
- Active positions summary card
- News feed sidebar with sentiment analysis
- AI trade signal preview card
- Education/tips card

### 3. News Feed (`/news`)
- **Public** — no login required
- Live financial news via Finnhub API (with mock fallback)
- Sentiment analysis per article (Bullish / Bearish / Neutral)
- FinBERT AI integration (optional, via HuggingFace)
- Source attribution and timestamps

### 4. Paper Trading Simulator (`/simulator`)
- **🔒 Protected** — requires Google sign-in
- $100,000 virtual trading account
- 7 assets: AAPL, GOOGL, MSFT, TSLA, NVDA, BTC-USD, ETH-USD
- Live price data from Yahoo Finance
- BUY / SELL with leverage (1x → 100x)
- Stop Loss & Take Profit
- Positions table with live P&L
- Market open/close detection
- Account reset

### 5. AI Trade Signals (`/signals`)
- **🔒 Protected** — requires Google sign-in
- Parallel AI signal analysis across 7 stocks
- Technical indicators: RSI, MACD, SMA 20/50, EMA 12/26
- BUY / SELL / HOLD recommendations with confidence %
- Expandable cards with full reasoning + related news
- News articles with sentiment pills per stock

### 6. Authentication (Supabase)
- Google OAuth one-click sign-in
- Auth page with premium glassmorphism design
- OAuth callback handler with server-side session exchange
- `AuthGuard` component for route protection
- Navbar user avatar with dropdown (name, email, sign out)
- Blue "Sign In" button when logged out
- Session persistence via `onAuthStateChange`

### 7. UI / Layout System
- Responsive sidebar with mini-mode on mobile
- Breadcrumb-based navbar with theme toggle
- Dark / Light theme (CSS variables)
- Design tokens in `globals.css`
- Consistent card, badge, and button styles

---

## 🔧 Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout (fonts, providers)
│   ├── auth/
│   │   ├── page.tsx          # Google sign-in page
│   │   └── callback/route.ts # OAuth code exchange
│   ├── dashboard/page.tsx    # Main dashboard
│   ├── news/page.tsx         # News feed
│   ├── simulator/page.tsx    # Trading simulator (protected)
│   ├── signals/page.tsx      # AI signals (protected)
│   └── api/
│       ├── prices/           # Yahoo Finance price data
│       ├── news/             # Finnhub + mock news
│       ├── signals/          # AI signal generation
│       └── sentiment/        # Sentiment analysis
├── components/
│   ├── AuthGuard.tsx         # Route protection
│   ├── ActivePositionsCard.tsx
│   ├── TradingViewWidget.tsx
│   ├── Watchlist.tsx
│   ├── EducationCard.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Navbar.tsx        # User menu + breadcrumbs
│       ├── Sidebar.tsx       # Navigation
│       └── ClientLayout.tsx
├── context/
│   ├── AuthContext.tsx       # Supabase Google OAuth
│   ├── SimulatorContext.tsx  # Trading state management
│   ├── ThemeContext.tsx      # Dark/Light toggle
│   └── LayoutContext.tsx     # Sidebar state
├── lib/
│   ├── supabase.ts           # Browser client
│   ├── api.ts                # Yahoo Finance fetcher
│   ├── indicators.ts         # Technical indicators (RSI, MACD, SMA, EMA, Bollinger)
│   ├── signalGenerator.ts    # AI signal logic
│   ├── sentimentEngine.ts    # Local sentiment analysis
│   ├── market.ts             # Market hours detection
│   └── formatters.ts         # Price/time formatters
└── types/index.ts            # TypeScript definitions
```

---

## 📋 What's Left (Future Roadmap)

### Phase 1 — Data Persistence
- [ ] Save trade history to Supabase `trades` table
- [ ] Persist portfolio across sessions
- [ ] User-specific watchlist stored in DB

### Phase 2 — Enhanced Trading
- [ ] Limit orders & stop orders
- [ ] Trade notifications / alerts
- [ ] Portfolio analytics (Sharpe ratio, max drawdown, win streak)
- [ ] Trade journal with notes

### Phase 3 — Real-Time Features
- [ ] WebSocket live price streaming
- [ ] Push notifications for signal alerts
- [ ] Real-time P&L updates without refresh

### Phase 4 — Social & Community
- [ ] Public leaderboard (top traders by P&L)
- [ ] Share trade ideas / signals
- [ ] Copy trading from top performers

### Phase 5 — Production & Deployment
- [ ] Vercel deployment with environment variables
- [ ] Rate limiting on API routes
- [ ] Error monitoring (Sentry)
- [ ] SEO optimization + Open Graph meta tags
- [ ] PWA support (offline dashboard)
- [ ] Performance optimization (ISR, caching)

---

> Built with ❤️ by Aditya Nishad
