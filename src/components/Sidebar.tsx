'use client';

import React from 'react';
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
  X
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const pathname = usePathname();
  const router = useRouter();

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
      {/* Mobile Collapsible Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800/90 h-full p-5 flex flex-col justify-between z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2 rounded-xl shadow-lg">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight">Google Flag Reviews</h2>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">AI Flagging Assistant</p>
                  </div>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
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
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer & Logout */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-rose-500">
                  A
                </div>
                <div className="overflow-hidden text-xs">
                  <p className="font-semibold text-slate-900 dark:text-zinc-200 truncate">Admin Business Profile</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">admin@googleflags.com</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-zinc-700/70 text-xs font-semibold py-2.5 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 h-screen z-40 bg-white dark:bg-zinc-900/95 border-r border-slate-200 dark:border-zinc-800/80 flex-col justify-between hidden md:flex transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* App Logo & Collapse Button Header */}
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2 rounded-xl shadow-lg shadow-rose-950/30 shrink-0">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden transition-all">
                  <h1 className="font-bold text-base text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                    Google Flag Reviews
                  </h1>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Pro Active
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer & Sidebar Collapse Trigger */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800/80 space-y-3 bg-slate-50/50 dark:bg-zinc-950/40">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-rose-500 shrink-0">
                A
              </div>
              <div className="overflow-hidden text-xs">
                <p className="font-semibold text-slate-900 dark:text-zinc-200 truncate">Admin Business Profile</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">admin@googleflags.com</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Log Out"
            className={`w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-zinc-700/80 text-xs font-semibold ${
              isCollapsed ? 'p-2.5' : 'py-2 px-3'
            } rounded-xl transition-all`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
