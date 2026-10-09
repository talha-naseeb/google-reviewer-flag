'use client';

import React from 'react';
import { Review } from '@/types/review';
import { Star, ShieldAlert, AlertCircle, ExternalLink, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  onSelect: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onSelect }) => {
  const analysis = review.analysis;
  const isViolating = analysis?.isViolating;
  const primaryViolation = analysis?.primaryViolation;

  const getRiskBadge = () => {
    switch (analysis?.riskLevel) {
      case 'HIGH':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold px-2.5 py-1 rounded-md">HIGH RISK FAKE</span>;
      case 'MEDIUM':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-md">MEDIUM RISK</span>;
      case 'LOW':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold px-2.5 py-1 rounded-md">LOW RISK</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-md">CLEAN REVIEW</span>;
    }
  };

  const getStatusBadge = () => {
    switch (review.status) {
      case 'PENDING_GOOGLE_REVIEW':
        return (
          <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-medium px-2.5 py-1 rounded-md">
            <Clock className="w-3 h-3" /> Reported to Google
          </span>
        );
      case 'REMOVED':
        return (
          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium px-2.5 py-1 rounded-md">
            <CheckCircle2 className="w-3 h-3" /> Removed by Google
          </span>
        );
      case 'DISMISSED':
        return <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-md">Dismissed</span>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(review)}
      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-xl group"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
            {review.reviewerName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 group-hover:text-rose-400 transition-colors">
              {review.reviewerName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{review.locationName}</span>
              <span>•</span>
              <span>{review.datePosted}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getRiskBadge()}
          {getStatusBadge()}
        </div>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'
            }`}
          />
        ))}
        <span className="text-xs text-slate-400 ml-2">Rating: {review.rating}/5</span>
      </div>

      {/* Comment Body */}
      <p className="text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-850">
        "{review.comment}"
      </p>

      {/* Policy Match Preview */}
      {isViolating && primaryViolation && (
        <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3 flex items-start gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-rose-300">
              Rule #{primaryViolation.ruleNumber}: {primaryViolation.ruleTitle}
            </span>
            <span className="text-rose-400/80 ml-2">({primaryViolation.confidenceScore}% AI Confidence)</span>
            <p className="text-slate-400 mt-1 line-clamp-1">{primaryViolation.evidence[0]}</p>
          </div>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
        <span>Click to view evidence & 1-click Google report text</span>
        <div className="flex items-center gap-1 text-rose-400 font-medium group-hover:translate-x-1 transition-transform">
          <span>Manage Flag</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
