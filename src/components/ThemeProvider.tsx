'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextType {
  /** The configured preference: 'system' (default), 'light', or 'dark' */
  theme: ThemeMode;
  /** The actively rendered theme: 'light' or 'dark' */
  resolvedTheme: ResolvedTheme;
  /** Sets the theme to system, light, or dark */
  setTheme: (theme: ThemeMode) => void;
  /** Cycles through available modes: system -> light -> dark -> system */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch (e) {
    return 'light';
  }
};

const applyThemeToDOM = (resolved: ResolvedTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.body.classList.remove('dark');
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine stored preference, default to 'system'
    const stored = (localStorage.getItem('app-theme-v2') as ThemeMode) || 'system';
    setThemeState(stored);

    const systemTheme = getSystemTheme();
    const active: ResolvedTheme = stored === 'system' ? systemTheme : (stored as ResolvedTheme);

    setResolvedTheme(active);
    applyThemeToDOM(active);
    setMounted(true);

    // Setup real-time listener for system OS appearance changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e: MediaQueryListEvent) => {
        const currentStored = (localStorage.getItem('app-theme-v2') as ThemeMode) || 'system';
        if (currentStored === 'system') {
          const nextResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
          setResolvedTheme(nextResolved);
          applyThemeToDOM(nextResolved);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemChange);
      } else {
        // Compatibility for older browsers
        (mediaQuery as any).addListener(handleSystemChange);
      }

      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleSystemChange);
        } else {
          (mediaQuery as any).removeListener(handleSystemChange);
        }
      };
    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('app-theme-v2', newTheme);
      localStorage.setItem('app-theme', newTheme);
    } catch (e) {}

    const systemTheme = getSystemTheme();
    const active: ResolvedTheme = newTheme === 'system' ? systemTheme : (newTheme as ResolvedTheme);
    setResolvedTheme(active);
    applyThemeToDOM(active);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      // Cycle: system -> light -> dark -> system
      let next: ThemeMode = 'system';
      if (current === 'system') next = 'light';
      else if (current === 'light') next = 'dark';
      else next = 'system';

      try {
        localStorage.setItem('app-theme-v2', next);
        localStorage.setItem('app-theme', next);
      } catch (e) {}

      const systemTheme = getSystemTheme();
      const active: ResolvedTheme = next === 'system' ? systemTheme : (next as ResolvedTheme);
      setResolvedTheme(active);
      applyThemeToDOM(active);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <div className={resolvedTheme === 'dark' ? 'dark min-h-screen' : 'light min-h-screen'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
