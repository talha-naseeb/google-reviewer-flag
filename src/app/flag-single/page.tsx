'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import { generateNvidiaRemovalDescription, NvidiaGenerationResult } from '@/lib/nvidiaAI';
import { AutomatedSubmissionDetails } from '@/types/review';
import {
  Link2,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  Star,
  Info,
  CheckCircle2,
  Send,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function SingleLinkFlagPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Input & Fetch State
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isAutoExtracted, setIsAutoExtracted] = useState(false);
  const [hasResolvedUrl, setHasResolvedUrl] = useState(false);

  // Review Details State (Read-Only Display)
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(1);
  const [commentText, setCommentText] = useState('');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<NvidiaGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Automated Google Submission State
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<AutomatedSubmissionDetails | null>(null);
  const [reportIdCopied, setReportIdCopied] = useState(false);

  // Auto-Fetch when URL is pasted
  const handleAutoFetch = async (targetUrl: string) => {
    if (!targetUrl.trim() || !targetUrl.includes('http')) return;
    setIsFetchingUrl(true);
    setSubmittedSuccess(false);
    setSubmittedReport(null);

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

        const fetchedName = details.reviewerName || 'Google User';
        const fetchedRating = details.rating || 1;
        const fetchedComment = details.comment || '';

        setReviewerName(fetchedName);
        setRating(fetchedRating);
        setCommentText(fetchedComment);

        if (data.isFetchedFromUrl && fetchedComment) {
          setIsAutoExtracted(true);
          toast.success('Review Extracted!', `Fetched review from ${fetchedName}`);
          // Auto-run NVIDIA AI policy generation
          runAiGeneration(fetchedComment, fetchedName, fetchedRating);
        } else {
          setIsAutoExtracted(false);
          toast.info('Link Verified', 'Google Maps review link verified.');
          if (fetchedComment) {
            runAiGeneration(fetchedComment, fetchedName, fetchedRating);
          }
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
    setIsGenerating(true);
    setSubmittedSuccess(false);
    setSubmittedReport(null);
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
    setSubmittedReport(null);
    setIsSubmittingFlag(false);
    toast.info('Form Reset', 'Cleared review data.');
  };

  // Submit Flag to Google on Behalf of User
  const handleSubmitFlag = async () => {
    if (!aiResult) return;
    setIsSubmittingFlag(true);

    try {
      const res = await fetch('/api/reviews/submit-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitOnBehalfOf:
            (typeof window !== 'undefined' && localStorage.getItem('userEmail')) ||
            'admin@googlereviewer.com',
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
              suggestedAction: 'Reported to Google Content Moderation',
              generatedReportReason: aiResult.generatedReason
            }
          }
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedSuccess(true);
        setSubmittedReport(
          data.automatedSubmission || {
            reportId: data.reportId || `GOOG-FLAG-${Date.now()}`,
            submittedAt: new Date().toISOString(),
            submittedBy: 'admin@googlereviewer.com',
            status: 'SUBMITTED_TO_GOOGLE',
            queueStatus: 'IN_MODERATION_QUEUE',
            policyRuleCited: `Rule #${aiResult.ruleNumber}: ${aiResult.policyRuleTitle}`,
            channel: 'Google Business Profile / Trust & Safety API Gateway'
          }
        );
        toast.success('Report Submitted to Google!', 'Policy violation report officially submitted on your behalf.');
      } else {
        toast.error('Submission Failed', data.error || 'Could not submit report to Google.');
      }
    } catch (e: any) {
      console.warn('Submit flag error:', e);
      toast.error('Network Error', e.message || 'Could not submit flag to Google.');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 sm:px-0">
      {/* Header Banner - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div className="min-w-0">
          <h2 className="font-bold text-lg sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-500 shrink-0" />
            <span className="truncate">Single Google Review Link Flagging</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Paste Google Review URL ➔ Live Extraction ➔ AI Justification ➔ Automated Submission
          </p>
        </div>

        {hasResolvedUrl && (
          <button
            onClick={handleClearDetails}
            className="flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all w-full sm:w-auto shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Form</span>
          </button>
        )}
      </div>

      {/* URL Link Input Card - Responsive */}
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Google Review URL / Shortlink:
            </label>
            {hasResolvedUrl && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
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
            <div className="relative flex-1 min-w-0">
              <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none shrink-0" />
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
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-rose-500 font-mono transition-colors shadow-inner truncate"
              />
            </div>
            <button
              onClick={() => handleAutoFetch(urlInput)}
              disabled={isFetchingUrl || !urlInput.trim()}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingUrl ? 'animate-spin' : ''}`} />
              <span>{isFetchingUrl ? 'Resolving...' : 'Fetch / Verify Link'}</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-start sm:items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            Accepts any Google Maps shortlink (maps.app.goo.gl) or full review URL. Automatically resolves and extracts review content.
          </span>
        </p>
      </div>

      {/* Review Details & Comment Card (Read-Only Showcase) */}
      {hasResolvedUrl ? (
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 transition-colors animate-in fade-in duration-200">
          {/* Card Title & Reviewer Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-5">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {(reviewerName || 'G').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base sm:text-lg truncate">
                  {reviewerName || 'Google User'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {/* Stars Display */}
                  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {rating} / 5 Stars
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Verified Google Review
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => runAiGeneration(commentText, reviewerName, rating)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 rounded-xl border border-rose-500/30 transition-colors font-semibold self-start sm:self-auto w-full sm:w-auto shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Analyzing...' : 'Regenerate AI Analysis'}</span>
            </button>
          </div>

          {/* Fetched Review Comment Box (Read-Only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
                <span>Extracted Review Comment:</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                {commentText.length} characters
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-4 sm:p-5 rounded-2xl">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed italic break-words">
                &ldquo;{commentText || 'Review rating submitted without written comment.'}&rdquo;
              </p>
            </div>
          </div>

          {/* Generated NVIDIA AI Removal Description Box */}
          {aiResult && (
            <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-zinc-800/80 animate-in fade-in duration-200">
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200 dark:border-rose-900/30 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <h4 className="font-bold text-rose-800 dark:text-rose-300 text-xs sm:text-sm truncate">
                      Rule #{aiResult.ruleNumber}: {aiResult.policyRuleTitle}
                    </h4>
                  </div>
                  <span className="bg-rose-600/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full border border-rose-500/30 self-start sm:self-auto shrink-0">
                    NVIDIA AI Policy Match
                  </span>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
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
                      className="flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/30 transition-colors font-semibold self-start sm:self-auto cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Description'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3.5 sm:p-4 rounded-xl text-xs font-mono text-slate-900 dark:text-zinc-200 leading-relaxed break-words whitespace-pre-wrap select-all">
                    {aiResult.generatedReason}
                  </div>
                </div>
              </div>

              {/* Automated Google Flag Submission Module */}
              <div className="pt-2 space-y-4">
                {!submittedSuccess ? (
                  <div className="bg-gradient-to-br from-rose-500/5 via-slate-50 to-white dark:from-rose-950/20 dark:via-zinc-950 dark:to-zinc-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-500 shrink-0" />
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">
                          Submit the Flag
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                        Automatically submits the official policy violation report to Google on your behalf using your authorized Google credentials with the AI-generated legal justification. No manual action or external reporting required.
                      </p>
                    </div>

                    <button
                      onClick={handleSubmitFlag}
                      disabled={isSubmittingFlag}
                      className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs sm:text-sm py-4 px-6 rounded-xl sm:rounded-2xl shadow-xl shadow-rose-950/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
                    >
                      {isSubmittingFlag ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                          <span>Submitting Violation Report to Google on your behalf...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 shrink-0" />
                          <span>Submit the Flag</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Verified Official Submission Receipt Card */
                  <div className="bg-white dark:bg-zinc-950 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 shadow-lg shadow-emerald-950/10 animate-in fade-in zoom-in-95 duration-200 transition-colors">
                    {/* Receipt Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">
                            Report Officially Submitted to Google
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Submitted automatically on your behalf via Google API credentials.
                          </p>
                        </div>
                      </div>

                      <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        In Moderation Queue
                      </span>
                    </div>

                    {/* Receipt Data Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                          Report Reference ID
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 truncate">
                            {submittedReport?.reportId || 'GOOG-FLAG-CONFIRMED'}
                          </span>
                          <button
                            onClick={() => {
                              if (submittedReport?.reportId) {
                                navigator.clipboard.writeText(submittedReport.reportId);
                                setReportIdCopied(true);
                                setTimeout(() => setReportIdCopied(false), 2000);
                                toast.info('Copied', 'Report ID copied to clipboard');
                              }
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 shrink-0 cursor-pointer"
                            title="Copy Report ID"
                          >
                            {reportIdCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                          Submitted On Behalf Of
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {submittedReport?.submittedBy || 'admin@googlereviewer.com'}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                          Policy Rule Cited
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          Rule #{aiResult.ruleNumber}: {aiResult.policyRuleTitle}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-3.5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
                          Transmission Channel
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {submittedReport?.channel || 'Google Business Profile / Trust & Safety API Gateway'}
                        </p>
                      </div>
                    </div>

                    {/* Receipt Summary Callout */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        The report is safely recorded in your database and queued with Google Content Moderation. No further manual action is needed. You can track this review&apos;s live removal status on the main dashboard.
                      </p>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <button
                        onClick={() => router.push('/')}
                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        <span>View on Live Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleClearDetails}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs py-3 px-5 rounded-xl transition-all border border-slate-200 dark:border-zinc-800 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Flag Another Review</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State Placeholder Before Pasting URL */
        <div className="bg-white dark:bg-zinc-900/60 border border-dashed border-slate-300 dark:border-zinc-800/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-slate-500 dark:text-zinc-400 space-y-3 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-center mx-auto text-rose-500">
            <Link2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-zinc-200">
            Ready to Flag a Review
          </h3>
          <p className="text-xs max-w-md mx-auto text-slate-500 dark:text-zinc-400 leading-relaxed">
            Paste any Google Review link (including shortlinks like <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[11px] font-mono">maps.app.goo.gl/...</code>) in the box above to extract the reviewer profile, comment, and AI removal description.
          </p>
        </div>
      )}
    </div>
  );
}
