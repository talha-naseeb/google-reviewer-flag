'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, message?: string) => showToast('success', title, message),
    error: (title: string, message?: string) => showToast('error', title, message),
    warning: (title: string, message?: string) => showToast('warning', title, message),
    info: (title: string, message?: string) => showToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Notifications Container */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isInfo = t.type === 'info';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${
                isSuccess
                  ? 'bg-white/95 dark:bg-zinc-900/95 border-emerald-500/30 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10'
                  : isError
                  ? 'bg-white/95 dark:bg-zinc-900/95 border-rose-500/30 text-rose-900 dark:text-rose-100 shadow-rose-500/10'
                  : isWarning
                  ? 'bg-white/95 dark:bg-zinc-900/95 border-amber-500/30 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
                  : 'bg-white/95 dark:bg-zinc-900/95 border-indigo-500/30 text-indigo-900 dark:text-indigo-100 shadow-indigo-500/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {isInfo && <Info className="w-5 h-5 text-indigo-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-snug text-slate-900 dark:text-zinc-100">
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-zinc-400 mt-0.5">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
