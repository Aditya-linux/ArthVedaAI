'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, User } from 'lucide-react';
import { useLayout } from '@/context/LayoutContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const { toggleSidebar } = useLayout();
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    if (pathname.includes('simulator')) return 'Simulator';
    if (pathname.includes('signals')) return 'AI Signals';
    if (pathname.includes('news')) return 'News Feed';
    if (pathname.includes('dashboard')) return 'Dashboard';
    return 'Dashboard';
  };

  const titleParts = getPageTitle().split(' / ');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="left-section">
          <button
            className="menu-btn"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>

          <div className="breadcrumbs">
            {titleParts.map((part, index) => (
              <span key={index} className={index === titleParts.length - 1 ? 'crumb-active' : 'crumb-inactive'}>
                {part}
                {index < titleParts.length - 1 && <span className="crumb-separator"> / </span>}
              </span>
            ))}
          </div>
        </div>

        <div className="navbar-actions">
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>

          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {/* Auth Section */}
          {!loading && (
            user ? (
              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="avatar">{initials}</div>
                  <span className="user-name">{displayName}</span>
                </button>

                {showDropdown && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{displayName}</div>
                      <div className="dropdown-email">{displayEmail}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={handleSignOut}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="sign-in-btn"
                onClick={() => router.push('/auth')}
              >
                <User size={16} />
                Sign In
              </button>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          height: 64px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 0 32px;
          display: flex;
          align-items: center;
        }
        
        .navbar-content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1600px;
            margin: 0 auto;
        }
        
        .left-section {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .menu-btn {
            display: none;
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 4px;
        }
        
        @media (max-width: 1024px) {
            .menu-btn {
                display: block;
            }
            .navbar {
                padding: 0 16px;
            }
        }
        
        .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
        }
        
        .crumb-inactive { color: var(--text-tertiary); }
        .crumb-separator { color: var(--border-color); margin: 0 8px; }
        .crumb-active { color: var(--text-primary); font-weight: 500; }
        
        .navbar-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .date-display {
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .theme-toggle-btn {
            background: var(--bg-app);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 6px 16px;
            border-radius: var(--radius-full);
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .theme-toggle-btn:hover {
            background: var(--border-color);
        }

        /* Sign In Button */
        .sign-in-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            background: #3B82F6;
            color: white;
            border: none;
            border-radius: var(--radius-full);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        .sign-in-btn:hover {
            background: #2563EB;
            transform: translateY(-1px);
        }

        /* User Menu */
        .user-menu {
            position: relative;
        }
        .user-avatar-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 12px 4px 4px;
            background: var(--bg-app);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-full);
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        .user-avatar-btn:hover {
            border-color: var(--text-tertiary);
        }
        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3B82F6, #6366F1);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .user-name {
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-primary);
        }

        /* Dropdown */
        .dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 240px;
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            box-shadow: 0 10px 40px rgba(0,0,0,0.12);
            z-index: 100;
            overflow: hidden;
        }
        .dropdown-header {
            padding: 16px;
        }
        .dropdown-name {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-primary);
        }
        .dropdown-email {
            font-size: 0.8rem;
            color: var(--text-tertiary);
            margin-top: 2px;
        }
        .dropdown-divider {
            height: 1px;
            background: var(--border-color);
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 12px 16px;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.15s;
            font-family: inherit;
        }
        .dropdown-item:hover {
            background: var(--bg-app);
            color: var(--red);
        }
        
        @media (max-width: 768px) {
            .date-display { display: none; }
            .user-name { display: none; }
        }
      `}</style>
    </header >
  );
};

export default Navbar;
