'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { ReviewsTable } from '@/components/ReviewsTable';
import { Review, ModerationStatus } from '@/types/review';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function CompletedFlagsPage() {
  const { toast } = useToast();
  const [completedReviews, setCompletedReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompletedData = async (showNotice = false) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        const removed = (data.reviews as Review[]).filter((r) => r.status === 'REMOVED');
        setCompletedReviews(removed);
        if (showNotice) {
          toast.info('Refreshed', 'Completed reviews updated.');
        }
      }
    } catch (e: any) {
      console.error('Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedData(false);
  }, []);

  const handleReopenStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING_GOOGLE_REVIEW' as ModerationStatus })
      });
      if (res.ok) {
        toast.success('Flag Reopened!', 'Review moved back to Active Flags on the dashboard.');
        fetchCompletedData(false);
      } else {
        toast.error('Update Failed', 'Could not reopen review status in MongoDB.');
      }
    } catch (err: any) {
      toast.error('Error', err.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
            Completed Flags Archive
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Confirmed takedowns and successfully removed Google reviews
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCompletedData(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Active Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Completed Table Container */}
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">
              Removed Reviews
            </span>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              {completedReviews.length} Completed
            </span>
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Verified removal from Google Business Profile
          </span>
        </div>

        {completedReviews.length > 0 ? (
          <ReviewsTable
            reviews={completedReviews}
            mode="completed"
            onReopen={handleReopenStatus}
          />
        ) : (
          <div className="text-center py-16 text-xs text-slate-500 dark:text-zinc-400 space-y-3 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-200 dark:border-zinc-800/60">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-slate-700 dark:text-zinc-300 font-semibold text-sm">No Completed Flags Yet</p>
            <p className="text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              When Google takes down a flagged review, click <strong>"Mark Completed"</strong> on the main dashboard to archive it here.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <span>Go to Active Flags Dashboard →</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
