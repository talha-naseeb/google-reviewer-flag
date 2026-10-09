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
  RefreshCw,
  Sparkles,
  Inbox
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
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  // Check URL query on mount (e.g. /?tab=completed)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'completed') {
        setActiveTab('COMPLETED');
      }
    }
  }, []);

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
        if (status === 'REMOVED') {
          toast.success('Review Marked Completed!', 'Removed from active list and moved to Completed Flags.');
        } else {
          toast.success('Flag Reopened!', 'Review moved back to Active / Pending Flags.');
        }
        fetchDashboardData(false);
      } else {
        toast.error('Update Failed', 'Could not update review status in MongoDB.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Status update failed.');
    }
  };

  // Separate active/pending flags from completed/removed flags
  const activeReviews = reviews.filter((r) => r.status !== 'REMOVED');
  const completedReviews = reviews.filter((r) => r.status === 'REMOVED');

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
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-500' : ''}`} />
          </button>

          <Link
            href="/flag-single"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-rose-950/20 transition-all cursor-pointer"
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
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Awaiting Google policy takedown</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl space-y-2 shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Removed by Google</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-zinc-100">{stats.removedCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Successfully removed & completed</p>
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

      {/* Main Table Container with Tab Switching */}
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm dark:shadow-xl transition-colors">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ACTIVE'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/20'
                  : 'bg-slate-100 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Active Flags</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'ACTIVE'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {activeReviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
                  : 'bg-slate-100 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed Flags</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'COMPLETED'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {completedReviews.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-zinc-400">
            {activeTab === 'ACTIVE' ? (
              <span>Reviews awaiting Google removal or under review</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reviews confirmed removed from Google</span>
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: ACTIVE / PENDING REVIEWS */}
        {activeTab === 'ACTIVE' && (
          <div>
            {activeReviews.length > 0 ? (
              <ReviewsTable
                reviews={activeReviews}
                mode="active"
                onMarkRemoved={(id) => handleUpdateStatus(id, 'REMOVED')}
              />
            ) : (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-400 space-y-3 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-200 dark:border-zinc-800/60">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Inbox className="w-5 h-5" />
                </div>
                <p className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">No Active Flags Pending</p>
                <p className="text-slate-500 dark:text-zinc-400">All submitted reviews have either been resolved or none are flagged.</p>
                <div className="pt-2">
                  <Link
                    href="/flag-single"
                    className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Flag a new Google review link</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPLETED / REMOVED REVIEWS */}
        {activeTab === 'COMPLETED' && (
          <div>
            {completedReviews.length > 0 ? (
              <ReviewsTable
                reviews={completedReviews}
                mode="completed"
                onReopen={(id) => handleUpdateStatus(id, 'PENDING_GOOGLE_REVIEW')}
              />
            ) : (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-zinc-400 space-y-3 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-200 dark:border-zinc-800/60">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">No Completed Flags Yet</p>
                <p className="text-slate-500 dark:text-zinc-400">
                  Once Google removes a review, click <strong>"Mark Completed"</strong> on the Active Flags tab to move it into this archive.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
