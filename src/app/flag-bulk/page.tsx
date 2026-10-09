'use client';

import React, { useState } from 'react';
import { parseCSVContent, generateSampleCSV } from '@/lib/csvParser';
import { generateNvidiaRemovalDescription } from '@/lib/nvidiaAI';
import { Review } from '@/types/review';
import { FileSpreadsheet, Upload, Download, Sparkles, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';

export default function BulkFlagPage() {
  const [bulkText, setBulkText] = useState('');
  const [bulkResults, setBulkResults] = useState<Review[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setIsProcessing(true);
        const parsed = parseCSVContent(content);
        await processBulk(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessText = async () => {
    if (!bulkText.trim()) return;
    setIsProcessing(true);
    const parsed = parseCSVContent(bulkText);
    await processBulk(parsed);
  };

  const processBulk = async (reviews: Review[]) => {
    const processed: Review[] = [];

    for (const item of reviews) {
      const aiRes = await generateNvidiaRemovalDescription(item.comment, item.reviewerName, item.rating);
      const updatedReview: Review = {
        ...item,
        status: 'PENDING_GOOGLE_REVIEW',
        analysis: {
          isViolating: true,
          riskLevel: 'HIGH',
          primaryViolation: {
            category: 'SPAM_OR_FAKE',
            ruleNumber: aiRes.ruleNumber,
            ruleTitle: aiRes.policyRuleTitle,
            confidenceScore: aiRes.confidenceScore,
            evidence: ['Matched Google Content Policy'],
            justificationTemplate: aiRes.generatedReason
          },
          secondaryViolations: [],
          suggestedAction: 'Flag on Google',
          generatedReportReason: aiRes.generatedReason
        }
      };

      // Save to backend database
      try {
        await fetch('/api/reviews/submit-flag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review: updatedReview })
        });
      } catch (e) {}

      processed.push(updatedReview);
    }

    setBulkResults(processed);
    setIsProcessing(false);
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_google_reviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFlagOnGoogle = (targetUrl: string, reasonText: string) => {
    if (reasonText) navigator.clipboard.writeText(reasonText);
    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div>
          <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-rose-600 dark:text-rose-500" />
            Bulk Links & CSV File Flagging
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Upload `.csv` spreadsheet or paste multiple Google Review URLs for batch processing
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-amber-500" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Input Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV File Upload Option */}
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Option A: Upload CSV File
          </h3>

          <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition-all relative bg-slate-50/50 dark:bg-zinc-950/40 group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-200">Click or Drag & Drop `.csv` file here</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Supported columns: URL, Reviewer_Name, Rating, Comment_Text</p>
          </div>
        </div>

        {/* Bulk Text Area Option */}
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-rose-600 dark:text-rose-500" />
            Option B: Paste Multiple Google Review URLs
          </h3>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste multiple Google review links (one per line)..."
            rows={5}
            className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-xs rounded-xl p-3.5 font-mono focus:outline-none focus:border-rose-500 transition-colors"
          />

          <button
            onClick={handleProcessText}
            disabled={isProcessing || !bulkText.trim()}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isProcessing ? 'Processing & Generating AI Removal Descriptions...' : 'Process & Flag Bulk Links'}</span>
          </button>
        </div>
      </div>

      {/* Results Table */}
      {bulkResults.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-sm dark:shadow-xl transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-4">
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
              <span>Bulk Processed Results</span>
              <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {bulkResults.length} Processed
              </span>
            </h3>
            <button
              onClick={() => setBulkResults([])}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Table</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-zinc-950/40">
                  <th className="py-3 px-4 rounded-l-lg">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Policy Rule</th>
                  <th className="py-3 px-4">Generated AI Removal Description</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
                {bulkResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-200">{r.reviewerName}</td>
                    <td className="py-3.5 px-4 text-amber-500 font-bold">{r.rating}★</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold px-2.5 py-1 rounded-md inline-block truncate max-w-[200px]">
                        Rule #{r.analysis?.primaryViolation?.ruleNumber || 1}: {r.analysis?.primaryViolation?.ruleTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[11px] text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-950 px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-800">
                          {r.analysis?.generatedReportReason}
                        </span>
                        <button
                          onClick={() => {
                            if (r.analysis?.generatedReportReason) {
                              navigator.clipboard.writeText(r.analysis.generatedReportReason);
                              setCopiedId(r.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }
                          }}
                          className="shrink-0 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleFlagOnGoogle(r.googleReviewUrl || '', r.analysis?.generatedReportReason || '')}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto shadow-md"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Flag on Google</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
