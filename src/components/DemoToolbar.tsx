'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FastForward, Clock, RotateCcw, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { formatCustomDate } from '@/lib/utils';

export default function DemoToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [simulatedTime, setSimulatedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [meRes, timeRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/simulation/time'),
      ]);

      const meData = await meRes.json();
      const timeData = await timeRes.json();

      setCurrentUser(meData.user);
      if (timeData.simulatedNow) {
        setSimulatedTime(timeData.simulatedNow);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [pathname]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSwitchUser = async (identifier: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIdOrEmail: identifier }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Switched account to: ${data.user.name} (${data.user.studentId || data.user.role})`);
        fetchStatus();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTime = async (action: 'advance' | 'advanceToDeadline' | 'reset', hours = 24) => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation/time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, hours }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulatedTime(data.simulatedNow);
        showToast(
          action === 'reset'
            ? 'Campus clock reset to real time!'
            : `Campus time fast-forwarded! Overdue sweep checked.`
        );
        fetchStatus();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-3 sm:px-6 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Demo Badge & Current User */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-full font-semibold tracking-wide text-[11px] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            IIIT-NR DEMO BAR
          </span>
          <span className="text-slate-400">Active User:</span>
          {currentUser ? (
            <span className="bg-slate-800 text-slate-100 px-2 py-0.5 rounded font-medium border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser.name} ({currentUser.studentId || currentUser.role})
            </span>
          ) : (
            <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              Not Logged In
            </span>
          )}

          {/* Quick Account Switcher Buttons */}
          <div className="flex items-center gap-1 ml-1 flex-wrap">
            <span className="text-slate-400 hidden lg:inline">Switch:</span>
            <button
              onClick={() => handleSwitchUser('IIITNR-2026-001')}
              disabled={loading}
              className={`px-2 py-0.5 rounded transition ${
                currentUser?.studentId === 'IIITNR-2026-001'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Student A (Borrower Demo)"
            >
              Arjun (A)
            </button>
            <button
              onClick={() => handleSwitchUser('IIITNR-2025-014')}
              disabled={loading}
              className={`px-2 py-0.5 rounded transition ${
                currentUser?.studentId === 'IIITNR-2025-014'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Student B (Calculator Owner Demo)"
            >
              Priya (B)
            </button>
            <button
              onClick={() => handleSwitchUser('IIITNR-2024-089')}
              disabled={loading}
              className={`px-2 py-0.5 rounded transition ${
                currentUser?.studentId === 'IIITNR-2024-089'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Student C (Arduino & Hardware Owner)"
            >
              Rohan (C)
            </button>
            <button
              onClick={() => handleSwitchUser('admin@iiitnr.edu.in')}
              disabled={loading}
              className={`px-2 py-0.5 rounded transition ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-700 text-white font-semibold'
                  : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800'
              }`}
              title="Campus Administrator"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Right: Campus Clock & Fast-Forward Simulator */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Campus Time:</span>
            <span className="font-mono font-semibold text-amber-300">
              {simulatedTime ? formatCustomDate(simulatedTime) : 'Syncing...'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleSimulateTime('advance', 24)}
              disabled={loading}
              className="bg-amber-600/90 hover:bg-amber-600 text-white font-medium px-2 py-1 rounded transition flex items-center gap-1"
              title="Fast-forward time by 1 day to test deadline proximity"
            >
              <FastForward className="w-3 h-3" />
              +1 Day
            </button>
            <button
              onClick={() => handleSimulateTime('advance', 72)}
              disabled={loading}
              className="bg-amber-700/90 hover:bg-amber-700 text-white font-medium px-2 py-1 rounded transition flex items-center gap-1"
              title="Fast-forward time by 3 days"
            >
              <FastForward className="w-3 h-3" />
              +3 Days
            </button>
            <button
              onClick={() => handleSimulateTime('advanceToDeadline')}
              disabled={loading}
              className="bg-rose-700 hover:bg-rose-600 text-white font-medium px-2 py-1 rounded transition flex items-center gap-1"
              title="Advance right past the active deadline to trigger OVERDUE status & 5% penalty"
            >
              <ShieldAlert className="w-3 h-3" />
              Past Deadline
            </button>
            <button
              onClick={() => handleSimulateTime('reset')}
              disabled={loading}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded transition flex items-center gap-1"
              title="Reset simulated time to real-world clock"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedback && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-blue-950 text-blue-100 border border-blue-600 px-4 py-1.5 rounded-full shadow-lg font-medium text-xs flex items-center gap-2 animate-bounce">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}
    </header>
  );
}
