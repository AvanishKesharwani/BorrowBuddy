'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Star,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  Package,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { formatCustomDate, formatINR } from '@/lib/utils';
import ItemCard from '@/components/ItemCard';

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reputation'>('listings');

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${params.id}`);
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">Student Profile Not Found</h2>
        <a href="/explore" className="text-xs font-semibold text-teal-700">
          Back to Explore
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Header Card */}
      <div className="bg-white rounded-4xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={profile.name}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-mint-100 shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900">{profile.name}</h1>
                <span className="text-[11px] font-mono font-bold bg-mint-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                  {profile.studentId}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>
                  {profile.branch} • {profile.year}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Verified IIIT-NR BorrowBuddy student since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Trust Scores: Peer Rating & Reliability Score */}
          <div className="flex items-center gap-3">
            {/* Peer Rating */}
            <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-3xl text-center min-w-[115px]">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xl">
                <Star className="w-5 h-5 fill-amber-400" />
                {profile.rating?.toFixed(1) || '5.0'}
              </div>
              <span className="text-[11px] font-bold text-amber-800 block mt-0.5">Peer Rating</span>
              <span className="text-[10px] text-amber-700/80 block">
                {profile.ratingsReceived?.length || 0} reviews
              </span>
            </div>

            {/* Reliability Score */}
            <div className="bg-mint-100/70 border border-teal-200/80 p-4 rounded-3xl text-center min-w-[115px]">
              <div className="flex items-center justify-center gap-1 text-teal-800 font-black text-xl">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                {profile.reliabilityScore?.toFixed(0) || '100'}%
              </div>
              <span className="text-[11px] font-bold text-teal-900 block mt-0.5">Reliability</span>
              <span className="text-[10px] text-teal-700 block">Behavior Score</span>
            </div>
          </div>
        </div>

        {/* Accountability Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-slate-100 text-center">
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-xl font-black text-slate-900 block">{stats?.totalBorrowed || 0}</span>
            <span className="text-[11px] font-bold text-slate-500">Items Borrowed</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-xl font-black text-teal-700 block">
              {stats?.successfullyReturned || 0}
            </span>
            <span className="text-[11px] font-bold text-slate-500">Returned On-Time</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-xl font-black text-blue-600 block">
              {stats?.currentlyBorrowed || 0}
            </span>
            <span className="text-[11px] font-bold text-slate-500">Currently Borrowed</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span
              className={`text-xl font-black block ${
                (stats?.overdueReturns || 0) > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {stats?.overdueReturns || 0}
            </span>
            <span className="text-[11px] font-bold text-slate-500">Overdue Returns</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl col-span-2 sm:col-span-1">
            <span className="text-xl font-black text-purple-600 block">{stats?.totalLent || 0}</span>
            <span className="text-[11px] font-bold text-slate-500">Items Lent</span>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
            activeTab === 'listings'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Listings ({profile.items?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reputation')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
            activeTab === 'reputation'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Peer Reviews &amp; Feedback ({profile.ratingsReceived?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'listings' ? (
        profile.items?.length === 0 ? (
          <div className="bg-white rounded-4xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
            <p className="text-sm font-bold text-slate-800">No Listings Yet</p>
            <p className="text-xs text-slate-500">This student hasn&apos;t listed items on campus yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.items.map((item: any) => (
              <ItemCard
                key={item.id}
                item={{
                  ...item,
                  owner: {
                    id: profile.id,
                    studentId: profile.studentId,
                    name: profile.name,
                    branch: profile.branch,
                    year: profile.year,
                    avatarUrl: profile.avatarUrl,
                    rating: profile.rating,
                    reliabilityScore: profile.reliabilityScore,
                  },
                }}
              />
            ))}
          </div>
        )
      ) : (
        /* Reputation & Reviews */
        <div className="space-y-4">
          {profile.ratingsReceived?.length === 0 ? (
            <div className="bg-white rounded-4xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
              <Star className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No Peer Reviews Yet</p>
              <p className="text-xs text-slate-500">
                Completed return transactions will produce verified reviews here.
              </p>
            </div>
          ) : (
            profile.ratingsReceived.map((r: any) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.reviewer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={r.reviewer.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{r.reviewer.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {r.reviewer.studentId} • Verified Handover
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl text-amber-600 font-black text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{r.rating}.0 / 5</span>
                  </div>
                </div>

                {r.criteria && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {r.criteria.split(',').map((c: string) => (
                      <span
                        key={c}
                        className="text-[10px] font-bold bg-mint-100 text-teal-800 px-2.5 py-0.5 rounded-full"
                      >
                        {c.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-700 italic pt-1">&ldquo;{r.comment}&rdquo;</p>
                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Item: {r.transaction?.item?.name || 'Campus Resource'}</span>
                  <span>{formatCustomDate(r.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
