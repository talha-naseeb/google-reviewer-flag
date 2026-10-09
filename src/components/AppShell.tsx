'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
        {!isAuthPage && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileOpen}
            onCloseMobile={() => setIsMobileOpen(false)}
          />
        )}

        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
            !isAuthPage
              ? isSidebarCollapsed
                ? 'md:pl-20'
                : 'md:pl-64'
              : ''
          }`}
        >
          {!isAuthPage && (
            <Header
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onToggleMobileDrawer={() => setIsMobileOpen(true)}
            />
          )}

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
      </ToastProvider>
    </ThemeProvider>
  );
};
