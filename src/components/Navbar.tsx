'use client';

import React from 'react';
import { ShieldAlert, Settings, FlaskConical, Link2, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenLinkModal: () => void;
  onOpenTestModal: () => void;
  onOpenSettingsModal: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLinkModal,
  onOpenTestModal,
  onOpenSettingsModal,
  onTriggerSync,
  isSyncing
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-rose-600 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Google Flag Reviews
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                Phase 2 Live API
              </span>
            </div>
            <p className="text-xs text-slate-400">AI Moderation & Policy Violation Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing GBP...' : 'Sync Reviews'}</span>
          </button>

          <button
            onClick={onOpenLinkModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all"
          >
            <Link2 className="w-4 h-4 text-white" />
            <span>Check Review Link</span>
          </button>

          <button
            onClick={onOpenTestModal}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>Sandbox</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
            title="Settings & API Credentials"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
