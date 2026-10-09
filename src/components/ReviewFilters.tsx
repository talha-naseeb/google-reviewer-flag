'use client';

import React from 'react';
import { ViolationCategory, ModerationStatus, RiskLevel } from '@/types/review';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface ReviewFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  selectedRisk: string;
  onRiskChange: (r: string) => void;
  onReset: () => void;
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedRisk,
  onRiskChange,
  onReset
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4 justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by reviewer name, comment text, or location..."
          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedRisk}
          onChange={(e) => onRiskChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
        >
          <option value="ALL">All Risk Levels</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
          <option value="NONE">No Risk</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
        >
          <option value="ALL">All Violation Rules</option>
          <option value="SPAM_OR_FAKE">Rule 1: Spam / Fake</option>
          <option value="MULTIPLE_REVIEWS">Rule 2: Duplicate Review</option>
          <option value="OFFENSIVE_OR_HATE">Rule 3: Hate / Profanity</option>
          <option value="COMPETITOR_CONFLICT">Rule 4: Competitor Conflict</option>
          <option value="WRONG_BUSINESS">Rule 5: Wrong Business</option>
          <option value="WRONG_LOCATION">Rule 6: Wrong Location</option>
          <option value="EMPLOYEE_CONFLICT">Rule 7: Employee Dispute</option>
          <option value="IRRELEVANT_OFFTOPIC">Rule 8: Off-Topic / News</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active (Needs Action)</option>
          <option value="PENDING_GOOGLE_REVIEW">Pending Google Moderation</option>
          <option value="REMOVED">Removed by Google</option>
          <option value="DISMISSED">Dismissed</option>
        </select>

        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset Filters"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
