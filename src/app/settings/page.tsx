'use client';

import React, { useState } from 'react';
import { Settings, Save, Check, ExternalLink, Bell, Send, Radio } from 'lucide-react';

export default function SettingsPage() {
  const [gbpAccountId, setGbpAccountId] = useState('');
  const [gbpLocationId, setGbpLocationId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/DEMO/WEBHOOK');
  const [alertEmailRecipient, setAlertEmailRecipient] = useState('manager@business.com');

  const [saved, setSaved] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
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
      } else {
        setTestResult(`Error: ${data.error || 'Failed to dispatch test'}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md">
        <h2 className="font-bold text-xl sm:text-2xl text-zinc-100 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-rose-500" />
          Application Settings & Integrations
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Manage Google Business API credentials & Real-time Webhook Notifications
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Google OAuth Banner */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Google Business Profile OAuth Authorization
            </span>
            <p className="text-[11px] text-zinc-400">Connect your Google account to sync live locations and reviews.</p>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = '/api/auth/google')}
            className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Connect Google Account</span>
          </button>
        </div>

        {/* Section 1: GBP API Config */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Google Business Profile API Config</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Google Account ID</label>
              <input
                type="text"
                value={gbpAccountId}
                onChange={(e) => setGbpAccountId(e.target.value)}
                placeholder="accounts/1092837..."
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Location Resource Name</label>
              <input
                type="text"
                value={gbpLocationId}
                onChange={(e) => setGbpLocationId(e.target.value)}
                placeholder="locations/847291..."
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Real-time Webhooks & Notifications */}
        <div className="space-y-3 border-t border-zinc-800/80 pt-5">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-400" />
            Real-Time Webhook & Email Notifications
          </h3>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Webhook URL (Slack / Discord / Zapier)</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Alert Email Recipient</label>
            <input
              type="email"
              value={alertEmailRecipient}
              onChange={(e) => setAlertEmailRecipient(e.target.value)}
              placeholder="manager@business.com"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testingWebhook}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{testingWebhook ? 'Dispatching...' : 'Send Test Notification'}</span>
            </button>

            {testResult && <span className="text-xs text-emerald-400 font-medium">{testResult}</span>}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-lg"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved Configuration!' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
