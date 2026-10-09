'use client';

import React, { useState } from 'react';
import { X, Settings, Key, Check, Save, Bell, Radio, ExternalLink, Send } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const SHOW_LEGACY_INTEGRATIONS = false;
  const [gbpAccountId, setGbpAccountId] = useState('');
  const [gbpLocationId, setGbpLocationId] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  // Phase 2 Notification Settings
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [alertEmailRecipient, setAlertEmailRecipient] = useState('manager@business.com');
  const [enableWebhookAlerts, setEnableWebhookAlerts] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/DEMO/WEBHOOK');

  const [saved, setSaved] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
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

  const handleGoogleOAuthLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">Phase 2 Live API & Alert Settings</h2>
              <p className="text-xs text-slate-400">Manage Google Business API & Real-time Webhook Notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {SHOW_LEGACY_INTEGRATIONS && (
            <>
              {/* OAuth Direct Login Banner */}
              <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/40 border border-blue-800/40 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Google Business Profile OAuth Authorization
                  </span>
                  <p className="text-[11px] text-slate-400">Connect your Google account to sync live locations and reviews.</p>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleOAuthLogin}
                  className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Connect Google</span>
                </button>
              </div>

              {/* Section 1: GBP API Identifiers */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Google Business Profile API Config</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Google Account ID</label>
                    <input
                      type="text"
                      value={gbpAccountId}
                      onChange={(e) => setGbpAccountId(e.target.value)}
                      placeholder="accounts/1092837..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Location Resource Name</label>
                    <input
                      type="text"
                      value={gbpLocationId}
                      onChange={(e) => setGbpLocationId(e.target.value)}
                      placeholder="locations/847291..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Real-time Webhook & Notification Settings */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Real-Time High Risk Fake Review Alerts
                </h3>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Webhook URL (Slack / Discord / Zapier)</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Alert Email Recipient</label>
                  <input
                    type="email"
                    value={alertEmailRecipient}
                    onChange={(e) => setAlertEmailRecipient(e.target.value)}
                    placeholder="manager@business.com"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>{testingWebhook ? 'Dispatching...' : 'Send Test Alert'}</span>
                  </button>

                  {testResult && <span className="text-xs text-emerald-400">{testResult}</span>}
                </div>
              </div>
            </>
          )}

          {/* Section 3: AI Engine Keys */}
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Engine API Keys</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Gemini API Key (Optional)</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">OpenAI API Key (Optional)</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
