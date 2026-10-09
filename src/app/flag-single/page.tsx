'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateNvidiaRemovalDescription, NvidiaGenerationResult } from '@/lib/nvidiaAI';
import { Link2, RefreshCw, AlertTriangle, ExternalLink, Copy, Check, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SingleLinkFlagPage() {
  const router = useRouter();

  // Input State
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  
  // Fetched Details State
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [hasFetchedDetails, setHasFetchedDetails] = useState(false);

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
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();

      if (data.success && data.reviewDetails) {
        const details = data.reviewDetails;
        if (details.reviewerName) setReviewerName(details.reviewerName);
        if (details.rating) setRating(details.rating);
        if (details.comment) setCommentText(details.comment);
        setHasFetchedDetails(true);

        // Auto-run NVIDIA AI generation once fetched
        runAiGeneration(details.comment || '', details.reviewerName || 'Google User', details.rating || 1);
      }
    } catch (err) {
      console.warn('Auto fetch error:', err);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const runAiGeneration = async (comment: string, name: string, stars: number) => {
    setIsGenerating(true);
    try {
      const result = await generateNvidiaRemovalDescription(comment, name, stars);
      setAiResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear Details Handler
  const handleClearDetails = () => {
    setUrlInput('');
    setReviewerName('');
    setRating(1);
    setCommentText('');
    setHasFetchedDetails(false);
    setAiResult(null);
    setSubmittedSuccess(false);
  };

  // Submit Flag to Backend & Open Google Maps
  const handleOpenAndFlagOnGoogle = async () => {
    if (!aiResult) return;

    if (aiResult.generatedReason) {
      navigator.clipboard.writeText(aiResult.generatedReason);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    // Save to Backend Persistent Database
    try {
      await fetch('/api/reviews/submit-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review: {
            id: `rev-${Date.now()}`,
            reviewerName: reviewerName || 'Google User',
            rating,
            comment: commentText || 'Review from link',
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
      setSubmittedSuccess(true);
    } catch (e) {
      console.warn('Save submit flag error:', e);
    }

    // Open target link on Google Maps
    const targetUrl = urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-zinc-100 flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-rose-500" />
            Single Google Review Link Flagging
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Paste Google Review URL ➔ Live Puppeteer Auto-Fetch ➔ AI Policy Justification
          </p>
        </div>

        {hasFetchedDetails && (
          <button
            onClick={handleClearDetails}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Details</span>
          </button>
        )}
      </div>

      {/* Input Box View when not fetched */}
      {!hasFetchedDetails ? (
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2 uppercase tracking-wider">
              Paste Google Review Link / Shortlink:
            </label>
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
                className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-4 py-3.5 focus:outline-none focus:border-rose-500 font-mono transition-colors"
              />
              <button
                onClick={() => handleAutoFetch(urlInput)}
                disabled={isFetchingUrl || !urlInput.trim()}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingUrl ? 'animate-spin' : ''}`} />
                <span>{isFetchingUrl ? 'Fetching Live...' : 'Fetch Review Details'}</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Pasting a link triggers Puppeteer browser extraction for Reviewer Name, Star Rating, and Comment text.
          </p>
        </div>
      ) : (
        /* SEPARATE DETAILS PAGE VIEW ONCE FETCHED */
        <div className="space-y-6 animate-in fade-in zoom-in duration-200">
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-lg text-rose-400 shadow-md">
                  {reviewerName.charAt(0) || 'G'}
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-lg">{reviewerName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {rating} / 5 Stars
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">✓ Real Review Fetched</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClearDetails}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 px-3.5 py-2 rounded-xl border border-zinc-800 hover:bg-zinc-800/80 transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Details</span>
              </button>
            </div>

            {/* Review Comment Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Fetched Review Comment:
              </label>
              <div className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-2xl text-xs text-zinc-200 italic leading-relaxed font-sans">
                "{commentText || 'Single rating submitted without text.'}"
              </div>
            </div>

            {/* Generated NVIDIA AI Removal Description Box */}
            {aiResult && (
              <div className="space-y-4 pt-2">
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/30 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                      <h4 className="font-bold text-rose-300 text-sm sm:text-base">
                        Rule #{aiResult.ruleNumber}: {aiResult.policyRuleTitle}
                      </h4>
                    </div>
                    <span className="bg-rose-500/20 text-rose-300 text-[11px] font-bold px-3 py-1 rounded-full border border-rose-500/40 self-start sm:self-auto">
                      NVIDIA AI Policy Match
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Generated Google Removal Description:
                      </label>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiResult.generatedReason);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/30 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Description'}</span>
                      </button>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs font-mono text-zinc-200 leading-relaxed select-all">
                      {aiResult.generatedReason}
                    </div>
                  </div>
                </div>

                {/* 1-Click Copy & Flag Action Button */}
                <button
                  onClick={handleOpenAndFlagOnGoogle}
                  className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-sm py-4 rounded-2xl shadow-xl shadow-rose-950/40 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>1-Click Copy Description, Log Flag & Open Google Maps</span>
                </button>

                {submittedSuccess && (
                  <div className="text-xs text-center text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Flag submission recorded to database! Check Dashboard for live stats.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
