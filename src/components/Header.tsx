'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  Sun,
  Moon,
  Monitor,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Link2,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  ShieldAlert,
  LayoutDashboard,
  Zap,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onToggleMobileDrawer
}) => {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [userInitial, setUserInitial] = useState('A');
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('userName');
      const email = localStorage.getItem('userEmail');
      const initial = (name || email || 'A').charAt(0).toUpperCase();
      setUserInitial(initial);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setIsQuickMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isQuickMenuOpen || isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQuickMenuOpen, isThemeMenuOpen]);

  // Hide header on login page
  if (pathname === '/login') return null;

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/flag-single') return 'Flag Single';
    if (pathname === '/flag-bulk') return 'Bulk CSV';
    if (pathname === '/settings') return 'Settings';
    return 'Reviews';
  };

  const quickLinks = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Flag Single', href: '/flag-single', icon: Link2, primary: true },
    { label: 'Bulk CSV', href: '/flag-bulk', icon: FileSpreadsheet },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/95 dark:bg-zinc-900/95 border-b border-slate-200 dark:border-zinc-800/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left section: Nav Toggles & Page Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu trigger (< md) */}
        <button
          onClick={onToggleMobileDrawer}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle (>= md) */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-all text-xs font-semibold shrink-0"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-rose-500" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-rose-500" />
          )}
          <span className="hidden xl:inline">{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 hidden md:block shrink-0" />

        {/* Page Badge & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-1.5 rounded-lg shadow-sm shrink-0">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 tracking-tight truncate">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right section: Quick Links, Theme Switcher & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Quick Action Button: Direct Flag Single (< sm) */}
        <Link
          href="/flag-single"
          className="sm:hidden flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition-all shrink-0"
          title="Flag Single Review"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Flag</span>
        </Link>

        {/* Mobile Quick Links Dropdown Trigger (< lg) */}
        <div className="relative xl:hidden" ref={quickMenuRef}>
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className={`flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isQuickMenuOpen
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
            title="Quick Links Menu"
            aria-label="Quick Links Menu"
            aria-expanded={isQuickMenuOpen}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">Quick Links</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isQuickMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Dropdown Menu */}
          {isQuickMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-3 py-1">
                Quick Shortcuts
              </div>
              <div className="space-y-0.5">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsQuickMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white font-semibold'
                          : link.primary
                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 text-rose-500" />
                    <span>Google Maps</span>
                  </span>
                  <span className="text-[10px] text-slate-400">External</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Quick Links Toolbar (>= xl) */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2.5">
            Quick:
          </span>
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm'
                    : link.primary
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Google Maps External Quick Link (>= 2xl) */}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/60 transition-colors shrink-0"
          title="Open Google Maps Profile"
        >
          <ExternalLink className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Maps</span>
        </a>

        <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 shrink-0" />

        {/* Theme Selector (System Auto / Light / Dark) */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`p-2 sm:px-2.5 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm shrink-0 ${
              isThemeMenuOpen
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700/70 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
            title={`Current Theme: ${theme === 'system' ? `System (${resolvedTheme})` : theme}. Click to customize.`}
            aria-label="Theme Mode Selection"
            aria-expanded={isThemeMenuOpen}
          >
            {theme === 'system' ? (
              <>
                <Monitor className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="hidden xl:inline text-[11px] text-slate-600 dark:text-zinc-300">
                  Auto ({resolvedTheme})
                </span>
              </>
            ) : theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="hidden xl:inline text-[11px] text-indigo-300">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="hidden xl:inline text-[11px] text-amber-600">Light</span>
              </>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${
                isThemeMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Theme Dropdown Menu */}
          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2.5 py-1">
                Appearance
              </div>
              <div className="space-y-0.5">
                {/* System Auto option */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('system');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    theme === 'system'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>System Default</span>
                  </span>
                  {theme === 'system' && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                </button>

                {/* Light option */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Light Mode</span>
                  </span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                </button>

                {/* Dark option */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    setIsThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Dark Mode</span>
                  </span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800/80 mt-1 pt-1.5 px-2.5 pb-1">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {theme === 'system'
                    ? `Auto-reflecting OS (${resolvedTheme})`
                    : `Locked to ${theme} mode`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-600 dark:text-rose-400 shrink-0"
          title="User Profile"
        >
          {userInitial}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
