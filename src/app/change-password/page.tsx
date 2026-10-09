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
  AlertCircle,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  // Live Validations
  const isCurrentPasswordEntered = currentPassword.length > 0;
  const isNewPasswordValid = newPassword.length >= 6;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid =
    isCurrentPasswordEntered && isNewPasswordValid && isDifferentFromCurrent && doPasswordsMatch;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
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
        setErrorMessage(msg);
        toast.error('Change Failed', msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Network error occurred. Please try again.';
      setErrorMessage(msg);
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

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                New Password
              </label>
              {newPassword.length > 0 && (
                <span
                  className={`text-[11px] font-medium ${
                    isNewPasswordValid ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {isNewPasswordValid ? '✓ Min 6 characters' : 'Min 6 characters'}
                </span>
              )}
            </div>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Confirm New Password
              </label>
              {confirmPassword.length > 0 && (
                <span
                  className={`text-[11px] font-medium ${
                    doPasswordsMatch ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {doPasswordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
                </span>
              )}
            </div>
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

          {/* Validation Checklist Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
            <p className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider">
              Password Requirements:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={isNewPasswordValid ? 'text-emerald-500' : 'text-slate-400'}>
                  {isNewPasswordValid ? '✓' : '•'}
                </span>
                <span>At least 6 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={doPasswordsMatch ? 'text-emerald-500' : 'text-slate-400'}>
                  {doPasswordsMatch ? '✓' : '•'}
                </span>
                <span>New passwords match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={isDifferentFromCurrent ? 'text-emerald-500' : 'text-slate-400'}>
                  {isDifferentFromCurrent ? '✓' : '•'}
                </span>
                <span>Different from current</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
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
