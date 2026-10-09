'use client';

import React from 'react';
import { RefreshCw, MapPin, CheckCircle2, Clock, Zap, Radio } from 'lucide-react';
import { GBPLocation } from '@/lib/gbpClient';

interface SyncStatusBannerProps {
  locations: GBPLocation[];
  selectedLocationName: string;
  onLocationChange: (name: string) => void;
  lastSyncedTimestamp: string | null;
  isSyncing: boolean;
  onTriggerSync: () => void;
  autoPollingEnabled: boolean;
  onToggleAutoPolling: () => void;
  isLiveApiConnected: boolean;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  locations,
  selectedLocationName,
  onLocationChange,
  lastSyncedTimestamp,
  isSyncing,
  onTriggerSync,
  autoPollingEnabled,
  onToggleAutoPolling,
  isLiveApiConnected
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Location Selector & Connection Status */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <select
            value={selectedLocationName}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc.name} value={loc.locationName} className="bg-slate-900 text-slate-200">
                📍 {loc.locationName} ({loc.totalReviewCount} reviews)
              </option>
            ))}
          </select>
        </div>

        {/* Live API Badge */}
        <div
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${
            isLiveApiConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isLiveApiConnected ? 'animate-pulse text-emerald-400' : 'text-blue-400'}`} />
          <span>{isLiveApiConnected ? 'GBP Live API Connected' : 'Enhanced GBP Adapter Active'}</span>
        </div>

        {/* Last Synced */}
        {lastSyncedTimestamp && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Synced at {lastSyncedTimestamp}</span>
          </div>
        )}
      </div>

      {/* Right: Sync Controls & Auto-Polling Toggle */}
      <div className="flex items-center gap-3">
        {/* Auto Polling Toggle */}
        <button
          onClick={onToggleAutoPolling}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border transition-colors ${
            autoPollingEnabled
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
          title="Auto-polls Google Business Profile API every 30 seconds"
        >
          <Zap className={`w-3.5 h-3.5 ${autoPollingEnabled ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
          <span>{autoPollingEnabled ? 'Auto-Sync ON (30s)' : 'Auto-Sync OFF'}</span>
        </button>

        {/* Manual Sync Button */}
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Reviews Now'}</span>
        </button>
      </div>
    </div>
  );
};
