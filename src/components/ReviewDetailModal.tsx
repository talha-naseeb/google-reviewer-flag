'use client';

import React, { useState } from 'react';
import { Review, ModerationStatus } from '@/types/review';
import { X, Copy, Check, ExternalLink, ShieldAlert, AlertTriangle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { GOOGLE_POLICY_RULES } from '@/lib/policyRules';

interface ReviewDetailModalProps {
  review: Review | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ModerationStatus) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ review, onClose, onUpdateStatus }) => {
  const [copied, setCopied] = useState(false);

  if (!review) return null;

  const analysis = review.analysis;
  const primaryViolation = analysis?.primaryViolation;
  const reportReasonText = analysis?.generatedReportReason || 'No policy violation detected.';

  const handleCopyReason = () => {
    navigator.clipboard.writeText(reportReasonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGoogleReport = () => {
    // Copy the justification text first
    navigator.clipboard.writeText(reportReasonText);
    setCopied(true);

    // Update status to pending
    if (review.status === 'ACTIVE') {
      onUpdateStatus(review.id, 'PENDING_GOOGLE_REVIEW');
    }

    // Open Google review URL if present, or fallback search
    const targetUrl = review.googleReviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(review.locationName)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">Review Policy Analysis</h2>
              <p className="text-xs text-slate-400">Review ID: {review.id} • Location: {review.locationName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Review Details */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">{review.reviewerName}</span>
              <span className="text-xs text-amber-400 font-semibold">{review.rating}/5 Stars</span>
            </div>
            <p className="text-slate-300 text-sm italic">"{review.comment}"</p>
          </div>

          {/* AI Policy Breakdown */}
          {analysis?.isViolating && primaryViolation ? (
            <div className="space-y-4">
              <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <h3 className="font-bold text-rose-300">
                      Rule #{primaryViolation.ruleNumber}: {primaryViolation.ruleTitle}
                    </h3>
                  </div>
                  <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-500/40">
                    {primaryViolation.confidenceScore}% Violation Match
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {GOOGLE_POLICY_RULES[primaryViolation.category]?.shortDescription || 'Violates Google Content Policies.'}
                </p>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Detected Evidence:</span>
                  {primaryViolation.evidence.map((ev, idx) => (
                    <div key={idx} className="text-xs text-rose-200/90 flex items-start gap-2 bg-rose-950/40 p-2 rounded border border-rose-900/30">
                      <span>•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pre-Generated Report Justification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Pre-Generated Google Report Reason:
                  </label>
                  <button
                    onClick={handleCopyReason}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Reason Text'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs font-mono text-slate-300 leading-relaxed select-all">
                  {reportReasonText}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center text-slate-400 text-sm">
              No specific policy violation detected. Standard subjective customer feedback is not reportable under Google policies.
            </div>
          )}

          {/* Action Workflow Buttons */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moderation Workflow</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleOpenGoogleReport}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-rose-950/50 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>1-Click Copy & Open Google Report</span>
              </button>

              <button
                onClick={() => {
                  onUpdateStatus(review.id, 'REMOVED');
                  onClose();
                }}
                className="flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Removed by Google</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onUpdateStatus(review.id, 'DISMISSED');
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Dismiss Flag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
