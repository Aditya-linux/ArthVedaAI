# ArthVeda AI - AI-Powered Financial Intelligence Platform

## 1. Project Overview
ArthVeda AI is a next-generation financial analytics and trading simulation platform designed to bridge the gap between retail traders and institutional-grade intelligence. It combines real-time financial news, AI-driven sentiment analysis (using FinBERT), and professional charting tools into a cohesive interface.

The platform empowers users to:
-   **Analyze Real-Time News**: Aggregate financial news from top sources like Bloomberg, Reuters, and CNBC via Finnhub.
-   **Leverage AI Sentiment**: Utilize a local Python microservice running the **FinBERT** LLM to score news sentiment as *Bullish*, *Bearish*, or *Neutral* with high precision.
-   **Simulate Trading**: Practice strategies risk-free with a $100,000 virtual portfolio, live charting, and leverage options.
-   **Receive Trade Signals**: View algorithmic trade signals based on technical indicators (RSI, MACD) and sentiment data.

## 2. Key Features

### 🧠 AI Sentiment Engine
-   **Model**: `ProsusAI/finbert` (Financial BERT), specialized for financial language.
-   **Architecture**: Python FastAPI microservice that communicates with the Next.js backend.
-   **Operation**: Analyzes news headlines in real-time to provide a sentiment score and label.

### 📰 Real-Time News Feed
-   **Integration**: Finnhub API for institutional-grade news.
-   **Smart Filtering**: Filters relevant news for specific tickers (AAPL, BTC-USD, etc.).
-   **Visuals**: Displays sentiment badges and source attribution.

### 📈 Technical Dashboard & Simulator
-   **Charting**: LightWeight Charts (TradingView library) for high-performance candlestick rendering.
-   **Data Source**: Yahoo Finance API for historical price data across Stocks, Crypto, and Forex.
-   **Paper Trading**:
    -   Buy/Sell Market Orders.
    -   Adjustable Leverage (1x - 100x).
    -   Real-time P&L tracking based on live price updates.
    -   Margin and Equity calculations.

### 🎨 Neo-Brutalist UI
-   **Design System**: Custom Vanilla CSS with robust variable system.
-   **Themes**: Toggleable **Dark Mode** (default) and **Light Mode**.
-   **Aesthetics**: Glassmorphism effects, vibrant gradients, and premium typography (Inter/Monospace).

## 3. Technology Stack

### Frontend
-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components, Turbopack).
-   **Language**: TypeScript.
-   **Styling**: Vanilla CSS (CSS Modules & Global Variables). No heavy CSS frameworks.
-   **Icons**: Lucide React.
-   **Charts**: `lightweight-charts`.

### Backend & AI
-   **API**: Next.js API Routes (Serverless functions).
-   **Microservice**: Python [FastAPI](https://fastapi.tiangolo.com/).
-   **ML Model**: HuggingFace `transformers` (PyTorch).
-   **Data Fetching**: `yahoo-finance2`, standard `fetch` for Finnhub.

## 4. Project Structure
```
/src
  /app
    /api           # Next.js API Routes (News, Prices, Signals)
    /dashboard     # Main Analytics Dashboard
    /news          # AI News Feed
    /simulator     # Trading Simulator
  /components
    /layout        # Navbar, Sidebar, Layout Wrappers
    /ui            # Reusable UI Components (Cards, Buttons, Badges)
  /context         # React Context (Theme, Simulator State)
  /lib             # Utilities (Formatters, Sentiment Engine Fallback)
  /styles          # Global CSS
/finbert-service   # Python Microservice
  main.py          # FastAPI Application
  requirements.txt # Python Dependencies
```

## 5. Getting Started

### Prerequisites
-   Node.js 18+
-   Python 3.9+
-   Finnhub API Key (Free)

### Installation
1.  **Clone & Install Frontend**:
    ```bash
    npm install
    npm run dev
    ```
2.  **Setup AI Service**:
    ```bash
    cd finbert-service
    pip install -r requirements.txt
    python main.py
    ```
3.  **Environment Variables**:
    Create `.env.local`:
    ```env
    FINNHUB_API_KEY=your_key_here
    ```

## 6. Future Roadmap
-   [x] **User Auth**: Save portfolio and settings to a database (Supabase/PostgreSQL).
-   [x] **Advanced Charts**: Add drawing tools and more indicators to the charts.
-   [x] **Mobile App**: PWA or React Native adaptation.
