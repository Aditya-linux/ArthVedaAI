'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sun, Moon, ArrowRight, ArrowUpRight, Menu, X, BarChart3, Newspaper, Zap, Activity, FileText } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="font-['DM_Sans'] min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300 overflow-x-hidden">
      <Header />
      <HeroSection />
      <Footer />
    </div>
  )
}

/* ──────────── Header ──────────── */
function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon.jpeg" alt="ArthVeda AI" width={36} height={36} className="rounded-lg shadow-sm flex-shrink-0 object-cover" />
          <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">ArthVeda AI</span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Terminal</Link>
          <Link href="/news" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">News</Link>
          <Link href="/reports" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">SEC Filings</Link>
          <Link href="/signals" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Signals</Link>
          <Link href="/simulator" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Simulator</Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-4 sm:px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs sm:text-sm font-semibold rounded-full hover:opacity-90 transition-all shadow-md"
          >
            Launch Terminal
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-fade-in-up">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <BarChart3 size={18} className="text-blue-500" />
            Terminal / Dashboard
          </Link>
          <Link
            href="/news"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Newspaper size={18} className="text-blue-500" />
            Market Intelligence Feed
          </Link>
          <Link
            href="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <FileText size={18} className="text-blue-500" />
            SEC Filings & Reports NLP
          </Link>
          <Link
            href="/signals"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Activity size={18} className="text-blue-500" />
            AI Trade Signals & Prediction
          </Link>
          <Link
            href="/simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Zap size={18} className="text-blue-500" />
            Paper Trading Simulator
          </Link>
          <div className="pt-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-md"
            >
              Get Started Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

/* ──────────── Hero Section ──────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen pt-20 sm:pt-24 flex flex-col justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] lg:w-[800px] h-[320px] sm:h-[600px] lg:h-[800px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-orange-500/5 dark:bg-orange-500/8 rounded-full blur-[90px]" />
      </div>

      {/* Main Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 py-8 lg:py-12">

        {/* Left Column — Title + Subtext (spans 7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center gap-6 sm:gap-8">
          {/* Live Badge */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              FinBERT Financial NLP & Sentiment Engine
            </div>
          </div>

          {/* Massive Headline */}
          <div className="animate-fade-in-up-delay-1">
            <h1 className="text-4xl sm:text-6xl lg:text-[5rem] xl:text-[5.75rem] font-black tracking-tight leading-[0.95] uppercase">
              <span className="block text-zinc-900 dark:text-white">SMARTER</span>
              <span className="block text-zinc-900 dark:text-white">WAY TO</span>
              <span className="block text-zinc-400 dark:text-zinc-500">THINK</span>
              <span className="block text-zinc-900 dark:text-white">ABOUT</span>
              <span className="block bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text' }}>TRADING</span>
            </h1>
          </div>

          {/* Subtext */}
          <div className="animate-fade-in-up-delay-2 max-w-lg">
            <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              ArthVeda AI analyzes real-time statutory SEC 10-K filings, earnings transcripts, and global financial news using domain-adapted transformer NLP to forecast directional market sentiment.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-all text-sm sm:text-base shadow-lg shadow-zinc-900/10 dark:shadow-white/10"
            >
              LAUNCH TRADING TERMINAL
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-sm sm:text-base text-center"
            >
              Paper Trading Simulator
            </Link>
          </div>
        </div>

        {/* Right Column — Stats + 3D Visual (spans 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-center">

          {/* 3D Wireframe Visual */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-md mx-auto">
            <TorusWireframe />
          </div>

          {/* Statistics Panel */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-200 dark:divide-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm animate-fade-in-up-delay-2 shadow-sm">
            <StatItem value="93.8%" label="FinBERT Benchmark Accuracy" />
            <StatItem value="18 hrs" label="Half-Life Sentiment Decay" />
            <StatItem value="50K+" label="Filings & Articles Indexed" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────── 3D Torus Wireframe ──────────── */
function TorusWireframe() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* SVG Torus */}
      <svg viewBox="0 0 400 400" className="w-full h-full animate-float" style={{ maxWidth: '320px' }}>
        <defs>
          <linearGradient id="torus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="[stop-color:#3B82F6] dark:[stop-color:#60A5FA]" />
            <stop offset="50%" className="[stop-color:#8B5CF6] dark:[stop-color:#A78BFA]" />
            <stop offset="100%" className="[stop-color:#F97316] dark:[stop-color:#FB923C]" />
          </linearGradient>
        </defs>
        {/* Outer rings */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <ellipse
            key={angle}
            cx="200" cy="200"
            rx="140" ry="60"
            fill="none"
            stroke="url(#torus-grad)"
            strokeWidth="0.8"
            opacity="0.4"
            transform={`rotate(${angle} 200 200)`}
          />
        ))}
        {/* Inner detail rings */}
        {[0, 45, 90, 135].map((angle) => (
          <ellipse
            key={`inner-${angle}`}
            cx="200" cy="200"
            rx="100" ry="40"
            fill="none"
            stroke="url(#torus-grad)"
            strokeWidth="0.5"
            opacity="0.25"
            transform={`rotate(${angle} 200 200)`}
          />
        ))}
        {/* Horizontal rings at different positions */}
        {[-40, -20, 0, 20, 40].map((offset) => (
          <ellipse
            key={`horiz-${offset}`}
            cx="200" cy={200 + offset}
            rx={130 - Math.abs(offset) * 0.5} ry={15 + Math.abs(offset) * 0.3}
            fill="none"
            stroke="url(#torus-grad)"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        {/* Center glow dot */}
        <circle cx="200" cy="200" r="4" className="fill-blue-500 dark:fill-blue-400" opacity="0.8">
          <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Orbiting dots */}
        {[0, 120, 240].map((start, i) => (
          <circle key={`dot-${i}`} r="2.5" className="fill-blue-500 dark:fill-blue-400" opacity="0.7">
            <animateMotion
              dur={`${6 + i * 2}s`}
              repeatCount="indefinite"
              path={`M200,200 m-140,0 a140,60 0 1,0 280,0 a140,60 0 1,0 -280,0`}
              begin={`${i * 2}s`}
            />
          </circle>
        ))}
      </svg>

      {/* Floating data points */}
      <div className="absolute top-4 sm:top-8 right-2 sm:right-8 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-[11px] font-mono text-green-600 dark:text-green-400 shadow-md animate-float" style={{ animationDelay: '1s' }}>
        +2.47%
      </div>
      <div className="absolute bottom-6 sm:bottom-12 left-2 sm:left-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] sm:text-[11px] font-mono text-blue-600 dark:text-blue-400 shadow-md animate-float" style={{ animationDelay: '2s' }}>
        Bullish 87%
      </div>
    </div>
  )
}

/* ──────────── Stat Item ──────────── */
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 group">
      <div>
        <div className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">{value}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</div>
      </div>
      <ArrowUpRight size={20} className="text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
    </div>
  )
}

/* ──────────── Footer ──────────── */
function Footer() {
  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400 dark:text-zinc-600">
        <p>© 2026 ArthVeda AI. All rights reserved.</p>
        <p>Invest with Intelligence are subject to market risks Read all the related documents carefully before investing.</p>
      </div>
    </footer>
  )
}

/* ──────────── Theme Toggle ──────────── */
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
