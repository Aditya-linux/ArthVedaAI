'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="auth-guard-loading">
                <div className="spinner" />
                <p>Loading...</p>
                <style jsx>{`
                    .auth-guard-loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 60vh;
                        gap: 16px;
                        color: var(--text-secondary);
                    }
                    .spinner {
                        width: 36px;
                        height: 36px;
                        border: 3px solid var(--border-color);
                        border-top-color: var(--primary-blue);
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
