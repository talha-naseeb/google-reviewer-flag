'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Link2,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  LayoutDashboard
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
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Hide header on login page
  if (pathname === '/login') return null;

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/flag-single') return 'Single Link Flagging';
    if (pathname === '/flag-bulk') return 'Bulk CSV Flagging';
    if (pathname === '/settings') return 'Application Settings';
    return 'Google Flag Reviews';
  };

  const quickLinks = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Flag Single', href: '/flag-single', icon: Link2, highlight: true },
    { label: 'Bulk CSV', href: '/flag-bulk', icon: FileSpreadsheet },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/90 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Toggle Buttons & Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileDrawer}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800/80 transition-all text-xs font-semibold"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-rose-500" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-rose-500" />
          )}
          <span className="hidden lg:inline">{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 hidden md:block" />

        {/* Page Title & Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-1.5 rounded-lg shadow-sm">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 tracking-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Middle & Right side: Quick Links & Theme Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Links Toolbar */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-2.5">
            Quick Links:
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
                    ? 'bg-rose-600 text-white shadow-md'
                    : link.highlight
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Google Maps External Quick Link */}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/60 transition-colors"
          title="Open Google Maps Profile"
        >
          <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
          <span>Google Maps</span>
        </a>

        <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800" />

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/70 text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              <span className="hidden lg:inline text-[11px] text-amber-300">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
              <span className="hidden lg:inline text-[11px] text-indigo-600">Dark Mode</span>
            </>
          )}
        </button>

        {/* Admin Avatar */}
        <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-bold text-xs text-rose-600 dark:text-rose-400 shrink-0">
          A
        </div>
      </div>
    </header>
  );
};
