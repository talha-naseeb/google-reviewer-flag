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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-zinc-100 flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-rose-500" />
            Flagged Reviews Dashboard
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Overview of submitted flagged reviews & live Google moderation tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
          </button>

          <Link
            href="/flag-single"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-rose-950/40 transition-all"
          >
            <Link2 className="w-4 h-4" />
            <span>Flag Single Review</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Submitted Flags</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-zinc-100">{stats.flaggedCount}</div>
          <p className="text-[11px] text-zinc-400">Total reviews submitted to backend</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Pending Google</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-zinc-100">{stats.pendingGoogleCount}</div>
          <p className="text-[11px] text-zinc-400">Awaiting Google policy review</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Removed by Google</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-zinc-100">{stats.removedCount}</div>
          <p className="text-[11px] text-zinc-400">Successfully removed from profile</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Removal Rate</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-zinc-100">
            {stats.flaggedCount > 0 ? Math.round((stats.removedCount / stats.flaggedCount) * 100) : 100}%
          </div>
          <p className="text-[11px] text-zinc-400">Moderation success efficiency</p>
        </div>
      </div>

      {/* Recent Submissions Activity Table */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="font-bold text-zinc-100 text-base flex items-center gap-2">
              <span>Submitted Flagged Reviews</span>
              <span className="text-xs font-semibold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                {reviews.length} Total
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Persisted in JSON store database</p>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Reviewer</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Policy Violation Rule</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">AI Removal Description</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {reviews.map((r) => {
                  const rule = r.analysis?.primaryViolation;

                  return (
                    <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-zinc-200">
                        {r.reviewerName}
                        <span className="block text-[11px] text-zinc-400 font-normal">{r.datePosted}</span>
                      </td>
                      <td className="py-3.5 px-3 text-amber-400 font-semibold">{r.rating}★</td>
                      <td className="py-3.5 px-3">
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-md inline-block max-w-[220px] truncate">
                          Rule #{rule?.ruleNumber || 1}: {rule?.ruleTitle || 'Content Policy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {r.status === 'REMOVED' ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                            Removed by Google
                          </span>
                        ) : (
                          <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                            Pending Google Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-[11px] text-zinc-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                            {r.analysis?.generatedReportReason || r.comment}
                          </span>
                          {r.analysis?.generatedReportReason && (
                            <button
                              onClick={() => handleCopyReason(r.analysis!.generatedReportReason, r.id)}
                              className="shrink-0 p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                              title="Copy Description"
                            >
                              {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenGoogleLink(r.googleReviewUrl || '', r.analysis?.generatedReportReason || '')}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 border border-zinc-700/80 transition-colors"
                            title="Open Google Maps Review"
                          >
                            <ExternalLink className="w-3 h-3 text-rose-400" />
                            <span>Link</span>
                          </button>

                          {r.status !== 'REMOVED' && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, 'REMOVED')}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
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
          <div className="text-center py-10 text-xs text-zinc-400 space-y-3 bg-zinc-950/40 rounded-2xl border border-zinc-800/60">
            <p className="text-zinc-400 font-medium">No flagged review submissions recorded yet.</p>
            <Link
              href="/flag-single"
              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold underline"
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
