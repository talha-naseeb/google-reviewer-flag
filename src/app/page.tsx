'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { ReviewsTable } from '@/components/ReviewsTable';
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
  const { toast } = useToast();
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

  const fetchDashboardData = async (showNotice = false) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setReviews(data.reviews);
        if (showNotice) {
          toast.info('Refreshed', 'Dashboard metrics updated from database.');
        }
      }
    } catch (e) {
      console.error('Fetch Dashboard Data Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const handleUpdateStatus = async (id: string, status: ModerationStatus) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success('Status Updated', `Review marked as ${status.toLowerCase()}`);
        fetchDashboardData(false);
      } else {
        toast.error('Update Failed', 'Could not update review status.');
      }
    } catch (e: any) {
      toast.error('Error', e.message || 'Status update failed.');
    }
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
            onClick={() => fetchDashboardData(true)}
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
          <ReviewsTable reviews={reviews} onMarkRemoved={(id) => handleUpdateStatus(id, 'REMOVED')} />
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
