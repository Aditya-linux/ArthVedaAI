'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useSignalAlerts } from '@/hooks/useSignalAlerts';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    useSignalAlerts();
    const pathname = usePathname();
    // Check if we are on the auth page or landing page
    const isStandalonePage = pathname === '/auth' || pathname === '/';

    if (isStandalonePage) {
        return (
            <main className="w-full min-h-screen bg-[var(--bg-app)]">
                {children}
            </main>
        );
    }

    return (
        <div className="layout-container">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <main className="page-content">{children}</main>
            </div>
        </div>
    );
}
