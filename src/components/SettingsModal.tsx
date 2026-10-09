'use client';

import React, { useState } from 'react';
import { X, Settings, Check, Save, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              <Settings className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Application Configuration</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Moderation System Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-zinc-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Policy Engine: Active</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Google Review Removal legal justifications are generated via NVIDIA NIM (<code className="font-mono text-rose-500">meta/llama-3.2-11b</code>) grounded in the Google Maps 20 Core Violation Policies.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 px-4 py-2.5 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
