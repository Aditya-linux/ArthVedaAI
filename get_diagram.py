import zlib
import base64
import urllib.request

mermaid_code = """
flowchart TD
    subgraph External["External Sources"]
        Finnhub["Finnhub API<br/>(Real-Time Financial News)"]
        Yahoo["Yahoo Finance API<br/>(Historical Price Data)"]
    end

    subgraph Backend["Next.js Server API (route.ts)"]
        NewsRoute["/api/news<br/>(Fetches & Aggregates News)"]
        PriceRoute["/api/prices<br/>(Fetches Price Data)"]
        
        Finnhub --> |"Headline & Summary<br/>(JSON)"| NewsRoute
        Yahoo --> |"Candlestick Data"| PriceRoute
    end

    subgraph Model["FinBERT NLP Microservice"]
        FastAPI["Python FastAPI<br/>(http://localhost:8000/predict)"]
        FinBERT["HuggingFace Model<br/>(ProsusAI/finbert)"]
        
        FastAPI --> FinBERT
        FinBERT --> |"Label (Bullish/Bearish/Neutral)<br/>Confidence Score"| FastAPI
    end

    NewsRoute --> |"POST /predict<br/>{ text: 'Headline + Summary' }"| FastAPI
    
    LocalSentiment["Local Fallback Sentiment Engine<br/>(analyzeSentiment)"]
    FastAPI -- "If service down / offline" -.-> LocalSentiment
    NewsRoute -.-> LocalSentiment

    FastAPI --> |"Sentiment Result"| NewsRoute
    
    subgraph Frontend["ArthVeda Frontend (Client)"]
        Dashboard["Dashboard & News Feed"]
        Simulator["Trading Simulator"]
        Signals["AI Trade Signals"]
    end

    NewsRoute --> |"News Object + Sentiment Data"| Dashboard
    NewsRoute --> |"Sentiment Drivers"| Signals
    PriceRoute --> |"Chart Data"| Simulator
    Signals --> Simulator
"""

# Kroki expects zlib compression then base64 url-safe
compressed = zlib.compress(mermaid_code.encode('utf-8'), 9)
encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')

url = f"https://kroki.io/mermaid/png/{encoded}"

print("Downloading from", url)
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open("C:\\Users\\Aditya\\.gemini\\antigravity-ide\\brain\\0ebb4215-7bce-42ba-8f05-fd18598e6c56\\model_architecture.png", 'wb') as out_file:
        out_file.write(response.read())
    print("Done")
except Exception as e:
    print("Error:", e)

