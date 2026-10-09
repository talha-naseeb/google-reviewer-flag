'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { generateNvidiaRemovalDescription, NvidiaGenerationResult } from '@/lib/nvidiaAI';
import {
  Link2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  Sparkles,
  Star,
  Info,
  CheckCircle2,
  Edit3
} from 'lucide-react';

export default function SingleLinkFlagPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Input & Fetch State
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isAutoExtracted, setIsAutoExtracted] = useState(false);
  const [hasResolvedUrl, setHasResolvedUrl] = useState(false);

  // Review Details State (Always Editable)
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(1);
  const [commentText, setCommentText] = useState('');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<NvidiaGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Auto-Fetch when URL is pasted
  const handleAutoFetch = async (targetUrl: string) => {
    if (!targetUrl.trim() || !targetUrl.includes('http')) return;
    setIsFetchingUrl(true);
    setSubmittedSuccess(false);

    try {
      const res = await fetch('/api/fetch-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() })
      });
      const data = await res.json();

      if (data.success && data.reviewDetails) {
        const details = data.reviewDetails;
        if (data.resolvedUrl) {
          setUrlInput(data.resolvedUrl);
        }
        setHasResolvedUrl(true);

        if (details.reviewerName) setReviewerName(details.reviewerName);
        if (details.rating) setRating(details.rating);
        if (details.comment) setCommentText(details.comment);

        if (data.isFetchedFromUrl && details.comment) {
          setIsAutoExtracted(true);
          toast.success('Review Extracted!', `Fetched review by ${details.reviewerName || 'Google User'}`);
          // Auto-run NVIDIA AI generation
          runAiGeneration(details.comment, details.reviewerName || 'Google User', details.rating || 1);
        } else {
          setIsAutoExtracted(false);
          toast.info(
            'Link Verified',
            'Google Maps review link verified. Review and enter comment text below to generate the AI flag justification.'
          );
        }
      } else {
        toast.warning('Notice', data.error || 'Could not resolve link automatically.');
      }
    } catch (err: any) {
      console.warn('Auto fetch error:', err);
      toast.error('Fetch Error', err.message || 'Failed to inspect the review link.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const runAiGeneration = async (comment: string, name: string, stars: number) => {
    if (!comment.trim()) {
      toast.warning('Missing Comment', 'Please enter or paste the review comment text first.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateNvidiaRemovalDescription(comment, name || 'Google User', stars);
      setAiResult(result);
      toast.info('AI Policy Matched', `Matched Rule #${result.ruleNumber}: ${result.policyRuleTitle}`);
    } catch (e: any) {
      console.error(e);
      toast.error('AI Generation Failed', e.message || 'Could not generate removal description.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear Form Handler
  const handleClearDetails = () => {
    setUrlInput('');
    setReviewerName('');
    setRating(1);
    setCommentText('');
    setHasResolvedUrl(false);
    setIsAutoExtracted(false);
    setAiResult(null);
    setSubmittedSuccess(false);
    toast.info('Form Reset', 'All input fields cleared.');
  };

  // Submit Flag to Backend & Open Google Maps
  const handleOpenAndFlagOnGoogle = async () => {
    if (!aiResult) return;

    if (aiResult.generatedReason) {
      navigator.clipboard.writeText(aiResult.generatedReason);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    try {
      const res = await fetch('/api/reviews/submit-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: {
            id: `rev-${Date.now()}`,
            reviewerName: reviewerName.trim() || 'Google User',
            rating,
            comment: commentText.trim() || 'Review from link',
            datePosted: new Date().toISOString().split('T')[0],
            locationName: 'Google Business Profile',
            status: 'PENDING_GOOGLE_REVIEW',
            googleReviewUrl: urlInput,
            analysis: {
              isViolating: true,
              riskLevel: 'HIGH',
              primaryViolation: {
                category: 'SPAM_OR_FAKE',
                ruleNumber: aiResult.ruleNumber,
                ruleTitle: aiResult.policyRuleTitle,
                confidenceScore: aiResult.confidenceScore,
                evidence: ['Google Content Policy Violation'],
                justificationTemplate: aiResult.generatedReason
              },
              secondaryViolations: [],
              suggestedAction: 'Flag on Google Maps',
              generatedReportReason: aiResult.generatedReason
            }
          }
        })
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        toast.success('Flag Recorded!', 'Saved to database & opened on Google Maps');
      } else {
        toast.warning('Warning', 'Review flag opened, but saving to DB failed.');
      }
    } catch (e: any) {
      console.warn('Save submit flag error:', e);
      toast.error('Database Error', e.message || 'Could not save flag record.');
    }

    const targetUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-rose-600 dark:text-rose-500" />
            Single Google Review Link Flagging
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Paste Google Review URL ➔ Verify Link ➔ Enter or Edit Review Text ➔ AI Policy Justification
          </p>
        </div>

        {(hasResolvedUrl || commentText || reviewerName) && (
          <button
            onClick={handleClearDetails}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Form</span>
          </button>
        )}
      </div>

      {/* URL Link Input Card */}
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Google Review URL / Shortlink:
            </label>
            {hasResolvedUrl && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isAutoExtracted
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                }`}
              >
                {isAutoExtracted ? '✓ Auto-Extracted from Google' : '🔗 Link Resolved & Linked'}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (e.target.value.includes('http')) {
                  handleAutoFetch(e.target.value);
                }
              }}
              placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/reviews/..."
              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-rose-500 font-mono transition-colors"
            />
            <button
              onClick={() => handleAutoFetch(urlInput)}
              disabled={isFetchingUrl || !urlInput.trim()}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingUrl ? 'animate-spin' : ''}`} />
              <span>{isFetchingUrl ? 'Resolving...' : 'Fetch / Verify Link'}</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Accepts any Google Maps shortlink (maps.app.goo.gl) or full maps review URL. Automatically expands and verifies the link.
          </span>
        </p>
      </div>

      {/* Editable Review Details Card */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-4">
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-rose-500" />
            <span>Reviewer Details & Comment (Editable)</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {isAutoExtracted ? 'Pre-filled from link' : 'Review & customize fields'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Reviewer Name */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              Reviewer Name:
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="e.g. John Doe or Google User"
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Rating (Interactive 1-5 Star Selector) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
              Star Rating:
            </label>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 rounded hover:scale-110 transition-transform"
                  title={`${s} Star${s > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-zinc-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
                {rating} / 5
              </span>
            </div>
          </div>
        </div>

        {/* Review Comment Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Review Comment Text:
            </label>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {commentText.length} characters
            </span>
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            placeholder="Paste or edit the exact review comment text here..."
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl p-4 focus:outline-none focus:border-rose-500 leading-relaxed transition-colors font-sans"
          />
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            NVIDIA AI analyzes this text against all 10 official Google Maps Prohibited Content policies to find the exact violation rule.
          </p>
        </div>

        {/* Trigger AI Generation Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            {commentText.trim()
              ? 'Ready to generate AI policy justification'
              : 'Enter review comment above to generate justification'}
          </span>
          <button
            onClick={() => runAiGeneration(commentText, reviewerName, rating)}
            disabled={isGenerating || !commentText.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>
              {isGenerating
                ? 'Analyzing with NVIDIA AI...'
                : aiResult
                ? 'Regenerate Policy Justification'
                : 'Generate AI Removal Description'}
            </span>
          </button>
        </div>

        {/* Generated NVIDIA AI Removal Description Box */}
        {aiResult && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800/80 animate-in fade-in duration-200">
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200 dark:border-rose-900/30 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm sm:text-base">
                    Rule #{aiResult.ruleNumber}: {aiResult.policyRuleTitle}
                  </h4>
                </div>
                <span className="bg-rose-600/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full border border-rose-500/30 self-start sm:self-auto">
                  NVIDIA AI Policy Match
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Generated Google Removal Description:
                  </label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiResult.generatedReason);
                      setCopied(true);
                      toast.info('Copied!', 'AI removal description copied to clipboard');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/30 transition-colors font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Description'}</span>
                  </button>
                </div>

                <div className="bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl text-xs font-mono text-slate-900 dark:text-zinc-200 leading-relaxed select-all">
                  {aiResult.generatedReason}
                </div>
              </div>
            </div>

            {/* 1-Click Copy & Flag Action Button */}
            <button
              onClick={handleOpenAndFlagOnGoogle}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-sm py-4 rounded-2xl shadow-xl shadow-rose-950/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>1-Click Copy Description, Log Flag & Open Google Maps</span>
            </button>

            {submittedSuccess && (
              <div className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Flag submission recorded to MongoDB database! Check Dashboard for live stats.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
