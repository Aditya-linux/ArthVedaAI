'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Award, CheckCircle2, TrendingUp, Layers, HelpCircle, Send } from 'lucide-react';

interface ModelMetric {
    model: string;
    precision: number;
    recall: number;
    f1_macro: number;
    accuracy: number;
    domain_adapted: boolean;
    description: string;
}

interface BenchmarkResponse {
    dataset: string;
    evaluation_target: string;
    models: ModelMetric[];
    confusion_matrix_finbert: {
        labels: string[];
        matrix: number[][];
    };
    market_correlation_study: {
        sample_size: string;
        sentiment_feature_impact: string;
        sharpe_ratio_improvement: string;
    };
}

export default function BenchmarksPage() {
    const [data, setData] = useState<BenchmarkResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Interactive sentence tester
    const [testText, setTestText] = useState('Operating margins expanded by 240 basis points despite severe semiconductor supply bottlenecks.');
    const [testResult, setTestResult] = useState<any>(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        const fetchBenchmarks = async () => {
            try {
                const res = await fetch('/api/benchmarks');
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBenchmarks();
    }, []);

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testText.trim()) return;
        setTesting(true);
        try {
            const res = await fetch('/api/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: testText })
            });
            if (res.ok) {
                setTestResult(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="benchmarks-page">
            <header className="page-header card">
                <div>
                    <div className="badge-academic">MSc Research Evaluation Suite</div>
                    <h1 className="page-title">Financial NLP Benchmarks & Empirical Evaluation</h1>
                    <p className="page-subtitle">
                        Comparative statistical evaluation of transformer architectures vs finance lexicons on Financial PhraseBank benchmarks, 
                        coupled with downstream market return prediction validity.
                    </p>
                </div>
            </header>

            {loading && <div className="card loading-card">Loading benchmark matrices...</div>}

            {!loading && data && (
                <>
                    {/* Comparative Table */}
                    <div className="card table-card">
                        <div className="card-header-row">
                            <div>
                                <h3 className="section-title">
                                    <Award size={18} />
                                    Model Performance Comparison on {data.dataset}
                                </h3>
                                <p className="section-desc">Evaluated across 3-class polarity classification (Positive, Negative, Neutral)</p>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="benchmark-table">
                                <thead>
                                    <tr>
                                        <th>NLP Model Architecture</th>
                                        <th>Accuracy</th>
                                        <th>Precision</th>
                                        <th>Recall</th>
                                        <th>F1-Macro</th>
                                        <th>Domain Adapted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.models.map((m, i) => {
                                        const isSelected = m.model.includes('FinBERT');
                                        return (
                                            <tr key={i} className={isSelected ? 'selected-row' : ''}>
                                                <td className="model-name-cell">
                                                    <strong>{m.model}</strong>
                                                    <span className="model-subdesc">{m.description}</span>
                                                </td>
                                                <td className="metric-cell">{(m.accuracy * 100).toFixed(1)}%</td>
                                                <td className="metric-cell">{(m.precision * 100).toFixed(1)}%</td>
                                                <td className="metric-cell">{(m.recall * 100).toFixed(1)}%</td>
                                                <td className="metric-cell f1-cell">
                                                    <strong>{(m.f1_macro * 100).toFixed(1)}%</strong>
                                                </td>
                                                <td>
                                                    <span className={`domain-badge ${m.domain_adapted ? 'yes' : 'no'}`}>
                                                        {m.domain_adapted ? 'Yes (Finance)' : 'No (Generic)'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Novel Core Algorithm Card: SMFE */}
                    <div className="card algorithm-card">
                        <div className="badge-academic">Proprietary Mathematical Formulation</div>
                        <h3 className="section-title">
                            The Sentiment-Momentum Fusion Engine (SMFE)
                        </h3>
                        <p className="section-desc">
                            A production-grade algorithmic bridge that converts raw textual FinBERT polarity into smoothed, risk-adjusted market directional probabilities.
                        </p>

                        <div className="algo-steps-grid">
                            <div className="algo-step-box">
                                <span className="step-num">Step 1</span>
                                <h4>Temporal Exponential Decay</h4>
                                <p className="formula">w_decay = e^(-(ln 2 / t_half) * delta_t)</p>
                                <p className="step-explain">Weights recent news with an 18-hour half-life kernel. Fresh breaking developments dominate older, priced-in market headlines.</p>
                            </div>

                            <div className="algo-step-box">
                                <span className="step-num">Step 2</span>
                                <h4>Shannon Information Entropy</h4>
                                <p className="formula">Certainty = 1 - (-sum(p_i * log3 p_i))</p>
                                <p className="step-explain">Penalizes ambiguous classifications where the model is split (e.g. 33/33/33), giving priority to high-conviction events.</p>
                            </div>

                            <div className="algo-step-box">
                                <span className="step-num">Step 3</span>
                                <h4>Source Credibility Weighting</h4>
                                <p className="formula">w_total = w_decay * w_source * Certainty</p>
                                <p className="step-explain">Calibrates statutory SEC 10-K/10-Q filings (1.35x) and Tier-1 terminals (Bloomberg/Reuters, 1.2x) over unverified internet blogs.</p>
                            </div>

                            <div className="algo-step-box">
                                <span className="step-num">Step 4</span>
                                <h4>Calibrated Logistic Projection</h4>
                                <p className="formula">P(Y = +1) = 1 / (1 + e^(-0.045 * Score))</p>
                                <p className="step-explain">Combines the normalized SMI with RSI, MACD, and Bollinger Bands to output a calibrated directional movement probability.</p>
                            </div>
                        </div>
                    </div>

                    {/* Dual Grid: Confusion Matrix + Market Correlation */}
                    <div className="dual-grid">
                        {/* Confusion Matrix */}
                        <div className="card matrix-card">
                            <h3 className="section-title">
                                <Layers size={18} />
                                FinBERT Confusion Matrix
                            </h3>
                            <p className="section-desc">Test split distribution across Financial PhraseBank gold labels</p>

                            <div className="matrix-table-wrap">
                                <table className="matrix-table">
                                    <thead>
                                        <tr>
                                            <th>Actual \ Pred</th>
                                            {data.confusion_matrix_finbert.labels.map(l => (
                                                <th key={l}>{l}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.confusion_matrix_finbert.matrix.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                <td className="actual-label">{data.confusion_matrix_finbert.labels[rIdx]}</td>
                                                {row.map((val, cIdx) => (
                                                    <td key={cIdx} className={rIdx === cIdx ? 'diagonal-match' : 'off-diagonal'}>
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Market Sentiment Downstream Correlation */}
                        <div className="card correlation-card">
                            <h3 className="section-title">
                                <TrendingUp size={18} />
                                Market Movement Prediction Impact
                            </h3>
                            <p className="section-desc">Downstream predictive evaluation on historical price data</p>

                            <div className="correlation-metrics">
                                <div className="corr-box">
                                    <span className="corr-label">Directional Return Prediction</span>
                                    <span className="corr-val text-green">{data.market_correlation_study.sentiment_feature_impact}</span>
                                </div>
                                <div className="corr-box">
                                    <span className="corr-label">Risk-Adjusted Alpha (Sharpe Ratio)</span>
                                    <span className="corr-val text-blue">{data.market_correlation_study.sharpe_ratio_improvement}</span>
                                </div>
                                <div className="corr-box">
                                    <span className="corr-label">Empirical Validation Sample</span>
                                    <span className="corr-val">{data.market_correlation_study.sample_size}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Live FinBERT Testing Playground */}
                    <div className="card tester-card">
                        <h3 className="section-title">
                            <HelpCircle size={18} />
                            Interactive FinBERT Inference Terminal
                        </h3>
                        <p className="section-desc">Test real-time model inference on custom financial statements, earnings guidance, or headlines</p>

                        <form onSubmit={handleTest} className="test-form">
                            <textarea
                                className="test-input"
                                value={testText}
                                onChange={e => setTestText(e.target.value)}
                                rows={3}
                                placeholder="Paste any financial sentence here..."
                            />
                            <button type="submit" className="test-btn" disabled={testing}>
                                <Send size={16} />
                                {testing ? 'Classifying...' : 'Classify with FinBERT'}
                            </button>
                        </form>

                        {testResult && (
                            <div className="test-result-box">
                                <div className="result-header">
                                    <span className="result-label">Predicted Polarity:</span>
                                    <span className={`result-badge ${testResult.label?.toLowerCase()}`}>
                                        {testResult.label}
                                    </span>
                                    <span className="result-conf">
                                        Confidence: {testResult.confidence}%
                                    </span>
                                </div>
                                <div className="result-bar-wrap">
                                    <div
                                        className={`result-bar ${testResult.label?.toLowerCase()}`}
                                        style={{ width: `${testResult.confidence}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <style jsx>{`
                .benchmarks-page {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 1300px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                .page-header {
                    padding: 24px 32px;
                }

                .badge-academic {
                    display: inline-block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--primary-blue);
                    background: rgba(59, 130, 246, 0.1);
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    margin-bottom: 8px;
                }

                .page-title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 8px 0;
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin: 0;
                    max-width: 800px;
                }

                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                }

                .section-desc {
                    font-size: 0.85rem;
                    color: var(--text-tertiary);
                    margin: 0 0 16px 0;
                }

                .table-card {
                    padding: 24px;
                }

                .algorithm-card {
                    padding: 24px 32px;
                    background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(59, 130, 246, 0.04) 100%);
                    border: 1px solid var(--border-color);
                }

                .algo-steps-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-top: 16px;
                }

                .algo-step-box {
                    background: var(--bg-app);
                    padding: 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .step-num {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--primary-blue);
                    letter-spacing: 0.05em;
                }

                .algo-step-box h4 {
                    margin: 0;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .formula {
                    font-family: var(--font-mono, monospace);
                    font-size: 0.78rem;
                    color: var(--green);
                    background: var(--bg-surface);
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin: 0;
                    border: 1px solid var(--border-color);
                }

                .step-explain {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0;
                }

                @media (max-width: 1024px) {
                    .algo-steps-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .algo-steps-grid { grid-template-columns: 1fr; }
                }

                .benchmark-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }

                .benchmark-table th {
                    text-align: left;
                    padding: 12px 16px;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                }

                .benchmark-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--border-color);
                    color: var(--text-primary);
                }

                .selected-row {
                    background: rgba(59, 130, 246, 0.05);
                }

                .model-name-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .model-subdesc {
                    font-size: 0.78rem;
                    color: var(--text-tertiary);
                }

                .metric-cell {
                    font-family: var(--font-mono, monospace);
                    font-size: 0.95rem;
                }

                .f1-cell {
                    color: var(--primary-blue);
                }

                .domain-badge {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 3px 8px;
                    border-radius: var(--radius-full);
                }
                .domain-badge.yes { background: var(--green-bg); color: var(--green); }
                .domain-badge.no { background: var(--bg-app); color: var(--text-tertiary); }

                .dual-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .matrix-card, .correlation-card, .tester-card {
                    padding: 24px;
                }

                .matrix-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: center;
                    font-family: var(--font-mono, monospace);
                }

                .matrix-table th {
                    padding: 10px;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .matrix-table td {
                    padding: 12px;
                    border: 1px solid var(--border-color);
                    font-size: 0.95rem;
                }

                .actual-label {
                    font-weight: 700;
                    background: var(--bg-app);
                    text-align: left;
                }

                .diagonal-match {
                    background: rgba(34, 197, 94, 0.15);
                    color: var(--green);
                    font-weight: 700;
                }

                .off-diagonal {
                    color: var(--text-tertiary);
                }

                .correlation-metrics {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .corr-box {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 14px 16px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                }

                .corr-label {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .corr-val {
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .text-green { color: var(--green); }
                .text-blue { color: var(--primary-blue); }

                .test-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .test-input {
                    padding: 12px;
                    border-radius: var(--radius-md);
                    background: var(--bg-app);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-family: var(--font-sans);
                    font-size: 0.9rem;
                    resize: vertical;
                }

                .test-btn {
                    align-self: flex-start;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: var(--primary-blue);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                }

                .test-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .test-result-box {
                    margin-top: 16px;
                    padding: 16px;
                    background: var(--bg-app);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                }

                .result-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .result-badge {
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: var(--radius-full);
                    text-transform: uppercase;
                    font-size: 0.8rem;
                }
                .result-badge.bullish { background: var(--green-bg); color: var(--green); }
                .result-badge.bearish { background: var(--red-bg); color: var(--red); }
                .result-badge.neutral { background: rgba(234, 179, 8, 0.1); color: #EAB308; }

                .result-conf {
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono, monospace);
                }

                .result-bar-wrap {
                    height: 6px;
                    background: var(--border-color);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .result-bar {
                    height: 100%;
                }
                .result-bar.bullish { background: var(--green); }
                .result-bar.bearish { background: var(--red); }
                .result-bar.neutral { background: #EAB308; }

                .table-responsive,
                .matrix-table-wrap {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    width: 100%;
                }

                @media (max-width: 900px) {
                    .dual-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 640px) {
                    .page-header, .table-card, .algorithm-card, .matrix-card, .correlation-card, .tester-card {
                        padding: 16px;
                    }
                    .page-title {
                        font-size: 1.25rem;
                    }
                    .benchmark-table {
                        min-width: 580px;
                    }
                    .test-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
