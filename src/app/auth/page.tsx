'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/simulator';
    const authError = searchParams.get('error');

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && user) {
            router.push(redirectTo);
        }
    }, [user, loading, router, redirectTo]);

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="spinner" />
                <style jsx>{`
                    .auth-loading {
                        display: flex; align-items: center; justify-content: center;
                        min-height: 100vh; background: var(--bg-app);
                    }
                    .spinner {
                        width: 40px; height: 40px;
                        border: 3px solid var(--border-color);
                        border-top-color: var(--primary-blue);
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="auth-page">
            {/* Background Effects */}
            <div className="bg-orb orb-1" />
            <div className="bg-orb orb-2" />
            <div className="bg-orb orb-3" />

            {/* Header */}
            <div className="auth-header">
                <Link href="/" className="logo">
                    <Image src="/icon.jpeg" alt="ArthVeda AI" width={64} height={64} className="flex-shrink-0 object-contain" />
                    <span className="logo-text">ArthVeda AI</span>
                </Link>
            </div>

            {/* Auth Card */}
            <div className="auth-card">
                <div className="card-icon">
                    <Image src="/icon.jpeg" alt="ArthVeda AI Icon" width={56} height={56} className="object-contain" />
                </div>

                <h1>Welcome to ArthVeda AI</h1>
                <p className="subtitle">
                    Sign in to access the Paper Trading Simulator and AI Trade Signals
                </p>

                {/* Error Message */}
                {authError && (
                    <div className="message error">
                        <AlertCircle size={16} />
                        <span>Authentication failed. Please try again.</span>
                    </div>
                )}

                {/* Google Sign-In Button */}
                <button className="google-btn" onClick={signInWithGoogle}>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <div className="divider">
                    <span>Secure authentication via Supabase</span>
                </div>

                <div className="benefits">
                    <div className="benefit">
                        <CheckCircle2 size={16} />
                        <span>One-click sign in, no passwords</span>
                    </div>
                    <div className="benefit">
                        <CheckCircle2 size={16} />
                        <span>$100,000 virtual trading account</span>
                    </div>
                    <div className="benefit">
                        <CheckCircle2 size={16} />
                        <span>Real-time AI trade signals</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="footer-text">
                Dashboard and News Feed are free to access without signing in
            </p>

            <style jsx>{`
                .auth-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-app);
                }

                /* Background Orbs */
                .bg-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    pointer-events: none;
                    z-index: 0;
                }
                .orb-1 {
                    width: 600px; height: 600px;
                    background: rgba(59, 130, 246, 0.12);
                    top: -200px; left: -100px;
                    animation: float 8s ease-in-out infinite;
                }
                .orb-2 {
                    width: 500px; height: 500px;
                    background: rgba(99, 102, 241, 0.08);
                    bottom: -150px; right: -100px;
                    animation: float 10s ease-in-out infinite reverse;
                }
                .orb-3 {
                    width: 300px; height: 300px;
                    background: rgba(16, 185, 129, 0.06);
                    top: 50%; left: 60%;
                    animation: float 12s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }

                /* Header */
                .auth-header {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    padding: 24px 32px;
                    z-index: 10;
                }
                .logo {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                }
                .logo-icon {
                    width: 36px; height: 36px;
                    background: #3B82F6;
                    color: white;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.8rem;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                .logo-text {
                    font-weight: 700;
                    font-size: 1.15rem;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                }

                /* Card */
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    padding: 48px 40px;
                    position: relative;
                    z-index: 10;
                    text-align: center;
                    box-shadow:
                        0 4px 6px -1px rgba(0, 0, 0, 0.05),
                        0 20px 50px -12px rgba(0, 0, 0, 0.08);
                    backdrop-filter: blur(20px);
                }

                .card-icon {
                    width: 80px; height: 80px;
                    margin: 0 auto 24px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05));
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1);
                }

                h1 {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 8px 0;
                    letter-spacing: -0.03em;
                }

                .subtitle {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin: 0 0 32px 0;
                    line-height: 1.5;
                }

                /* Error */
                .message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                    text-align: left;
                }
                .message.error {
                    background: var(--red-bg);
                    color: var(--red);
                    border: 1px solid rgba(185, 28, 28, 0.15);
                }

                /* Google Button */
                .google-btn {
                    width: 100%;
                    padding: 14px 24px;
                    background: var(--bg-app);
                    border: 1.5px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                .google-btn:hover {
                    border-color: var(--text-tertiary);
                    background: var(--bg-surface);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                    transform: translateY(-1px);
                }
                .google-btn:active {
                    transform: translateY(0);
                }

                /* Divider */
                .divider {
                    margin: 28px 0 20px;
                    position: relative;
                    text-align: center;
                }
                .divider span {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    background: var(--bg-surface);
                    padding: 0 12px;
                    position: relative;
                    letter-spacing: 0.02em;
                }
                .divider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--border-color);
                }

                /* Benefits */
                .benefits {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    text-align: left;
                }
                .benefit {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                .benefit :global(svg) {
                    color: #3B82F6;
                    flex-shrink: 0;
                }

                /* Footer */
                .footer-text {
                    margin-top: 24px;
                    font-size: 0.8rem;
                    color: var(--text-tertiary);
                    z-index: 10;
                }

                /* Responsive */
                @media (max-width: 480px) {
                    .auth-card {
                        padding: 36px 24px;
                        border-radius: 20px;
                    }
                    h1 {
                        font-size: 1.35rem;
                    }
                }
            `}</style>
        </div>
    );
}
