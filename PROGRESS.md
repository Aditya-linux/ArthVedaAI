# Project Progress & Roadmap

This document tracks the ongoing development of the Financial News & Trading Platform.

## ✅ Achieved Features

### Core Infrastructure
- [x] **Next.js 14 App Router**: Modern framework setup.
- [x] **Theme System**: Persisted Light/Dark mode with custom "Focus" theme (Neo-Brutalism/Glassmorphism hybrid).
- [x] **API Integration**: Direct connection to **Yahoo Finance** and **Finnhub** (bypassing unstable libraries).
- [x] **Caching**: In-memory caching for API responses to ensure speed and stability.

### Dashboard & Trading
- [x] **Advanced Charts**: TradingView-style charts with:
    - **Candlestick & Line Modes**: Toggleable views.
    - **Volume Histogram**: Color-coded volume bars.
    - **Interactive Elements**: Crosshair magnet, time scaling.
- [x] **Asset Selector**: Dropdown to switch between major stocks and crypto.
- [x] **AI Trade Signals**: Real-time signals (BUY/SELL/HOLD) powered by technical analysis (RSI, MACD, SMA).
- [x] **Paper Trading Simulator**: Fully functional buy/sell execution with portfolio tracking.

### Intelligence
- [x] **News Feed**: Real-time financial news aggregation.
- [x] **AI Sentiment**: Python-based FinBERT service analyzing news headlines for Bullish/Bearish sentiment.

---

## 🐛 Bug Fixes

- [x] **Yahoo Finance Library Crash**: Replaced `yahoo-finance2` library with a custom, robust `fetch` utility to fix runtime errors.
- [x] **Chart Scaling**: Fixed volume histogram overlapping with candles by implementing custom price scales.
- [x] **Sidebar Styling**: Corrected broken styles in the navigation sidebar.
- [x] **Mock Data Removal**: Successfully purged all mock data; the app now runs 100% on live data.

---

## 🚀 Future Roadmap

### Short Term
- [x] **Watchlists**: Allow users to save favorite stocks.
- [ ] **Mobile Optimization**: Refine touch controls for charts.
- [ ] **Portfolio Management**: Add ability to add, remove, and manage stocks in the portfolio.
- [ ] **Stocks and Crypto Education**: A daily tips and knowledge about stocks and crypto.

### Medium Term
- [ ] **User Authentication**: Secure login via Clerk or NextAuth.
- [ ] **Database Integration**: Save trade history and portfolio state to a real database (PostgreSQL/Supabase).
- [ ] **Limit Orders**: Add ability to set pending orders at specific prices.

### Long Term
- [ ] **Social Trading**: Share portfolios and compete on leaderboards.
- [ ] **Options Trading**: Add support for derivatives.
- [ ] **Live Streaming Data**: Upgrade from polling to WebSockets for sub-second updates.
