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
  Sparkles,
  ExternalLink,
  Bell,
  Send,
  Radio
} from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  // Flag to hide legacy / prototype integrations as requested
  const SHOW_LEGACY_INTEGRATIONS = false;

  const [gbpAccountId, setGbpAccountId] = useState('');
  const [gbpLocationId, setGbpLocationId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/DEMO/WEBHOOK');
  const [alertEmailRecipient, setAlertEmailRecipient] = useState('manager@business.com');

  const [saved, setSaved] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Preference Toggles
  const [autoCopyJustification, setAutoCopyJustification] = useState(true);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Settings Saved', 'Your preferences have been saved successfully.');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, alertEmailRecipient })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('Test alert sent successfully!');
        toast.success('Notification Dispatched', 'Test alert sent to webhook and email.');
      } else {
        const errorMsg = data.error || 'Failed to dispatch test';
        setTestResult(`Error: ${errorMsg}`);
        toast.error('Webhook Error', errorMsg);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
      toast.error('Dispatch Error', err.message || 'Network error occurred');
    } finally {
      setTestingWebhook(false);
    }
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
                admin@googlereviewer.com
              </span>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Primary authorized administrator account with Google Content Moderation submission privileges.
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
                OAuth Credentials Linked
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

        {/* Hidden Legacy / Prototype Integrations (Preserved for future unhiding) */}
        {SHOW_LEGACY_INTEGRATIONS && (
          <div className="space-y-6 border-t border-slate-200 dark:border-zinc-800/80 pt-5">
            {/* Google OAuth Banner */}
            <div className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-zinc-200 text-xs flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Google Business Profile OAuth Authorization
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Connect your Google account to sync live locations and reviews.
                </p>
              </div>
              <button
                type="button"
                onClick={() => (window.location.href = '/api/auth/google')}
                className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Connect Google Account</span>
              </button>
            </div>

            {/* Section 1: GBP API Config */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Google Business Profile API Config
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Google Account ID
                  </label>
                  <input
                    type="text"
                    value={gbpAccountId}
                    onChange={(e) => setGbpAccountId(e.target.value)}
                    placeholder="accounts/1092837..."
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                    Location Resource Name
                  </label>
                  <input
                    type="text"
                    value={gbpLocationId}
                    onChange={(e) => setGbpLocationId(e.target.value)}
                    placeholder="locations/847291..."
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Real-time Webhooks & Notifications */}
            <div className="space-y-3 border-t border-slate-200 dark:border-zinc-800/80 pt-5">
              <h3 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                Real-Time Webhook & Email Notifications
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Webhook URL (Slack / Discord / Zapier)
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Alert Email Recipient
                </label>
                <input
                  type="email"
                  value={alertEmailRecipient}
                  onChange={(e) => setAlertEmailRecipient(e.target.value)}
                  placeholder="manager@business.com"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-amber-500" />
                  <span>{testingWebhook ? 'Dispatching...' : 'Send Test Notification'}</span>
                </button>

                {testResult && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    {testResult}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

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
