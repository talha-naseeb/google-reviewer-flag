'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  Link2,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hide sidebar on login page
  if (pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Single Link Flagging', href: '/flag-single', icon: Link2 },
    { label: 'Bulk CSV Flagging', href: '/flag-bulk', icon: FileSpreadsheet },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <header className="md:hidden sticky top-0 z-40 w-full bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-1.5 rounded-xl shadow-md">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-zinc-100 tracking-tight">Google Flag Reviews</h1>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
              Pro Active
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Collapsible Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-zinc-900 border-r border-zinc-800/90 h-full p-5 flex flex-col justify-between z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2 rounded-xl shadow-lg">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-zinc-100 tracking-tight">Google Flag Reviews</h2>
                    <p className="text-[11px] text-zinc-400">AI Flagging Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer & Logout */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-rose-400">
                  A
                </div>
                <div className="overflow-hidden text-xs">
                  <p className="font-semibold text-zinc-200 truncate">Admin Business Profile</p>
                  <p className="text-[11px] text-zinc-400 truncate">admin@googleflags.com</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 text-rose-400 border border-zinc-700/70 text-xs font-semibold py-2.5 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Permanent Sidebar */}
      <aside className="w-64 bg-zinc-900/90 border-r border-zinc-800/80 shrink-0 flex-col justify-between hidden md:flex min-h-screen sticky top-0">
        <div className="p-5 space-y-6">
          {/* App Logo */}
          <div className="flex items-center space-x-3 px-1">
            <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2 rounded-xl shadow-lg shadow-rose-950/40">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base text-zinc-100 tracking-tight">Google Flag Reviews</h1>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Pro Version Active
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3 bg-zinc-950/40">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-rose-400">
              A
            </div>
            <div className="overflow-hidden text-xs">
              <p className="font-semibold text-zinc-200 truncate">Admin Business Profile</p>
              <p className="text-[11px] text-zinc-400 truncate">admin@googleflags.com</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 text-rose-400 border border-zinc-700/80 text-xs font-semibold py-2 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
