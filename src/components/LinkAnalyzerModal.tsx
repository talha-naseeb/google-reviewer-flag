'use client';

import React, { useState } from 'react';
import { parseGoogleReviewUrl } from '@/lib/urlParser';
import { analyzeReview } from '@/lib/analyzerEngine';
import { AnalysisResult, Review } from '@/types/review';
import { X, Link2, Search, AlertTriangle, ShieldCheck, Copy, Check, ExternalLink, ArrowRight, Flag } from 'lucide-react';
import { GOOGLE_POLICY_RULES } from '@/lib/policyRules';

interface LinkAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReview: (review: Review) => void;
}

export const LinkAnalyzerModal: React.FC<LinkAnalyzerModalProps> = ({ isOpen, onClose, onAddReview }) => {
  const [urlInput, setUrlInput] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [locationName, setLocationName] = useState('My Business');
  const [rating, setRating] = useState(1);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedToDashboard, setAddedToDashboard] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!urlInput.trim() && !reviewText.trim()) return;

    const parsedUrl = parseGoogleReviewUrl(urlInput);
    const result = analyzeReview({
      comment: reviewText,
      rating,
      reviewerName: reviewerName || 'Google User',
      locationName
    });

    setAnalysis(result);
    setAddedToDashboard(false);
  };

  const handleCopyReason = () => {
    if (analysis?.generatedReportReason) {
      navigator.clipboard.writeText(analysis.generatedReportReason);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenAndReport = () => {
    if (analysis?.generatedReportReason) {
      navigator.clipboard.writeText(analysis.generatedReportReason);
      setCopied(true);
    }

    const parsedUrl = parseGoogleReviewUrl(urlInput);
    const targetUrl = parsedUrl.directReportUrl || urlInput;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTrackInDashboard = () => {
    if (!analysis) return;
    const parsedUrl = parseGoogleReviewUrl(urlInput);
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      reviewerName: reviewerName || 'Google User',
      rating,
      comment: reviewText || 'Review imported from Google link.',
      datePosted: new Date().toISOString().split('T')[0],
      locationName,
      status: 'PENDING_GOOGLE_REVIEW',
      flaggedAt: new Date().toISOString().split('T')[0],
      googleReviewUrl: parsedUrl.directReportUrl || urlInput,
      analysis
    };

    onAddReview(newRev);
    setAddedToDashboard(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
              <Link2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">Check & Flag Google Review Link</h2>
              <p className="text-xs text-slate-400">Analyze any Google Maps review URL against policy rules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Paste Google Review Link / URL:
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.google.com/maps/reviews/data=!4m8!14m7!1m6..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-rose-500 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Star Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Reviewer Name (Optional)</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. John D."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Location / Branch</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Main Branch"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Review Text / Comment Content:
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste the text from the Google review here..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              onClick={handleAnalyze}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-sm py-2.5 rounded-xl shadow-lg transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Analyze Link & Check Policy Violations</span>
            </button>
          </div>

          {/* Policy Analysis Results */}
          {analysis && (
            <div className="border-t border-slate-800 pt-5 space-y-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analysis Result</h3>

              {analysis.isViolating && analysis.primaryViolation ? (
                <div className="space-y-4">
                  {/* Violation Card */}
                  <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        <h4 className="font-bold text-rose-300 text-sm">
                          Rule #{analysis.primaryViolation.ruleNumber}: {analysis.primaryViolation.ruleTitle}
                        </h4>
                      </div>
                      <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-500/40">
                        {analysis.primaryViolation.confidenceScore}% Violation Confidence
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">
                      {GOOGLE_POLICY_RULES[analysis.primaryViolation.category]?.shortDescription}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Evidence Found:</span>
                      {analysis.primaryViolation.evidence.map((ev, idx) => (
                        <div key={idx} className="text-xs text-rose-200 bg-rose-950/40 p-2 rounded border border-rose-900/30">
                          • {ev}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Report Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Pre-Generated Google Policy Justification:
                      </label>
                      <button
                        onClick={handleCopyReason}
                        className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Justification'}</span>
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-300 select-all">
                      {analysis.generatedReportReason}
                    </div>
                  </div>

                  {/* Step by Step How to Flag on Google */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flag className="w-4 h-4" />
                      How to Flag This Review on Google Maps:
                    </h4>

                    <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>Click the <strong>"1-Click Copy & Open Link"</strong> button below.</li>
                      <li>On the Google Maps review page, click the <strong>3 dots (⋮)</strong> next to the review.</li>
                      <li>Click <strong>"Report review"</strong> (or "Flag as inappropriate").</li>
                      <li>Select the rule category: <strong className="text-rose-400">{analysis.primaryViolation.ruleTitle}</strong>.</li>
                      <li>Paste the copied policy justification text into the report form (if prompted).</li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleOpenAndReport}
                      className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>1-Click Copy & Open Google Review Link</span>
                    </button>

                    <button
                      onClick={handleTrackInDashboard}
                      disabled={addedToDashboard}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        addedToDashboard
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      {addedToDashboard ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      <span>{addedToDashboard ? 'Added to Dashboard!' : 'Track in Dashboard'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>No policy violation detected. Subjective customer complaints are not reportable under Google policies.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
