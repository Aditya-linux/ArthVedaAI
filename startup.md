# ArthVeda AI — Future Implementation Roadmap

> Resume guide for polishing the platform into a portfolio-grade product.

---

## ⚡ Tomorrow's Session Priorities (Feb 14)

### 1. Fix Dark / Light Mode
- [ ] Add complete light theme CSS variables (backgrounds, borders, text colors)
- [ ] Fix ThemeContext to persist preference in localStorage
- [ ] Ensure all components respect `data-theme` attribute on toggle
- [ ] Test toggle on every page — dashboard charts need dynamic re-theming

### 2. Implement FinBERT AI Sentiment Model
- [ ] Set up Python FastAPI microservice for FinBERT inference
- [ ] Use HuggingFace `ProsusAI/finbert` model (pre-trained for financial text)
- [ ] Create `/api/finbert` proxy route in Next.js to call the Python service
- [ ] Replace keyword-based sentiment engine with FinBERT scores
- [ ] Display model confidence + positive/negative/neutral probabilities per article
- [ ] Fallback: keep keyword engine if Python service is unavailable

### 3. Polish Web Design
- [ ] Improve landing page — add animated stats counters, testimonial section
- [ ] Dashboard — add gradient header bar per asset, smoother card transitions
- [ ] Simulator — add position row animations (slide-in on open, fade on close)
- [ ] News — add image thumbnails for articles, hover card expansion
- [ ] Signals — add signal strength meter (radial gauge), trend arrows
- [ ] Global — refine spacing, shadows, border-radius consistency across all cards

---

## 🔑 APIs Required

