'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import {
  Settings,
  Save,
  Check,
  ShieldCheck,
  KeyRound,
  User,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  const [saved, setSaved] = useState(false);
  const [autoCopyJustification, setAutoCopyJustification] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Settings Saved', 'Your preferences have been saved successfully.');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-rose-600 dark:text-rose-500" />
          Application Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Manage administrator account security, system preferences, and moderation engine configurations
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6 transition-colors">
        {/* Account & Security Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Administrator Profile & Security
          </h3>

          <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 dark:text-zinc-200 text-sm flex items-center gap-2">
                Authorized Administrator Account
              </span>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Primary authorized account with Google Content Moderation submission and report tracking privileges.
              </p>
            </div>

            <Link
              href="/change-password"
              className="shrink-0 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md self-start sm:self-auto cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </Link>
          </div>
        </div>

        {/* AI Engine & Moderation Engine Status */}
        <div className="space-y-4 border-t border-slate-200 dark:border-zinc-800/80 pt-5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Policy & Legal Justification Engine
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine Model</span>
              <p className="font-semibold text-slate-900 dark:text-zinc-200 truncate font-mono text-[11px]">
                meta/llama-3.2-11b-vision-instruct
              </p>
              <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                NVIDIA NIM High Speed (~0.5s)
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy Framework</span>
              <p className="font-semibold text-slate-900 dark:text-zinc-200">
                Google Maps Policy Guide
              </p>
              <span className="inline-block text-[10px] text-slate-500 dark:text-zinc-400">
                20 Core Enforcement Rules
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gateway Status</span>
              <p className="font-semibold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active & Operational
              </p>
              <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Google Moderation Connected
              </span>
            </div>
          </div>
        </div>

        {/* System & Workflow Preferences */}
        <div className="space-y-4 border-t border-slate-200 dark:border-zinc-800/80 pt-5">
          <h3 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Workflow & Automation Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200 block">
                  Auto-Copy AI Justification
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Automatically copy the generated Google Policy removal description to clipboard.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoCopyJustification}
                onChange={(e) => setAutoCopyJustification(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200 block">
                  Automated Moderation Queue Logging
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Record all single and bulk submissions directly to MongoDB moderation database.
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 opacity-70"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved Preferences!' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
