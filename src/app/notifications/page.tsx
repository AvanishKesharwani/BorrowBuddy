'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Check,
  Package,
} from 'lucide-react';
import { formatCustomDate, formatRelativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'OVERDUE':
      case 'PENALTY':
        return <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'DUE_SOON':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'ACCEPTED':
      case 'RETURNED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'DISPUTE':
        return <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-2xl border border-blue-200/40 dark:border-blue-800/60">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Campus Notifications</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live updates on borrow requests, approvals, deadlines, and return confirmations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'unread'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-3 py-2 rounded-xl transition"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Notifications</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notification history found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 transition shadow-xs flex items-start justify-between gap-4 ${
                !n.read
                  ? 'border-blue-300 dark:border-blue-800/80 bg-blue-50/15 dark:bg-blue-950/25'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0">
                  {getNotifIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                    {formatRelativeTime(n.createdAt)} • {formatCustomDate(n.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                {n.link && (
                  <a
                    href={n.link}
                    className="text-xs font-bold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/40 dark:border-blue-800/60 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
                {!n.read && (
                  <button
                    onClick={() => handleMarkOneRead(n.id)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