| API | Purpose | Free Tier | Key Required | Link |
|-----|---------|-----------|-------------|------|
| **Yahoo Finance** (`yahoo-finance2`) | Stock/crypto/forex price data & charts | ✅ Unlimited | ❌ No key | [npm](https://www.npmjs.com/package/yahoo-finance2) |
| **Finnhub** | Financial news articles | ✅ 60 calls/min | ✅ Yes | [finnhub.io](https://finnhub.io/register) |
| **Alpha Vantage** (alt) | News + fundamentals (alternative to Finnhub) | ✅ 25 calls/day | ✅ Yes | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |
| **HuggingFace** (FinBERT) | AI sentiment analysis model | ✅ Free inference API | ✅ Yes (token) | [huggingface.co](https://huggingface.co/ProsusAI/finbert) |
| **NewsAPI** (optional) | General financial news aggregation | ✅ 100 calls/day | ✅ Yes | [newsapi.org](https://newsapi.org/register) |

### `.env.local` template
```env
# Required for live news (pick one)
FINNHUB_API_KEY=your_finnhub_key

# Optional — for FinBERT AI sentiment
HUGGINGFACE_API_TOKEN=your_hf_token

# Optional — alternative news source
ALPHA_VANTAGE_API_KEY=your_av_key
NEWS_API_KEY=your_newsapi_key
```

---

## 🚀 Project Setup & Run Guide

### Prerequisites
- **Node.js** 18+ installed
- **Python 3.9+** (only if running FinBERT locally)
- **npm** package manager

### Quick Start
```bash
# 1. Navigate to project
cd "c:\Users\Aditya\OneDrive\Desktop\Projects\FinNews Proj"

# 2. Install dependencies (already done)
npm install

# 3. Create environment file
copy NUL .env.local
# Add your API keys (see template above)

# 4. Start dev server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Running FinBERT Service (after implementation)
```bash
# In a separate terminal
cd finbert-service
pip install fastapi uvicorn transformers torch
python main.py
# Runs on http://localhost:8000
```

### Pages
| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/dashboard` | TradingView-style dashboard |
| `http://localhost:3000/simulator` | Paper trading simulator |
| `http://localhost:3000/news` | News & sentiment feed |
| `http://localhost:3000/signals` | AI trade signals |

---

## 🎨 UI / Visual Polish (Future)

- [ ] **Light theme support** — complete light mode color variables (currently dark-only)
- [ ] **Mobile responsive sidebar** — hamburger menu toggle for tablets/phones
- [ ] **Chart drawing tools** — trendlines, horizontal lines, Fibonacci retracement overlays
- [ ] **Micro-animations** — number count-up on P&L changes, position row slide-in on open
- [ ] **Custom cursors / tooltips** — crosshair data labels on chart hover
- [ ] **Favicon & Open Graph meta** — branded favicon, social preview card
- [ ] **404 page** — styled not-found page matching the design system
- [ ] **Loading states** — skeleton loaders for every data-dependent section (some exist, add more)

---

## 📊 Dashboard Enhancements

- [ ] **Multi-chart layout** — split view (2 or 4 charts side by side)
- [ ] **Chart type toggle** — switch between candlestick, line, and area chart
- [ ] **More indicators** — RSI sub-chart, MACD sub-chart, Bollinger Bands overlay
- [ ] **Indicator settings panel** — adjustable periods (SMA 10/20/50/200, RSI 7/14/21)
- [ ] **Price alerts** — set alerts at specific price levels (browser notifications)
- [ ] **Real-time WebSocket data** — live tick updates instead of polling every 30s
- [ ] **Market overview widget** — top gainers/losers, sector heatmap

---

## 🤖 AI & Signals

- [ ] **Gemini / OpenAI integration** — LLM-powered signal reasoning with natural language explanations
- [ ] **Signal backtesting** — run historical accuracy analysis on past signals
- [ ] **Signal accuracy tracker** — track win/loss of past signals over time
- [ ] **Multi-timeframe signals** — generate signals for different timeframes (scalp, swing, position)
- [ ] **Sentiment trend chart** — line chart showing sentiment score over last 7/30 days
- [ ] **Custom scoring weights** — let users adjust RSI/MACD/sentiment weights in signal generation

---

## 💹 Trading Simulator

- [ ] **Pending orders** — limit and stop orders that execute when price is hit
- [ ] **Trailing stop loss** — auto-adjusting SL that follows price
- [ ] **Position sizing calculator** — risk % based lot size calculation
- [ ] **Equity curve chart** — historical equity line chart in account summary
- [ ] **Multi-asset portfolio** — track P&L across all held positions visually
- [ ] **Trade journal** — notes/tags per trade for review
- [ ] **Export trades** — download trade history as CSV
- [ ] **Persistent state** — save account/positions to localStorage so data survives refresh

---

## 📰 News & Sentiment

- [ ] **Live news websocket** — real-time article stream instead of on-demand fetch
- [ ] **Sentiment heatmap** — visual grid of sentiment across multiple assets
- [ ] **Article detail modal** — click article to expand with full summary + sentiment breakdown
- [ ] **Multiple news sources** — aggregate from Finnhub, Alpha Vantage, NewsAPI
- [ ] **Keyword cloud** — word cloud visualization of most frequent financial terms
- [ ] **User watchlist sentiment** — aggregate sentiment only for user's watchlisted assets

---

## 🔧 Technical Improvements

- [ ] **Environment variable validation** — startup check for required API keys
- [ ] **API rate limiting** — client-side throttling to avoid hitting API limits
- [ ] **Error boundaries** — React error boundary components per section
- [ ] **Data caching** — SWR or React Query for smart client-side caching + revalidation
- [ ] **TypeScript strict mode** — enable strict in tsconfig, fix all type issues
- [ ] **Unit tests** — Jest/Vitest tests for indicator calculations and sentiment engine
- [ ] **E2E tests** — Playwright tests for critical user flows

---

## 🚀 Deployment & Production

- [ ] **Vercel deployment** — deploy to Vercel with environment variables
- [ ] **SEO optimization** — per-page titles, descriptions, structured data
- [ ] **Performance audit** — Lighthouse score optimization (target 90+)
- [ ] **PWA support** — service worker + manifest for installable web app
- [ ] **README.md** — project overview, setup instructions, screenshots for GitHub

---

## 📋 Priority Order (Suggested)

1. **localStorage persistence** for simulator (quick win, big UX improvement)
2. **Chart type toggle + more indicators** (visual polish)
3. **Light theme** (accessibility)
4. **Sentiment trend chart** (data visualization)
5. **Signal accuracy tracking** (credibility)
6. **Vercel deployment** (shareable demo)

---

*Last updated: Feb 14, 2026*
