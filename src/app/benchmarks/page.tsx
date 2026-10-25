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

                        {/* Master Integrated Formulation Box */}
                        <div className="master-formula-panel">
                            <div className="master-formula-header">
                                <span className="master-badge">MASTER OBJECTIVE KERNEL</span>
                                <span className="master-sub">Continuous Time-Decayed Sentiment Momentum Integration</span>
                            </div>
                            <div className="master-math-row">
                                <div className="master-math-equation">
                                    <span className="m-var">SMI</span>
                                    <span className="m-eq">=</span>
                                    <div className="m-frac m-frac-lg">
                                        <div className="m-num">
                                            <div className="m-sigma-group">
                                                <span className="m-sigma-top">N</span>
                                                <span className="m-sigma-symbol">∑</span>
                                                <span className="m-sigma-bot">j=1</span>
                                            </div>
                                            <span className="m-paren">(</span>
                                            <span className="m-var">w</span><sub className="m-sub">decay</sub><sup>(j)</sup>
                                            <span className="m-dot">·</span>
                                            <span className="m-var">w</span><sub className="m-sub">source</sub><sup>(j)</sup>
                                            <span className="m-dot">·</span>
                                            <span className="m-var">C</span><sup>(j)</sup>
                                            <span className="m-paren">)</span>
                                            <span className="m-dot">·</span>
                                            <span className="m-var">S</span><sup>(j)</sup>
                                        </div>
                                        <div className="m-den">
                                            <div className="m-sigma-group">
                                                <span className="m-sigma-top">N</span>
                                                <span className="m-sigma-symbol">∑</span>
                                                <span className="m-sigma-bot">j=1</span>
                                            </div>
                                            <span className="m-paren">(</span>
                                            <span className="m-var">w</span><sub className="m-sub">decay</sub><sup>(j)</sup>
                                            <span className="m-dot">·</span>
                                            <span className="m-var">w</span><sub className="m-sub">source</sub><sup>(j)</sup>
                                            <span className="m-dot">·</span>
                                            <span className="m-var">C</span><sup>(j)</sup>
                                            <span className="m-paren">)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="algo-steps-grid">
                            <div className="algo-step-box">
                                <span className="step-num">Step 1</span>
                                <h4>Temporal Exponential Decay</h4>
                                <div className="math-display">
                                    <span className="m-var">w</span><sub className="m-sub">decay</sub>
                                    <span className="m-eq">=</span>
                                    <span className="m-var">e</span>
                                    <sup className="m-sup">
                                        <span className="m-neg">−</span>
                                        <span className="m-paren">(</span>
                                        <span className="m-frac">
                                            <span className="m-num">ln 2</span>
                                            <span className="m-den">t<sub className="m-sub">½</sub></span>
                                        </span>
                                        <span className="m-paren">)</span>
                                        <span className="m-dot">·</span>
                                        <span className="m-greek">Δ</span><span className="m-var">t</span>
                                    </sup>
                                </div>
                                <p className="step-explain">Weights recent news with an 18-hour half-life kernel. Fresh breaking developments dominate older, priced-in market headlines.</p>
                            </div>

                            <div className="algo-step-box">
                                <span className="step-num">Step 2</span>
                                <h4>Shannon Information Entropy</h4>
                                <div className="math-display">
                                    <span className="m-var">C</span>
                                    <span className="m-eq">=</span>
                                    <span className="m-num-const">1</span>
                                    <span className="m-op">+</span>
                                    <div className="m-sigma-group m-sigma-sm">
                                        <span className="m-sigma-top">3</span>
                                        <span className="m-sigma-symbol">∑</span>
                                        <span className="m-sigma-bot">i=1</span>
                                    </div>
                                    <span className="m-var">p</span><sub className="m-sub">i</sub>
                                    <span className="m-func">log</span><sub className="m-sub">3</sub>
                                    <span className="m-paren">(</span><span className="m-var">p</span><sub className="m-sub">i</sub><span className="m-paren">)</span>
                                </div>
                                <p className="step-explain">Penalizes ambiguous classifications where the model is split (e.g. 33/33/33), giving priority to high-conviction events.</p>
                            </div>

                            <div className="algo-step-box">
                                <span className="step-num">Step 3</span>
                                <h4>Source Credibility Weighting</h4>
                                <div className="math-display">
                                    <span className="m-var">w</span><sub className="m-sub">total</sub>
                                    <span className="m-eq">=</span>
                                    <span className="m-var">w</span><sub className="m-sub">decay</sub>
                                    <span className="m-times">×</span>
                                    <span className="m-var">w</span><sub className="m-sub">source</sub>
                                    <span className="m-times">×</span>
                                    <span className="m-var">C</span>
                                </div>
                                <p className="step-explain">Calibrates statutory SEC 10-K/10-Q filings (1.35x) and Tier-1 terminals (Bloomberg/Reuters, 1.2x) over unverified internet blogs.</p>
                            </div>

                            <div className="algo-step-box">
                                <span className="step-num">Step 4</span>
                                <h4>Calibrated Logistic Projection</h4>
                                <div className="math-display">
                                    <span className="m-var">P</span><span className="m-paren">(</span><span className="m-var">Y</span><span className="m-eq">=</span><span className="m-num-const">+1</span><span className="m-paren">)</span>
                                    <span className="m-eq">=</span>
                                    <span className="m-frac">
                                        <span className="m-num">1</span>
                                        <span className="m-den">
                                            1 + <span className="m-var">e</span><sup className="m-sup"><span className="m-neg">−</span>k <span className="m-dot">·</span> <span className="m-var">SMI</span></sup>
                                        </span>
                                    </span>
                                </div>
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
                                    <span className="corr-val">{data.market_correlation_study.sentiment_feature_impact}</span>
                                </div>
                                <div className="corr-box">
                                    <span className="corr-label">Risk-Adjusted Alpha (Sharpe Ratio)</span>
                                    <span className="corr-val">{data.market_correlation_study.sharpe_ratio_improvement}</span>
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

                /* ── Master Formula Panel ── */
                .master-formula-panel {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 20px 24px;
                    margin: 8px 0 20px 0;
                    box-shadow: var(--shadow-soft);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .master-formula-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .master-badge {
                    font-size: 0.688rem;
                    font-weight: 700;
                    color: var(--primary-blue);
                    background: rgba(37, 99, 235, 0.08);
                    padding: 3px 10px;
                    border-radius: var(--radius-full);
                    letter-spacing: 0.06em;
                }

                .master-sub {
                    font-size: 0.813rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .master-math-row {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    padding: 8px 4px;
                }

                .master-math-equation {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-family: 'Cambria Math', 'STIX Two Math', 'Times New Roman', serif;
                    font-size: 1.15rem;
                    color: var(--text-primary);
                    white-space: nowrap;
                }

                /* ── Step Math Display Box ── */
                .math-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 14px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-family: 'Cambria Math', 'STIX Two Math', 'Times New Roman', serif;
                    font-size: 1.05rem;
                    color: var(--text-primary);
                    margin: 4px 0 6px 0;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    min-height: 58px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
                }

                /* Math Typography Tokens */
                .m-var {
                    font-style: italic;
                    font-weight: 600;
                    color: var(--text-primary);
                    padding: 0 1px;
                }

                .m-sub {
                    font-size: 0.68em;
                    font-style: normal;
                    font-family: var(--font-sans);
                    color: var(--text-secondary);
                    vertical-align: sub;
                    margin-left: 1px;
                }

                .m-sup {
                    font-size: 0.72em;
                    font-style: normal;
                    color: var(--text-primary);
                    vertical-align: super;
                    margin-left: 1px;
                    display: inline-flex;
                    align-items: center;
                }

                .m-eq {
                    margin: 0 6px;
                    color: var(--text-secondary);
                    font-weight: 400;
                }

                .m-op, .m-dot {
                    margin: 0 3px;
                    color: var(--text-secondary);
                }

                .m-times {
                    margin: 0 4px;
                    color: var(--text-secondary);
                    font-size: 0.85em;
                }

                .m-neg {
                    font-weight: 600;
                    margin-right: 1px;
                }

                .m-paren {
                    font-size: 1.1em;
                    color: var(--text-secondary);
                    font-weight: 300;
                }

                .m-greek {
                    font-style: normal;
                    font-weight: 700;
                    margin-right: 1px;
                }

                .m-func {
                    font-family: var(--font-sans);
                    font-weight: 600;
                    font-size: 0.85em;
                    color: var(--text-primary);
                    margin-left: 2px;
                }

                .m-num-const {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                /* Mathematical Fractions */
                .m-frac {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    vertical-align: middle;
                    text-align: center;
                    padding: 0 3px;
                    font-size: 0.88em;
                    line-height: 1.1;
                }

                .m-frac-lg {
                    font-size: 0.95em;
                    padding: 0 6px;
                }

                .m-num {
                    border-bottom: 1.5px solid var(--text-primary);
                    padding: 2px 6px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                }

                .m-den {
                    padding: 3px 6px 1px 6px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                }

                /* Sigma Summation Notation */
                .m-sigma-group {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin: 0 4px;
                    line-height: 0.85;
                    vertical-align: middle;
                }

                .m-sigma-top {
                    font-size: 0.55rem;
                    font-weight: 700;
                    font-family: var(--font-sans);
                    color: var(--text-secondary);
                }

                .m-sigma-symbol {
                    font-size: 1.35rem;
                    font-weight: 400;
                    line-height: 1;
                    color: var(--text-primary);
                }

                .m-sigma-bot {
                    font-size: 0.55rem;
                    font-weight: 700;
                    font-family: var(--font-sans);
                    color: var(--text-secondary);
                }

                .m-sigma-sm .m-sigma-symbol {
                    font-size: 1.15rem;
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
                    background: rgba(255, 255, 255, 0.04);
                }
                [data-theme='light'] .selected-row {
                    background: rgba(0, 0, 0, 0.03);
                }

                .benchmark-table th:last-child,
                .benchmark-table td:last-child {
                    white-space: nowrap;
                    text-align: right;
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
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .domain-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: var(--radius-full);
                    letter-spacing: 0.02em;
                }
                .domain-badge.yes {
                    background: #FFFFFF;
                    color: #000000 !important;
                    border: 1px solid #FFFFFF;
                }
                .domain-badge.no {
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--text-secondary);
                    border: 1px solid var(--border-color);
                }
                [data-theme='light'] .domain-badge.yes {
                    background: #000000;
                    color: #FFFFFF !important;
                    border: 1px solid #000000;
                }
                [data-theme='light'] .domain-badge.no {
                    background: rgba(0, 0, 0, 0.05);
                    color: var(--text-secondary);
                    border: 1px solid var(--border-color);
                }

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
                    background: rgba(255, 255, 255, 0.14);
                    color: var(--text-primary) !important;
                    font-weight: 700;
                }
                [data-theme='light'] .diagonal-match {
                    background: rgba(0, 0, 0, 0.08);
                    color: var(--text-primary) !important;
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

                .text-green, .text-blue { color: var(--text-primary) !important; }

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
                    padding: 10px 22px;
                    background: var(--text-primary);
                    color: var(--bg-app);
                    border: 1px solid var(--text-primary);
                    border-radius: var(--radius-full);
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .test-btn:hover {
                    opacity: 0.88;
                    transform: scale(0.98);
                }

                .test-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
                    font-size: 0.75rem;
                    letter-spacing: 0.03em;
                }
                .result-badge.bullish {
                    background: #FFFFFF;
                    color: #000000 !important;
                    border: 1px solid #FFFFFF;
                }
                .result-badge.bearish {
                    background: rgba(255, 255, 255, 0.08);
                    color: #FFFFFF !important;
                    border: 1px solid rgba(255, 255, 255, 0.24);
                }
                .result-badge.neutral {
                    background: rgba(255, 255, 255, 0.03);
                    color: #D4D4D8 !important;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                }

                [data-theme='light'] .result-badge.bullish {
                    background: #000000;
                    color: #FFFFFF !important;
                    border: 1px solid #000000;
                }
                [data-theme='light'] .result-badge.bearish {
                    background: rgba(0, 0, 0, 0.06);
                    color: #000000 !important;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                }
                [data-theme='light'] .result-badge.neutral {
                    background: transparent;
                    color: #52525B !important;
                    border: 1px dashed rgba(0, 0, 0, 0.2);
                }

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
                .result-bar.bullish { background: #FFFFFF; }
                .result-bar.bearish { background: rgba(255, 255, 255, 0.5); }
                .result-bar.neutral { background: rgba(255, 255, 255, 0.25); }

                [data-theme='light'] .result-bar.bullish { background: #000000; }
                [data-theme='light'] .result-bar.bearish { background: rgba(0, 0, 0, 0.4); }
                [data-theme='light'] .result-bar.neutral { background: rgba(0, 0, 0, 0.2); }

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
