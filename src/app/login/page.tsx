'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Sparkles, ArrowRight, BookOpen } from 'lucide-react';

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
      <div className="bg-white p-8 rounded-4xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md shadow-teal-700/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Login</h1>
          <p className="text-xs text-slate-500">
            Sign in with your IIIT-Naya Raipur student email or Student ID to access BorrowBuddy
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full pl-10 pr-3 py-3 text-xs border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full pl-10 pr-3 py-3 text-xs border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-full shadow-md shadow-teal-700/20 transition active:scale-98 disabled:bg-slate-300 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to BorrowBuddy'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          New to campus?{' '}
          <a href="/register" className="text-teal-700 font-bold hover:underline">
            Register Student Profile
          </a>
        </div>
      </div>

      {/* 1-Click Fast Login for Presentation */}
      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-xs space-y-3">
        <div className="flex items-center gap-1.5 text-teal-800 font-bold">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Demo 1-Click Presentation Accounts:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('arjun@iiitnr.edu.in', 'password123')}
            className="p-2.5 text-left bg-white hover:bg-mint-50 border border-slate-200 hover:border-teal-300 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-slate-900">Arjun Mehta (Student A)</p>
            <p className="text-[10px] text-slate-500">DSAI 1st Year (Borrower)</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('priya@iiitnr.edu.in', 'password123')}
            className="p-2.5 text-left bg-white hover:bg-mint-50 border border-slate-200 hover:border-teal-300 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-slate-900">Priya Sharma (Student B)</p>
            <p className="text-[10px] text-slate-500">CSE 2nd Year (Calculator)</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('rohan@iiitnr.edu.in', 'password123')}
            className="p-2.5 text-left bg-white hover:bg-mint-50 border border-slate-200 hover:border-teal-300 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-slate-900">Rohan Verma (Student C)</p>
            <p className="text-[10px] text-slate-500">ECE 3rd Year (Arduino)</p>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@iiitnr.edu.in', 'admin123')}
            className="p-2.5 text-left bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-2xl transition shadow-2xs"
          >
            <p className="font-bold text-purple-900">Dr. S. K. Admin</p>
            <p className="text-[10px] text-purple-600">Faculty In-Charge</p>
          </button>
        </div>
      </div>
    </div>
  );
}
