'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag,
  Share2,
  ArrowLeft,
  Info,
  DollarSign,
} from 'lucide-react';
import { formatINR, formatCustomDate, getStatusBadgeStyle } from '@/lib/utils';

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedDeadline, setSelectedDeadline] = useState('');
  const [selectedMode, setSelectedMode] = useState('BORROW');
  const [borrowerNotes, setBorrowerNotes] = useState('');

  const fetchData = async () => {
    try {
      const [itemRes, meRes] = await Promise.all([
        fetch(`/api/items/${params.id}`),
        fetch('/api/auth/me'),
      ]);

      const itemData = await itemRes.json();
      const meData = await meRes.json();

      if (itemData.item) {
        setItem(itemData.item);
        setSelectedMode(itemData.item.mode === 'RENT' ? 'RENT' : 'BORROW');

        // Set default deadline: 2 days ahead at 6:00 PM
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + Math.min(2, itemData.item.maxDuration));
        defaultDate.setHours(18, 0, 0, 0);
        // format to YYYY-MM-DDTHH:mm
        const yyyy = defaultDate.getFullYear();
        const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const dd = String(defaultDate.getDate()).padStart(2, '0');
        const hh = String(defaultDate.getHours()).padStart(2, '0');
        const min = String(defaultDate.getMinutes()).padStart(2, '0');
        setSelectedDeadline(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
      }
      setCurrentUser(meData.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleRequestBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!selectedDeadline) {
      setError('Please choose a return deadline');
      return;
    }

    setRequestLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          deadline: new Date(selectedDeadline).toISOString(),
          mode: selectedMode,
          borrowerNotes: borrowerNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/borrowings');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Item Not Found</h2>
        <p className="text-xs text-slate-500">This listing may have been removed or does not exist.</p>
        <a href="/explore" className="text-xs font-semibold text-blue-600 hover:underline">
          Return to Explore
        </a>
      </div>
    );
  }

  const isOwner = currentUser?.id === item.ownerId;
  const badgeStyle = getStatusBadgeStyle(item.availability);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative h-80 sm:h-96 w-full bg-slate-100">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  {item.availability}
                </span>
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {item.condition}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Tag className="w-3.5 h-3.5" />
                <span>{item.category}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {item.name}
              </h1>

              <div className="prose prose-sm text-slate-600 leading-relaxed">
                <p>{item.description}</p>
              </div>

              {/* Specifications grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Campus Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {item.campusLocation}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Max Borrow Duration</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Up to {item.maxDuration} days
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Base Declared Value</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    {formatINR(item.declaredValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Trust & Reliability Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Listed by Peer Student
            </h3>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={item.owner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={item.owner.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{item.owner.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">
                    {item.owner.studentId} • {item.owner.branch}, {item.owner.year}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5 font-medium">IIIT-Naya Raipur Verified</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3">
                <div className="text-center bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-amber-600 font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {item.owner.rating.toFixed(1)} / 5.0
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold block">Peer Rating</span>
                </div>

                <div className="text-center bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-emerald-700 font-black text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {item.owner.reliabilityScore.toFixed(0)}%
                  </div>
                  <span className="text-[10px] text-emerald-800 font-semibold block">Reliability</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Borrow Action Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs sticky top-24 space-y-5">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Availability Mode</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {item.mode === 'RENT' ? (
                  <span className="text-amber-600">{formatINR(item.rentalPrice || 0)} / day</span>
                ) : item.mode === 'BOTH' ? (
                  <span>Free Borrow or {formatINR(item.rentalPrice || 0)}/d</span>
                ) : (
                  <span className="text-emerald-600">Free Peer Borrowing</span>
                )}
              </div>
            </div>

            {isOwner ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  You are the owner of this item
                </p>
                <p className="text-slate-600">
                  You cannot send a borrow request for your own listing. Manage incoming requests from your &ldquo;My Lent Items&rdquo; dashboard.
                </p>
                <a
                  href="/lent"
                  className="inline-block mt-2 font-bold text-blue-700 hover:underline"
                >
                  Go to My Lent Items &rarr;
                </a>
              </div>
            ) : item.availability !== 'AVAILABLE' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Currently Borrowed</p>
                <p>This item is currently checked out by another student. Check back once returned.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestBorrow} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Request sent to {item.owner.name}! Redirecting...</span>
                  </div>
                )}

                {/* Mode Selector if BOTH */}
                {item.mode === 'BOTH' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Choose Borrowing Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMode('BORROW')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          selectedMode === 'BORROW'
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Free Borrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMode('RENT')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          selectedMode === 'RENT'
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Rental ({formatINR(item.rentalPrice || 0)}/d)
                      </button>
                    </div>
                  </div>
                )}

                {/* Return Deadline Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Select Return Deadline:</span>
                    <span className="text-[11px] text-slate-400">Max {item.maxDuration} days</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={selectedDeadline}
                      onChange={(e) => setSelectedDeadline(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Choose when you will hand the item back to {item.owner.name.split(' ')[0]}.
                  </p>
                </div>

                {/* Handover Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message to Owner (Meetup & Purpose):
                  </label>
                  <textarea
                    rows={3}
                    value={borrowerNotes}
                    onChange={(e) => setBorrowerNotes(e.target.value)}
                    placeholder="e.g. 'Hi, I need this for my Calculus exam on Wednesday. Can pick it up outside Ramanujan study hall.'"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Simulated Penalty Terms Notice */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Campus Accountability Rule
                  </p>
                  <p>
                    Late returns incur a simulated penalty of <strong>5% per day</strong> (₹
                    {(item.declaredValue * 0.05).toFixed(0)}/day) and reduce your Reliability Score.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={requestLoading || success}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>{requestLoading ? 'Sending Request...' : 'Send Borrow Request'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
