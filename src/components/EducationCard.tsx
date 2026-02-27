'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, RefreshCw } from 'lucide-react';
import { EDUCATION_TIPS } from '@/data/educationTips';

export default function EducationCard() {
    const [tipIndex, setTipIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Random tip on mount
        setTipIndex(Math.floor(Math.random() * EDUCATION_TIPS.length));
    }, []);

    const nextTip = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setTipIndex((prev) => {
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * EDUCATION_TIPS.length);
                } while (nextIndex === prev && EDUCATION_TIPS.length > 1);
                return nextIndex;
            });
            setIsAnimating(false);
        }, 300);
    };

    const tip = EDUCATION_TIPS[tipIndex] || EDUCATION_TIPS[0];

    return (
        <div className="education-card card">
            <div className="card-header">
                <div className="title-group">
                    <Lightbulb size={20} className="icon-bulb" />
                    <h3 className="card-title">Daily Knowledge</h3>
                </div>
                <button onClick={nextTip} className="btn-refresh" title="Next Tip">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className={`tip-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
                <span className="tip-category">{tip.category}</span>
                <h4 className="tip-title">{tip.title}</h4>
                <p className="tip-text">{tip.content}</p>
            </div>

            <style jsx>{`
                .education-card {
                    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-app) 100%);
                    border-left: 4px solid var(--yellow);
                    padding: 20px;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .title-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .icon-bulb {
                    color: var(--yellow);
                    fill: var(--yellow-bg);
                }

                .card-title {
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-primary);
                }

                .btn-refresh {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-tertiary);
                    transition: all 0.2s;
                    padding: 4px;
                    border-radius: 50%;
                    display: flex;
                }

                .btn-refresh:hover {
                    background: var(--bg-surface);
                    color: var(--primary-blue);
                    transform: rotate(180deg);
                }

                .tip-content {
                    transition: opacity 0.3s ease;
                }

                .fade-out { opacity: 0; }
                .fade-in { opacity: 1; }

                .tip-category {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: block;
                    margin-bottom: 4px;
                }

                .tip-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 8px 0;
                    line-height: 1.3;
                }

                .tip-text {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
