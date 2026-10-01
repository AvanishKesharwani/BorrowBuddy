/**
 * ============================================================================
 * CAMPUS FACULTY & ADMIN CONTROL PANEL (src/app/admin/page.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Administrative oversight dashboard for campus faculty in-charge:
 * 1. "Overview" Tab: Live KPI summary cards showing active borrowings, overdue items,
 *    total penalties accrued, open disputes, and campus-wide average reliability rating.
 * 2. "Students" Tab: Directory of all students with activity counts, reputation scores,
 *    and one-click instant account Suspension / Reinstatement toggles.
 * 3. "Catalog Audit" Tab: Search and inspect all listed equipment with administrative
 *    removal powers for prohibited items.
 * 4. "Penalty Rules" Tab: Form to adjust the default daily late fee (5%/day) and
 *    maximum safety penalty cap (50%).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. RBAC (Role-Based Access Control): Restricted exclusively to users where `role === 'ADMIN'`.
 * 2. Parallel Administrative Fetching: Loads stats, users, items, and config simultaneously
 *    using `Promise.all` across four dedicated admin API endpoints.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is the Campus Admin Dashboard for college authorities. It provides
 * institutional oversight over the entire system: monitoring active loans and disputes,
 * moderating equipment listings, adjusting late fee rates, and suspending chronic defaulters."
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Package,
  Repeat,
  AlertTriangle,
  DollarSign,
  Star,
  Settings,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Lock,
  Unlock,
  BookOpen,
} from 'lucide-react';
import { formatCustomDate, formatINR, getStatusBadgeStyle } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ penaltyRateDaily: 0.05, penaltyMaxPercent: 0.50 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'items' | 'config'>('overview');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, itemsRes, configRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/items'),
        fetch('/api/admin/config'),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const itemsData = await itemsRes.json();
      const configData = await configRes.json();

      setStats(statsData);
      setUsers(usersData.users || []);
      setItems(itemsData.items || []);
      if (configData.config) setConfig(configData.config);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isSuspended: !currentSuspended }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`User ${!currentSuspended ? 'suspended' : 'reactivated'}.`);
        setTimeout(() => setFeedback(null), 3000);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete student "${userName}" and all their campus listings and records? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Student "${userName}" removed from campus directory.`);
        setTimeout(() => setFeedback(null), 3000);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while deleting the user.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item listing from campus?')) return;
    try {
      const res = await fetch('/api/admin/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Item removed by administrator.');
        setTimeout(() => setFeedback(null), 3000);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          penaltyRateDaily: config.penaltyRateDaily,
          penaltyMaxPercent: config.penaltyMaxPercent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('Global penalty settings updated successfully.');
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading campus admin console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-4xl shadow-sm flex items-center justify-between flex-wrap gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-800 rounded-2xl border border-teal-700">
            <Shield className="w-7 h-7 text-teal-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-950 border border-teal-700 px-2.5 py-0.5 rounded-full text-teal-200">
              Institutional Authority
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-1">BorrowBuddy Administration</h1>
            <p className="text-xs text-teal-200">
              Oversee campus safety, student accountability, item moderation, and penalty policies at IIIT-NR.
            </p>
          </div>
        </div>

        {/* Tab switcher with Framer Motion sliding morph pill */}
        <div className="relative flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-full border border-slate-700 text-xs font-bold w-full sm:w-auto overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & KPIs' },
            { id: 'students', label: `Students (${users.length})` },
            { id: 'items', label: `Items (${items.length})` },
            { id: 'config', label: 'Penalty Rules' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2 rounded-full transition-colors duration-200 z-10 whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminActiveTabPill"
                    className="absolute inset-0 bg-teal-600 rounded-full shadow-[0_2px_12px_rgba(13,122,117,0.5)] z-[-1]"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-mint-100 border border-teal-200 text-teal-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Animated Tab Content with morphing blur crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tab: Overview & KPIs */}
          {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Total Students</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {stats?.totalStudents || 0}
              </span>
              <span className="text-[11px] text-teal-700 font-semibold">Verified IIIT-NR</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Campus Listings</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.totalItems || 0}</span>
              <span className="text-[11px] text-teal-700 font-semibold">Active gear</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Active Borrowings</span>
              <span className="text-2xl font-black text-teal-700 mt-1 block">
                {stats?.activeBorrowings || 0}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Currently in use</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Completed Borrows</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {stats?.completedReturns || 0}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Safely returned</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Overdue Items</span>
              <span
                className={`text-2xl font-black mt-1 block ${
                  (stats?.overdueTransactions || 0) > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {stats?.overdueTransactions || 0}
              </span>
              <span className="text-[11px] text-rose-500 font-medium">Action pending</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Total Simulated Penalties</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {formatINR(stats?.totalSimulatedPenalties || 0)}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">5% / overdue day</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Average Peer Rating</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {stats?.averageStudentRating?.toFixed(1) || '5.0'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Out of 5.0</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold block">Average Reliability</span>
              <span className="text-2xl font-black text-teal-800 mt-1 block flex items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                {stats?.averageReliability?.toFixed(0) || '100'}%
              </span>
              <span className="text-[11px] text-teal-700 font-semibold">Accountability index</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Students Directory */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-4xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Registered Students Directory</h3>
            <span className="text-xs text-slate-500">{users.length} enrolled students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Student ID</th>
                  <th className="p-3.5">Branch &amp; Year</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Reliability</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-700">{u.studentId}</td>
                    <td className="p-3.5">
                      {u.branch}, {u.year}
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {u.rating?.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-teal-800">
                        {u.reliabilityScore?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-mint-100 text-teal-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {u.isSuspended ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Suspended
                        </span>
                      ) : (
                        <span className="text-teal-800 bg-mint-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.role === 'ADMIN' ? (
                        <span className="text-[11px] text-slate-400 font-medium italic">Protected</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                            className={`text-xs px-3 py-1 rounded-full font-bold transition ${
                              u.isSuspended
                                ? 'bg-mint-100 text-teal-800 hover:bg-mint-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {u.isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-rose-200 hover:border-rose-300 px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1"
                            title={`Delete ${u.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Items Moderation */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-4xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Campus Item Listings Moderation</h3>
            <span className="text-xs text-slate-500">{items.length} items listed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Availability</th>
                  <th className="p-3.5">Declared Value</th>
                  <th className="p-3.5">Campus Location</th>
                  <th className="p-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img src={it.imageUrl} alt={it.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{it.name}</p>
                        <p className="text-[10px] text-slate-400">{it.condition}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{it.owner.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{it.owner.studentId}</p>
                    </td>
                    <td className="p-3.5">{it.category}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-teal-800 bg-mint-100 px-2 py-0.5 rounded-full">
                        {it.availability}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{formatINR(it.declaredValue)}</td>
                    <td className="p-3.5 text-slate-500 truncate max-w-[150px]">{it.campusLocation}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteItem(it.id)}
                        className="text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-full font-bold transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Penalty Rules Configuration */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 sm:p-8 rounded-4xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-mint-100 text-teal-700 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Penalty &amp; Overdue Policies</h3>
              <p className="text-xs text-slate-500">
                Configure simulated daily penalty percentages and maximum allowable caps across campus.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Daily Overdue Penalty Rate: {(config.penaltyRateDaily * 100).toFixed(0)}% per day
              </label>
              <input
                type="range"
                min="0.01"
                max="0.20"
                step="0.01"
                value={config.penaltyRateDaily}
                onChange={(e) =>
                  setConfig({ ...config, penaltyRateDaily: parseFloat(e.target.value) })
                }
                className="w-full accent-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Standard rule: 5% per day multiplied by item declared value.
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Maximum Penalty Cap: {(config.penaltyMaxPercent * 100).toFixed(0)}% of item value
              </label>
              <input
                type="range"
                min="0.10"
                max="1.0"
                step="0.05"
                value={config.penaltyMaxPercent}
                onChange={(e) =>
                  setConfig({ ...config, penaltyMaxPercent: parseFloat(e.target.value) })
                }
                className="w-full accent-teal-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Prevents simulated penalties from exceeding a fraction (default 50% max) of the object value.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-xs transition"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
