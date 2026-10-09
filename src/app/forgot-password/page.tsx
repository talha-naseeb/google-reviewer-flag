'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import {
  ShieldAlert,
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<'REQUEST_CODE' | 'RESET_PASSWORD' | 'COMPLETED'>('REQUEST_CODE');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Validations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isCodeValid = /^\d{6}$/.test(resetCode.trim());
  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Request Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (data.success) {
        if (data.emailSent) {
          toast.success('Email Sent!', `6-digit reset code delivered to ${email}`);
          setInfoMessage(`We sent a 6-digit verification code to ${email}. Check your inbox.`);
        } else {
          toast.success('Code Generated!', `6-digit reset code generated for ${email}`);
          if (data.resetCode) {
            setResetCode(data.resetCode);
            setInfoMessage(`Verification code generated (Dev Auto-fill: ${data.resetCode})`);
          } else {
            setInfoMessage(`We dispatched a 6-digit verification code to ${email}.`);
          }
        }
        setStep('RESET_PASSWORD');
      } else {
        const msg = data.error || 'Failed to request reset code. Please check email.';
        setErrorMessage(msg);
        toast.error('Request Failed', msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Network error occurred. Please try again.';
      setErrorMessage(msg);
      toast.error('Network Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Reset Code & New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeValid || !isPasswordValid || !doPasswordsMatch || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          resetCode: resetCode.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Password Reset Successful!', 'Your new password is now active in MongoDB.');
        setStep('COMPLETED');
      } else {
        const msg = data.error || 'Failed to reset password. Please check your verification code.';
        setErrorMessage(msg);
        toast.error('Reset Failed', msg);
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white transition-colors">
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg dark:shadow-2xl space-y-6 backdrop-blur-md">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-gradient-to-tr from-rose-600 to-amber-500 p-3.5 rounded-2xl shadow-xl shadow-rose-950/20 mb-2">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-bold text-2xl text-slate-900 dark:text-zinc-100 tracking-tight">
            {step === 'COMPLETED'
              ? 'Password Reset Complete'
              : step === 'RESET_PASSWORD'
              ? 'Set New Password'
              : 'Forgot Your Password?'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {step === 'COMPLETED'
              ? 'You can now sign in with your new password credentials.'
              : step === 'RESET_PASSWORD'
              ? 'Enter the 6-digit code and choose a new password.'
              : 'Enter your registered email address to receive a reset code.'}
          </p>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Info message banner */}
        {infoMessage && step === 'RESET_PASSWORD' && (
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-medium animate-in fade-in duration-150">
            <Check className="w-4 h-4 shrink-0 text-blue-500" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* STEP 1: REQUEST CODE */}
        {step === 'REQUEST_CODE' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Email Address
                </label>
                {email.length > 0 && (
                  <span
                    className={`text-[11px] font-medium ${
                      isEmailValid ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {isEmailValid ? '✓ Valid email' : 'Invalid email format'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isEmailValid || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-rose-950/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Reset Code...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFICATION CODE & NEW PASSWORD */}
        {step === 'RESET_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <span className="text-[11px] text-slate-400">
                  {resetCode.length === 6 ? '✓ 6 digits' : 'Enter 6 digits'}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm font-mono tracking-widest rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  New Password
                </label>
                {newPassword.length > 0 && (
                  <span
                    className={`text-[11px] font-medium ${
                      isPasswordValid ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {isPasswordValid ? '✓ Min length met' : 'Min 6 characters'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

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
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isCodeValid || !isPasswordValid || !doPasswordsMatch || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-rose-950/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password in MongoDB...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'COMPLETED' && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-700 dark:text-zinc-300">
              Your password has been successfully updated in MongoDB. You can now log into your account using your new credentials.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 cursor-pointer"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer Back to Login Link */}
        <div className="border-t border-slate-200 dark:border-zinc-800/80 pt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
