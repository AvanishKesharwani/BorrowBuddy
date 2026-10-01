/**
 * ============================================================================
 * INSTITUTIONAL LOGIN VIEW (src/app/login/page.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Student authentication sign-in portal:
 * 1. Accepts IIIT-NR institutional email or Student Roll Number + password.
 * 2. Calls `/api/auth/login` to verify credentials against salted bcrypt hashes.
 * 3. Provides instant one-click pre-filled buttons for presentation testing:
 *    - Arjun (Borrower Demo)
 *    - Priya (Lender Demo)
 *    - Dr. S. K. Verma (Campus Administrator)
 * 4. Stores session cookie and forwards user to `/explore`.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Client-Side Authentication Flow: Manages loading states, error boundaries,
 *    and programmatic Next.js router redirection (`router.push('/explore')`).
 * 2. Evaluator Convenience: Pre-filled credentials allow seamless login testing
 *    during live teacher presentations.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is our Institutional Login page. Students can sign in with their
 * IIIT-NR email or Student ID. For quick evaluation, we also provide one-click
 * demo credentials to instantly test borrower, lender, or admin roles."
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { FancyLogoIcon } from '@/components/BorrowBuddyLogo';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/explore');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto my-6 space-y-6 pb-12">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="text-center space-y-3">
          <FancyLogoIcon className="w-14 h-14 mx-auto drop-shadow-md" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Login</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your IIIT-Naya Raipur student email or Student ID to access BorrowBuddy
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student ID or Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. IIITNR-2026-001 or arjun@iiitnr.edu.in"
                className="w-full pl-10 pr-3 py-3 text-xs border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 text-xs border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-md shadow-teal-700/20 transition active:scale-98 disabled:bg-slate-300 dark:disabled:bg-slate-700 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to BorrowBuddy'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          New to campus?{' '}
          <a href="/register" className="text-teal-700 dark:text-teal-400 font-bold hover:underline">
            Register Student Profile
          </a>
        </div>
      </div>

      {/* 1-Click Fast Login for Presentation */}
      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 transition-colors">
        <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Demo 1-Click Presentation Accounts:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('arjun@iiitnr.edu.in', 'password123')}
            className="p-2.5 text-left bg-white dark:bg-slate-800 hover:bg-mint-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-slate-100">Arjun Mehta (Student A)</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">DSAI 1st Year (Borrower)</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('priya@iiitnr.edu.in', 'password123')}
            className="p-2.5 text-left bg-white dark:bg-slate-800 hover:bg-mint-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-slate-100">Priya Sharma (Student B)</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">CSE 2nd Year (Calculator)</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('rohan@iiitnr.edu.in', 'password123')}
            className="p-2.5 text-left bg-white dark:bg-slate-800 hover:bg-mint-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-slate-900 dark:text-slate-100">Rohan Verma (Student C)</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">ECE 3rd Year (Arduino)</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@iiitnr.edu.in', 'admin123')}
            className="p-2.5 text-left bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-purple-900 dark:text-purple-200">Dr. S. K. Admin</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400">Faculty In-Charge</p>
          </button>
        </div>
      </div>
    </div>
  );
}
