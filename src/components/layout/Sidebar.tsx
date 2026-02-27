'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, Zap, Activity, X } from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';
import Image from 'next/image';

const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useLayout();

  // Handle expansion on mobile when clicking the collapsed sidebar
  const handleSidebarClick = (e: React.MouseEvent) => {
    // Only expand if on mobile AND sidebar is currently collapsed (mini)
    // Check window width safely
    if (typeof window !== 'undefined' && window.innerWidth <= 1024 && !isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />
      <aside
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        onClick={handleSidebarClick}
      >
        <div className="sidebar-header">
          <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image src="/icon.jpeg" alt="ArthVeda AI" width={40} height={40} className="rounded-lg shadow-sm flex-shrink-0 object-cover" />
            <span className="logo-text font-bold text-lg tracking-tight">ArthVeda AI</span>
          </div>
          <button
            className="md:hidden"
            onClick={(e) => {
              e.stopPropagation(); // Prevent bubbling
              closeSidebar();
            }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              // Display is handled by CSS (display: none when :not(.open))
            }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {[
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'News Feed', path: '/news', icon: Newspaper },
            { name: 'Simulator', path: '/simulator', icon: Zap },
            { name: 'AI Signals', path: '/signals', icon: Activity },
          ].map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  // On mobile, if open, we might want to just close?
                  // Navigation will happen, and LayoutProvider closes it.
                  // But if we want to ensure it closes:
                  e.stopPropagation();
                  if (isSidebarOpen) closeSidebar();
                }}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
