'use client';

import React from 'react';
import { DashboardStats } from '@/types/review';
import { MessageSquare, AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Flagged Violations',
      value: stats.flaggedCount,
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'High Risk Fake Reviews',
      value: stats.highRiskCount,
      icon: ShieldAlert,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Pending Google Review',
      value: stats.pendingGoogleCount,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Google Removed',
      value: stats.removedCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border ${c.bgColor} backdrop-blur-sm transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</span>
              <IconComponent className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-100">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
};
