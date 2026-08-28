# ArthVeda AI Model Input/Output Pipeline

The diagram below illustrates how the data flows from external sources, through the FinBERT Financial NLP model, and is served to the frontend simulator.

```mermaid
flowchart TD
    %% External Data Sources
    subgraph External["External Sources"]
        Finnhub["Finnhub API<br/>(Real-Time Financial News)"]
        Yahoo["Yahoo Finance API<br/>(Historical Price Data)"]
    end

    %% Next.js Backend
    subgraph Backend["Next.js Server API (route.ts)"]
        NewsRoute["/api/news<br/>(Fetches & Aggregates News)"]
        PriceRoute["/api/prices<br/>(Fetches Price Data)"]
        
        Finnhub --> |"Headline & Summary<br/>(JSON)"| NewsRoute
        Yahoo --> |"Candlestick Data"| PriceRoute
    end

    %% NLP Microservice
    subgraph Model["FinBERT NLP Microservice"]
        FastAPI["Python FastAPI<br/>(http://localhost:8000/predict)"]
        FinBERT["HuggingFace Model<br/>(ProsusAI/finbert)"]
        
        FastAPI --> FinBERT
        FinBERT --> |"Label (Bullish/Bearish/Neutral)<br/>Confidence Score"| FastAPI
    end

    %% Data Flow to Model
    NewsRoute --> |"POST /predict<br/>{ text: 'Headline + Summary' }"| FastAPI
    
    %% Fallback Engine
    LocalSentiment["Local Fallback Sentiment Engine<br/>(analyzeSentiment)"]
    FastAPI -- "If service down / offline" -.-> LocalSentiment
    NewsRoute -.-> LocalSentiment

    %% Combined Output to Client
    FastAPI --> |"Sentiment Result"| NewsRoute
    
    %% Client Side
    subgraph Frontend["ArthVeda Frontend (Client)"]
        Dashboard["Dashboard & News Feed"]
        Simulator["Trading Simulator"]
        Signals["AI Trade Signals"]
    end

    NewsRoute --> |"News Object + Sentiment Data"| Dashboard
    NewsRoute --> |"Sentiment Drivers"| Signals
    PriceRoute --> |"Chart Data"| Simulator
    Signals --> Simulator
```

### Process Breakdown

1. **Input Generation (Finnhub API)**: The Next.js API route (`/api/news`) queries the Finnhub API for the latest company news based on requested ticker symbols (e.g., AAPL).
2. **Text Processing**: The Next.js backend concatenates the news `headline` and `summary` into a single text block.
3. **Model Prediction (FinBERT)**: The backend sends this text via a POST request to the local Python FastAPI microservice (`http://localhost:8000/predict`). The service passes the text to the **ProsusAI/finbert** model, a state-of-the-art NLP model fine-tuned on financial text.
4. **Output Generation**: The FinBERT model evaluates the financial context and returns a JSON response containing a sentiment `label` (Bullish, Bearish, or Neutral) and a `score` (confidence percentage).
5. **Frontend Delivery**: The Next.js API combines the original news data with the AI-generated sentiment and sends it to the frontend.
6. **User Interface**: The React frontend uses this data to display sentiment badges on the news feed and to calculate AI trade signals in the trading simulator. 

> [!NOTE]
> If the Finnhub API is unavailable (e.g., missing API key or rate limits) or the local FastAPI service is down, the system has a built-in fallback. It will generate mock financial news and use a basic local keyword-based sentiment engine to ensure the platform remains testable.
