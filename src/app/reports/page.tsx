'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, ShieldAlert, TrendingUp, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Cpu, Info } from 'lucide-react';

interface ParagraphResult {
    label: string;
    score: number;
    text_snippet?: string;
    raw_probs?: { bullish: number; bearish: number; neutral: number };
}

interface SectionAnalysis {
    section_title: string;
    paragraphs_analyzed: number;
    section_sentiment: string;
    sentiment_score: number;
    paragraph_breakdown: ParagraphResult[];
    content?: string;
}

interface ReportData {
    company: string;
    symbol: string;
    report_type: string;
    period: string;
    overall_health: string;
    composite_score: number;
    financial_risk_index: number;
    sections: SectionAnalysis[];
    source: string;
}

const SYMBOLS = [
    { s: 'AAPL', n: 'Apple Inc.' },
    { s: 'NVDA', n: 'NVIDIA Corp.' },
    { s: 'TSLA', n: 'Tesla, Inc.' },
    { s: 'MSFT', n: 'Microsoft Corp.' }
];

export default function ReportsPage() {
    const [symbol, setSymbol] = useState('AAPL');
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState<number | null>(0);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reports?symbol=${symbol}`);
            if (res.ok) {
                const data = await res.json();
                setReport(data);
            }
        } catch (e) {
            console.error('Error loading report:', e);
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const toggleSection = (idx: number) => {
        setExpandedSection(prev => prev === idx ? null : idx);
    };

    return (
        <div className="reports-page">
            {/* Header */}
            <header className="page-header card">
                <div>
                    <div className="badge-academic">MSc Financial NLP Module</div>
                    <h1 className="page-title">Corporate Financial Reports & SEC Filings NLP</h1>
                    <p className="page-subtitle">
                        Automated semantic parsing, chunk-level FinBERT classification, and section-wise risk analysis for Form 10-K, 10-Q & Earnings Transcripts.
                    </p>
                </div>

                <div className="controls">
                    <select
                        className="select-input"
                        value={symbol}
                        onChange={e => setSymbol(e.target.value)}
                        disabled={loading}
                    >
                        {SYMBOLS.map(item => (
                            <option key={item.s} value={item.s}>{item.s} - {item.n}</option>
                        ))}
                    </select>

                    <button className="btn-refresh" onClick={fetchReport} disabled={loading}>
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        {loading ? 'Processing...' : 'Analyze Report'}
                    </button>
                </div>
            </header>

            {/* Academic Architecture Callout */}
            <div className="academic-callout card">
                <div className="callout-icon">
                    <Cpu size={24} />
                </div>
                <div className="callout-text">
                    <h4>Hierarchical NLP Document Ingestion Pipeline</h4>
                    <p>
                        Long-form statutory filings exceed standard transformer context windows (512 tokens). ArthVeda segments statutory documents into 
                        thematic disclosures (<strong>Item 1A Risk Factors</strong>, <strong>Item 7 MD&A</strong>, and <strong>Earnings Transcripts</strong>), 
                        runs sliding-window contextual classification via <code>ProsusAI/finbert</code>, and synthesizes a domain-weighted corporate health index.
                    </p>
                </div>
            </div>

            {loading && (
                <div className="loading-state card">
                    <RefreshCw size={32} className="spinning text-blue" />
                    <p>Parsing statutory SEC filings & computing FinBERT cross-attention embeddings...</p>
                </div>
            )}

            {!loading && report && (
                <>
                    {/* Top KPI Summary Grid */}
                    <div className="kpi-grid">
                        <div className="kpi-card card">
                            <span className="kpi-label">Filing Analyzed</span>
                            <span className="kpi-value text-primary">{report.symbol}</span>
                            <span className="kpi-subtext">{report.report_type} • {report.period}</span>
                        </div>

                        <div className="kpi-card card">
                            <span className="kpi-label">Corporate Tone</span>
                            <span className={`kpi-value ${report.composite_score >= 0.1 ? 'pos' : (report.composite_score < -0.1 ? 'neg' : 'neu')}`}>
                                {report.overall_health}
                            </span>
                            <span className="kpi-subtext">Composite Polarity: {(report.composite_score * 100).toFixed(1)}%</span>
                        </div>

                        <div className="kpi-card card">
                            <span className="kpi-label">Financial Risk Index</span>
                            <span className={`kpi-value ${report.financial_risk_index > 40 ? 'neg' : 'pos'}`}>
                                {report.financial_risk_index}%
                            </span>
                            <div className="risk-bar-track">
                                <div
                                    className={`risk-bar-fill ${report.financial_risk_index > 40 ? 'high-risk' : 'low-risk'}`}
                                    style={{ width: `${report.financial_risk_index}%` }}
                                />
                            </div>
                        </div>

                        <div className="kpi-card card">
                            <span className="kpi-label">NLP Model Engine</span>
                            <span className="kpi-value text-blue">FinBERT</span>
                            <span className="kpi-subtext">{report.source}</span>
                        </div>
                    </div>

                    {/* Section-by-Section Analysis */}
                    <div className="sections-container">
                        <h2 className="section-heading">
                            <FileText size={20} />
                            Sectional Semantic Decomposition
                        </h2>

                        <div className="sections-list">
                            {report.sections.map((sec, idx) => (
                                <div key={idx} className="section-card card">
                                    <div className="section-header" onClick={() => toggleSection(idx)}>
                                        <div className="section-title-group">
                                            <h3>{sec.section_title}</h3>
                                            <span className="meta-chunks">
                                                {sec.paragraphs_analyzed} Semantic Chunks Analyzed
                                            </span>
                                        </div>

                                        <div className="section-badges">
                                            <span className={`badge-pill ${sec.section_sentiment.toLowerCase()}`}>
                                                {sec.section_sentiment} ({(sec.sentiment_score * 100).toFixed(0)}%)
                                            </span>
                                            <div className="expand-chevron">
                                                {expandedSection === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    {expandedSection === idx && (
                                        <div className="section-body">
                                            <div className="raw-content-box">
                                                <h4>Statutory Disclosure Excerpt:</h4>
                                                <p className="disclosure-text">{sec.content}</p>
                                            </div>

                                            <div className="chunks-breakdown">
                                                <h4>Paragraph-Level FinBERT Attention Scoring:</h4>
                                                <div className="chunk-list">
                                                    {sec.paragraph_breakdown.map((p, pIdx) => (
                                                        <div key={pIdx} className="chunk-row">
                                                            <div className="chunk-meta">
                                                                <span className="chunk-id">Chunk #{pIdx + 1}</span>
                                                                <span className={`chunk-badge ${p.label.toLowerCase()}`}>
                                                                    {p.label} (Confidence: {(p.score * 100).toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                            {p.text_snippet && (
                                                                <p className="chunk-snippet">"{p.text_snippet}"</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                .reports-page {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 1300px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                    gap: 20px;
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
                    max-width: 750px;
                    line-height: 1.5;
                    margin: 0;
                }

                .controls {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .select-input {
                    padding: 10px 16px;
                    background: var(--bg-app);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-refresh {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    background: var(--text-primary);
                    color: var(--bg-app);
                    border: 1px solid var(--text-primary);
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-refresh:hover:not(:disabled) {
                    opacity: 0.88;
                    transform: translateY(-1px);
                }

                .btn-refresh:disabled { 
                    opacity: 0.5; 
                    cursor: not-allowed; 
                    transform: none;
                }
                .spinning { animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .academic-callout {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    padding: 18px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-color);
                }

                [data-theme='light'] .academic-callout {
                    background: rgba(0, 0, 0, 0.02);
                }

                .callout-icon {
                    color: var(--text-primary);
                    margin-top: 2px;
                }

                .callout-text h4 {
                    margin: 0 0 6px 0;
                    font-size: 0.95rem;
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .callout-text p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .callout-text code {
                    background: var(--bg-surface);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: var(--font-mono, monospace);
                    color: var(--primary-blue);
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    gap: 16px;
                    color: var(--text-secondary);
                }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .kpi-card {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .kpi-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-tertiary);
                    font-weight: 600;
                }

                .kpi-value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    font-family: var(--font-mono, monospace);
                }

                .kpi-subtext {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .pos, .neg, .neu { color: var(--text-primary) !important; }
                .text-blue { color: var(--text-primary) !important; }

                .risk-bar-track {
                    height: 6px;
                    background: var(--border-color);
                    border-radius: 3px;
                    margin-top: 8px;
                    overflow: hidden;
                }

                .risk-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                }

                .low-risk { background: rgba(255, 255, 255, 0.4); }
                .high-risk { background: #FFFFFF; }
                [data-theme='light'] .low-risk { background: rgba(0, 0, 0, 0.3); }
                [data-theme='light'] .high-risk { background: #000000; }

                .sections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section-heading {
                    font-size: 1.15rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-primary);
                    margin: 0;
                }

                .sections-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section-card {
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                    transition: border-color 0.2s;
                }

                .section-card:hover {
                    border-color: var(--text-tertiary);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    cursor: pointer;
                    background: var(--bg-surface);
                }

                .section-title-group h3 {
                    margin: 0 0 4px 0;
                    font-size: 1.05rem;
                    color: var(--text-primary);
                    font-weight: 700;
                }

                .meta-chunks {
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                }

                .section-badges {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .badge-pill {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 3px 10px;
                    border-radius: var(--radius-full);
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .badge-pill.bullish {
                    background: #FFFFFF;
                    color: #000000 !important;
                    border: 1px solid #FFFFFF;
                }
                .badge-pill.bearish {
                    background: rgba(255, 255, 255, 0.08);
                    color: #FFFFFF !important;
                    border: 1px solid rgba(255, 255, 255, 0.24);
                    font-weight: 600;
                }
                .badge-pill.neutral {
                    background: rgba(255, 255, 255, 0.03);
                    color: #D4D4D8 !important;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    font-weight: 500;
                }

                [data-theme='light'] .badge-pill.bullish {
                    background: #000000;
                    color: #FFFFFF !important;
                    border: 1px solid #000000;
                }
                [data-theme='light'] .badge-pill.bearish {
                    background: rgba(0, 0, 0, 0.06);
                    color: #000000 !important;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                }
                [data-theme='light'] .badge-pill.neutral {
                    background: transparent;
                    color: #52525B !important;
                    border: 1px dashed rgba(0, 0, 0, 0.2);
                }

                .section-body {
                    padding: 24px;
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-app);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .raw-content-box h4, .chunks-breakdown h4 {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .disclosure-text {
                    font-size: 0.88rem;
                    line-height: 1.7;
                    color: var(--text-primary);
                    background: var(--bg-surface);
                    padding: 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    margin: 0;
                    white-space: pre-line;
                }

                .chunk-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .chunk-row {
                    background: var(--bg-surface);
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .chunk-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .chunk-id {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-tertiary);
                    font-family: var(--font-mono, monospace);
                }

                .chunk-badge {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                }

                .chunk-badge.bullish {
                    background: #FFFFFF;
                    color: #000000 !important;
                    border: 1px solid #FFFFFF;
                }
                .chunk-badge.bearish {
                    background: rgba(255, 255, 255, 0.08);
                    color: #FFFFFF !important;
                    border: 1px solid rgba(255, 255, 255, 0.24);
                }
                .chunk-badge.neutral {
                    background: rgba(255, 255, 255, 0.03);
                    color: #D4D4D8 !important;
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                }

                [data-theme='light'] .chunk-badge.bullish {
                    background: #000000;
                    color: #FFFFFF !important;
                    border: 1px solid #000000;
                }
                [data-theme='light'] .chunk-badge.bearish {
                    background: rgba(0, 0, 0, 0.06);
                    color: #000000 !important;
                    border: 1px solid rgba(0, 0, 0, 0.2);
                }
                [data-theme='light'] .chunk-badge.neutral {
                    background: transparent;
                    color: #52525B !important;
                    border: 1px dashed rgba(0, 0, 0, 0.2);
                }

                .chunk-snippet {
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                    margin: 0;
                    font-style: italic;
                }

                @media (max-width: 1024px) {
                    .page-header { flex-direction: column; align-items: flex-start; gap: 16px; padding: 20px; }
                    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .page-header { padding: 16px; }
                    .page-title { font-size: 1.25rem; }
                    .controls { flex-direction: column; width: 100%; }
                    .select-input, .btn-refresh { width: 100%; justify-content: center; }
                    .kpi-grid { grid-template-columns: 1fr; }
                    .section-header { padding: 14px 16px; flex-direction: column; align-items: flex-start; gap: 10px; }
                    .section-badges { width: 100%; justify-content: space-between; }
                    .section-body { padding: 16px; }
                }
            `}</style>
        </div>
    );
}
