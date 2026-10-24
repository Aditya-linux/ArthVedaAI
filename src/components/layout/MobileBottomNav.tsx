'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, FileText, Activity, Zap } from 'lucide-react';

const navItems = [
    { label: 'Terminal', path: '/dashboard', icon: LayoutDashboard },
    { label: 'News', path: '/news', icon: Newspaper },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Signals', path: '/signals', icon: Activity },
    { label: 'Simulator', path: '/simulator', icon: Zap },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
            {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                const IconComponent = item.icon;

                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <IconComponent size={20} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
