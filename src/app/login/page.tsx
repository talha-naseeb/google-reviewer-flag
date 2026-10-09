'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.trim().length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid) {
      toast.error('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (data.success && data.user) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name || 'Admin');

        toast.success('Signed in successfully!', `Welcome back, ${data.user.name || 'Admin'}`);
        setTimeout(() => {
          let target = '/';
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const redirectParam = params.get('redirect');
            if (redirectParam && redirectParam.startsWith('/')) {
              target = redirectParam;
            }
          }
          window.location.href = target;
        }, 600);
      } else {
        const msg = data.error || 'Authentication failed. Please check your credentials.';
        toast.error('Authentication Failed', msg);
      }
    } catch (err: any) {
      const msg = err.message || 'Network error occurred. Please try again.';
      toast.error('Network Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white transition-colors">
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg dark:shadow-2xl space-y-6 backdrop-blur-md">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-gradient-to-tr from-rose-600 to-amber-500 p-3.5 rounded-2xl shadow-xl shadow-rose-950/20 mb-2">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-bold text-2xl text-slate-900 dark:text-zinc-100 tracking-tight">Sign In to Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Google Review Link Auto-Fetcher & Flagging System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 text-sm rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:border-rose-500 transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-end mt-1.5">
              <Link
                href="/forgot-password"
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-rose-950/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Moderator Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 dark:border-zinc-800/80 pt-4 text-center text-xs text-slate-500 dark:text-zinc-400">
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">Authorized personnel only • Google Content Moderation Suite</p>
        </div>
      </div>
    </div>
  );
}
