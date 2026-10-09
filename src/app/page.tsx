'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardStats, Review, ModerationStatus } from '@/types/review';
import {
  LayoutDashboard,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Link2,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function MainDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    flaggedCount: 0,
    pendingGoogleCount: 0,
    removedCount: 0,
    highRiskCount: 0,
    averageRating: 5.0
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Fetch Dashboard Data Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (id: string, status: ModerationStatus) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {}
  };

  const handleCopyReason = (reasonText: string, id: string) => {
    navigator.clipboard.writeText(reasonText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenGoogleLink = (targetUrl: string, reasonText: string) => {
    if (reasonText) navigator.clipboard.writeText(reasonText);
    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-rose-600 dark:text-rose-500" />
            Flagged Reviews Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Overview of submitted flagged reviews & live Google moderation tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
          </button>

          <Link
            href="/flag-single"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-rose-950/20 transition-all"
          >
            <Link2 className="w-4 h-4" />
            <span>Flag Single Review</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Submitted Flags</span>
            <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-zinc-100">{stats.flaggedCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Total reviews submitted to backend</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Pending Google</span>
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-zinc-100">{stats.pendingGoogleCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Awaiting Google policy review</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Removed by Google</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-zinc-100">{stats.removedCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Successfully removed from profile</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Removal Rate</span>
            <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-zinc-100">
            {stats.flaggedCount > 0 ? Math.round((stats.removedCount / stats.flaggedCount) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Moderation success efficiency</p>
        </div>
      </div>

      {/* Structured HTML Data Table */}
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
              <span>Submitted Flagged Reviews</span>
              <span className="text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                {reviews.length} Total
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Persisted in JSON database store</p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-zinc-950/40">
                  <th className="py-3 px-4 rounded-l-lg">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Policy Rule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI Removal Description</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
                {reviews.map((r) => {
                  const rule = r.analysis?.primaryViolation;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-200">
                        {r.reviewerName}
                        <span className="block text-[11px] text-slate-400 dark:text-zinc-500 font-normal">{r.datePosted}</span>
                      </td>
                      <td className="py-3.5 px-4 text-amber-500 font-bold">{r.rating}★</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold px-2.5 py-1 rounded-md inline-block max-w-[200px] truncate">
                          Rule #{rule?.ruleNumber || 1}: {rule?.ruleTitle || 'Content Policy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {r.status === 'REMOVED' ? (
                          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                            Removed by Google
                          </span>
                        ) : (
                          <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                            Pending Google Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-[11px] text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-950 px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-800">
                            {r.analysis?.generatedReportReason || r.comment}
                          </span>
                          {r.analysis?.generatedReportReason && (
                            <button
                              onClick={() => handleCopyReason(r.analysis!.generatedReportReason, r.id)}
                              className="shrink-0 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              title="Copy Description"
                            >
                              {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenGoogleLink(r.googleReviewUrl || '', r.analysis?.generatedReportReason || '')}
                            className="bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-zinc-700/80 transition-colors"
                            title="Open Google Maps Review"
                          >
                            <ExternalLink className="w-3 h-3 text-rose-500" />
                            <span>Link</span>
                          </button>

                          {r.status !== 'REMOVED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'REMOVED')}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors font-semibold"
                            >
                              Mark Removed
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500 dark:text-zinc-400 space-y-3 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-200 dark:border-zinc-800/60">
            <p className="text-slate-600 dark:text-zinc-400 font-medium">No flagged review submissions recorded yet.</p>
            <Link
              href="/flag-single"
              className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flag your first Google review link</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
