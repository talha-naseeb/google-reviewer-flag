'use client';

import React, { useState } from 'react';
import { Review } from '@/types/review';
import { Copy, Check, ExternalLink, CheckCircle2, Star } from 'lucide-react';

interface ReviewsTableProps {
  reviews: Review[];
  onMarkRemoved?: (id: string) => void;
}

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-3.5 h-3.5 ${
          n <= value
            ? 'fill-amber-400 text-amber-400'
            : 'fill-transparent text-slate-300 dark:text-zinc-700'
        }`}
      />
    ))}
  </div>
);

export const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews, onMarkRemoved }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpen = (url: string, reason: string) => {
    if (reason) navigator.clipboard.writeText(reason);
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
      <table className="w-full table-fixed text-left text-sm border-collapse min-w-[960px]">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[10%]" />
          <col className="w-[17%]" />
          <col className="w-[12%]" />
          <col className="w-[28%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="bg-slate-50 dark:bg-zinc-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            <th className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">Reviewer</th>
            <th className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">Rating</th>
            <th className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">Policy Rule</th>
            <th className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">Status</th>
            <th className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">Removal Description</th>
            <th className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70">
          {reviews.map((r) => {
            const rule = r.analysis?.primaryViolation;
            const reason = r.analysis?.generatedReportReason || r.comment || '';
            const removed = r.status === 'REMOVED';

            return (
              <tr key={r.id} className="align-top hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                {/* Reviewer */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-sm font-bold text-rose-600 dark:text-rose-400">
                      {(r.reviewerName || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {r.reviewerName || 'Google User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">{r.datePosted}</p>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4 py-4">
                  <Stars value={r.rating} />
                </td>

                {/* Policy Rule */}
                <td className="px-4 py-4">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Rule #{rule?.ruleNumber || 1}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2">
                    {rule?.ruleTitle || 'Content Policy'}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  {removed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Removed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Pending
                    </span>
                  )}
                </td>

                {/* Description */}
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300 line-clamp-3 flex-1">
                      {reason}
                    </p>
                    {reason && (
                      <button
                        onClick={() => handleCopy(reason, r.id)}
                        className="shrink-0 p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        title="Copy description"
                        aria-label="Copy description"
                      >
                        {copiedId === r.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleOpen(r.googleReviewUrl || '', r.analysis?.generatedReportReason || '')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open on Google
                    </button>
                    {onMarkRemoved && !removed && (
                      <button
                        onClick={() => onMarkRemoved(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Removed
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
  );
};
