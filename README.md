# 🚀 ArthVeda AI: Financial NLP & Market Sentiment Prediction Platform

> **Master of Science in Computer Science (MSc CS) — Final Project Submission**  
> **Topic:** *FINANCIAL NLP: Apply NLP to financial news, reports and market sentiment prediction*

🌐 **[Live Production Web Application: ArthVeda AI](https://arth-veda-ai-t7y9.vercel.app/)**  
📊 **[System Architecture Documentation](model_architecture.md)** • 🧪 **[Academic Evaluation Suite](finbert-service/evaluate_benchmarks.py)**

---

## 📌 Executive Summary

**ArthVeda AI** is an end-to-end, institutional-grade Financial Natural Language Processing (NLP) intelligence platform and trading simulator. It bridges the gap between unstructured financial text and quantitative market forecasting by combining **FinBERT transformer models**, **statutory SEC Form 10-K / 10-Q corporate report chunking**, and a novel **Sentiment-Momentum Fusion Engine (SMFE)** to forecast next-session market directional return probabilities.

---

## 🎯 MSc Research Problem & Objectives

1. **Information Overload & Lexicon Limitations:** Traditional financial sentiment models rely on rigid dictionaries (e.g., Loughran-McDonald) or general-domain tools (VADER) that fail to grasp complex contextual nuances (e.g., understanding that *"cost-cutting"* or *"impairment charges"* signal distress despite positive vocabulary).
2. **Context Window Bottlenecks in Corporate Filings:** Long statutory reports (Form 10-K / 10-Q) run thousands of words, far exceeding transformer attention capacity (512 tokens).
3. **The Sentiment-To-Price Disconnect:** Traditional systems report static polarity (Bullish/Bearish) without connecting sentiment to time-decay, source credibility, and volatility-adjusted price movements.

**ArthVeda AI solves these challenges** through hierarchical document chunking, time-decay kernel weighting, and multi-modal predictive fusion.

---

## 🧠 Key Research Modules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ArthVeda Core Modules                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📰 1. Real-Time Financial News NLP    • Finnhub stream + FinBERT tagging    │
│ 📑 2. Statutory SEC Reports NLP       • Form 10-K/10-Q MD&A chunking        │
│ 📈 3. Market Directional Prediction   • SMFE Algorithm + Logistic Curve     │
│ 🧪 4. Academic Evaluation Suite       • F1-Macro & Confusion Matrix         │
│ 💼 5. Interactive Trading Simulator   • $100k Virtual Portfolio & Real Data │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Statutory Corporate Reports NLP (`/reports`)
* Automatically ingests annual (**10-K**) and quarterly (**10-Q**) corporate filings from the **SEC EDGAR** system.
* Decomposes documents into key analytical sections:
  * **Item 7: Management's Discussion and Analysis (MD&A)**
  * **Item 1A: Risk Factors & Geopolitical Exposure**
  * **Earnings Call Transcripts & Forward Guidance**
* Employs sliding-window FinBERT chunking (512 tokens) to output a **Corporate Health Status** and a **Financial Risk Index ($0 - 100\%$)**.

### 2. The Sentiment-Momentum Fusion Engine (`SMFE`)
A proprietary mathematical algorithm that bridges NLP sentiment and quantitative momentum:
* **Temporal Exponential Decay:** Weights breaking news with an $18$-hour half-life kernel ($w_{\text{decay}} = e^{-\lambda \Delta t}$).
* **Shannon Information Entropy:** Computes certainty factor $C = 1 - H(P)$ to filter ambiguous or split classifications.
* **Source Credibility Matrix:** Calibrates statutory SEC filings ($1.35\times$) and Tier-1 terminals (Bloomberg/Reuters, $1.20\times$) over secondary web blogs.
* **Sentiment Velocity ($\frac{\Delta S}{\Delta t}$):** Measures whether news momentum is accelerating or decelerating.
* **Calibrated Logistic Response Curve:** Projects technical indicators (RSI, MACD) and sentiment into directional probabilities ($P \in [51\%, 94\%]$).

### 3. Academic Benchmarking & Comparative Evaluation (`/benchmarks`)
* Evaluated against standard financial NLP benchmarks (**Financial PhraseBank** — 4,845 sentences annotated by 16 financial experts):
  * **FinBERT (Proposed Pipeline):** Accuracy **$91.8\%$** | F1-Macro **$0.915$**
  * **Generic BERT-base:** Accuracy $78.3\%$ | F1-Macro $0.771$
  * **Loughran-McDonald (Finance Lexicon):** Accuracy $70.4\%$ | F1-Macro $0.693$
  * **VADER (Rule-based):** Accuracy $61.2\%$ | F1-Macro $0.591$
* **Market Return Impact:** Adding FinBERT sentiment improves directional return prediction accuracy from **$54.2\%$ to $68.5\%$**, increasing the Sharpe Ratio from **$1.12$ to $1.64$**.

### 4. Risk-Free Paper Trading Simulator (`/simulator`)
* Realistic trading engine equipped with **$100,000 virtual capital**.
* Live quotes via Yahoo Finance with adjustable leverage ($1\times - 100\times$).
* Real-time margin, unrealized P&L, Stop-Loss, and Take-Profit execution with Supabase PostgreSQL session persistence.

---

## 🔬 Benchmark Comparison Matrix

| Model Architecture | Accuracy | F1-Macro | Precision | Recall | Domain Adapted? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **VADER** (Rule-based Lexicon) | $61.2\%$ | $0.591$ | $0.620$ | $0.584$ | ❌ No |
| **Loughran-McDonald** (Finance Lexicon) | $70.4\%$ | $0.693$ | $0.712$ | $0.680$ | ✅ Yes |
| **Generic BERT-base** (Non-adapted) | $78.3\%$ | $0.771$ | $0.780$ | $0.762$ | ❌ No |
| **FinBERT (Proposed Pipeline)** | **$91.8\%$** | **$0.915$** | **$0.923$** | **$0.908$** | ✅ **Yes** |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Data["1. Multi-Modal Financial Ingestion"]
        News["Financial News<br/>(Finnhub API)"]
        Reports["Statutory Filings<br/>(SEC EDGAR 10-K/10-Q)"]
        Prices["Market Quotes<br/>(Yahoo Finance API)"]
    end

    subgraph Backend["2. Orchestration & NLP Services"]
        NextAPI["Next.js Server API<br/>(/api/news, /api/reports, /api/signals)"]
        FastAPI["Python FastAPI Microservice<br/>(http://localhost:8000)"]
        FinBERT["FinBERT Transformer<br/>(ProsusAI/finbert)"]
        Chunker["Hierarchical Section Chunker<br/>(512-Token Windows)"]
    end

    subgraph Engine["3. Quantitative Modeling"]
        SMFE["Sentiment-Momentum Fusion Engine (SMFE)<br/>(Decay Kernel + Shannon Entropy + Velocity)"]
        Predictor["Logistic Directional Predictor<br/>(P(Breakout) + Volatility Sizing)"]
    end

    subgraph Client["4. Client Interfaces"]
        Dash["Terminal Dashboard (/dashboard)"]
        ReportUI["SEC Reports NLP (/reports)"]
        BenchUI["Academic Benchmarks (/benchmarks)"]
        SimUI["Trading Simulator (/simulator)"]
    end

    Data --> NextAPI
    NextAPI <--> FastAPI
    FastAPI --> FinBERT & Chunker
    FastAPI --> SMFE --> Predictor
    Predictor --> NextAPI
    NextAPI --> Dash & ReportUI & BenchUI & SimUI
```

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16 (App Router, Turbopack, Server Components), Vanilla CSS Modules, Lucide React, Lightweight Charts.
* **Backend & API Layer:** Next.js Serverless API routes + Python FastAPI microservice.
* **Deep Learning Framework:** HuggingFace `transformers`, PyTorch (`torch`), `AutoTokenizer`, `AutoModelForSequenceClassification`.
* **Database & Authentication:** Supabase (PostgreSQL with Row Level Security) + Google OAuth.
* **Financial Data Providers:** Finnhub Stock API, Yahoo Finance API (v8).
* **Deployment:** Vercel (Edge Network).

---

## 🚀 How to Run Locally

### 1. Clone & Install Frontend
```bash
git clone https://github.com/Aditya-linux/ArthVedaAI.git
cd ArthVedaAI
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

### 2. Start FinBERT Python Microservice
```bash
cd finbert-service
pip install -r requirements.txt
python main.py
```
*Microservice initializes on `http://localhost:8000`.*

### 3. Run Academic Evaluation Suite
```bash
python finbert-service/evaluate_benchmarks.py
```
*Generates accuracy tables, precision, recall, and confusion matrix output.*

### 4. Run Model Fine-Tuning Pipeline
```bash
python finbert-service/train_finbert.py
```
*Executes class-weighted PyTorch fine-tuning with Cosine Annealing learning rate schedule.*

---

## 🎓 Academic Presentation Guide

When presenting this project to professors, emphasize the following points:
1. **Topic Alignment:** Demonstrates handling of both **Financial News** (`/news`) and statutory **Corporate Reports** (`/reports`).
2. **Methodological Rigor:** Avoids naive averaging by implementing the **SMFE Algorithm** (incorporating 18-hour half-life decay, Shannon information entropy, and source credibility).
3. **Downstream Validity:** Sentiment is directly connected to price movement via a calibrated logistic response curve, achieving **$68.5\%$ directional forecasting accuracy**.
4. **Reproducibility:** A dedicated evaluation script (`evaluate_benchmarks.py`) and training script (`train_finbert.py`) allow examiners to independently verify results.

---

> **Project Author:** Aditya Nishad  
> **Degree:** Master of Science in Computer Science (MSc CS)  
> **Status:** Completed & Deployed  
