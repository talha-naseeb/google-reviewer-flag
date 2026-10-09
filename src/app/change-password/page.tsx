'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  User,
  Shield
} from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('admin@googlereviewer.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current Password Required', 'Please enter your current password.');
      return;
    }

    if (newPassword.trim().length < 6) {
      toast.error('Weak Password', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword.trim() === currentPassword) {
      toast.error('Password Unchanged', 'New password cannot be identical to current password.');
      return;
    }

    if (newPassword.trim() !== confirmPassword) {
      toast.error('Password Mismatch', 'The new passwords do not match.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          currentPassword,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Your password has been successfully updated in MongoDB!');
        toast.success('Password Changed!', 'Your account password has been updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const msg = data.error || 'Failed to change password. Please check your current password.';
        toast.error('Change Failed', msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Network error occurred. Please try again.';
      toast.error('Network Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-xl backdrop-blur-md transition-colors">
        <div className="min-w-0">
          <h2 className="font-bold text-lg sm:text-2xl text-slate-900 dark:text-zinc-100 flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-500 shrink-0" />
            <span className="truncate">Change Account Password</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Update your dashboard authentication credentials securely in MongoDB
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-zinc-800/80 px-3.5 py-2 rounded-xl transition-colors border border-slate-200 dark:border-zinc-700/60 self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6 transition-colors">
        {/* User Account Info Pill */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">{email}</p>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500">Authenticated Administrator</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            Active Session
          </span>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold animate-in fade-in duration-150">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <div className="space-y-1">
              <p>{successMessage}</p>
              <p className="text-[11px] font-normal text-emerald-600 dark:text-emerald-500">
                You can now use this new password for your next login.
              </p>
            </div>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose a new password"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-rose-950/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Updating Password in MongoDB...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <Shield className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
