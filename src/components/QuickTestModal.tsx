'use client';

import React, { useState } from 'react';
import { analyzeReview } from '@/lib/analyzerEngine';
import { AnalysisResult } from '@/types/review';
import { X, FlaskConical, AlertTriangle, ShieldCheck, Play } from 'lucide-react';

interface QuickTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTestModal: React.FC<QuickTestModalProps> = ({ isOpen, onClose }) => {
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(1);
  const [reviewerName, setReviewerName] = useState('Sample Reviewer');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleRunTest = () => {
    if (!commentText.trim()) return;
    const res = analyzeReview({
      comment: commentText,
      rating,
      reviewerName,
      locationName: 'Test Business Location'
    });
    setAnalysisResult(res);
  };

  const samplePresets = [
    { label: 'Ex-Employee Rant', text: 'The manager fired me last week just because I asked for my paycheck. Corrupt workplace!', rating: 1 },
    { label: 'Competitor Promo', text: 'Horrible service here. Instead go to Apex Dental down the road, they have better staff and lower prices.', rating: 1 },
    { label: 'Crypto Spam Bot', text: 'Scam business! Join Telegram @FastCryptoProfit to get refund or paid 5 star reviews https://scam-site.com', rating: 1 },
    { label: 'Profanity Attack', text: 'Total scum! The idiot behind the counter called me a bitch!', rating: 1 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">AI Policy Rule Sandbox</h2>
              <p className="text-xs text-slate-400">Test any review text against Google's 9 Content Policy Rules</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Sample Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Try Sample Scenarios:</label>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCommentText(p.text);
                    setRating(p.rating);
                    setAnalysisResult(null);
                  }}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Reviewer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Review Comment Text</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Paste review comment text here..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg p-3 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleRunTest}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-2.5 rounded-xl shadow-lg transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Run AI Policy Engine</span>
            </button>
          </div>

          {/* Results Display */}
          {analysisResult && (
            <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Analysis Result</h4>

              {analysisResult.isViolating && analysisResult.primaryViolation ? (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-rose-300">
                      Rule #{analysisResult.primaryViolation.ruleNumber}: {analysisResult.primaryViolation.ruleTitle}
                    </span>
                    <span className="text-xs bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded">
                      {analysisResult.primaryViolation.confidenceScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{analysisResult.generatedReportReason}</p>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>No policy violation detected. Standard subjective customer feedback.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
