/**
 * ============================================================================
 * ITEM SPECIFICATIONS & BORROW REQUEST PAGE (src/app/items/[id]/page.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Displays full item specifications and handles the borrow request submission:
 * 1. High-res product photo, condition badge, declared replacement value, and campus handover location.
 * 2. Owner Trust Profile: Academic branch, roll number, 5-star rating, and reliability score.
 * 3. Interactive Custom Calendar Picker: Select return deadline within the owner's `maxDuration`.
 * 4. Submit Borrow Request Form: Submits request to `/api/requests`, creating an in-app
 *    notification and initiating a private communication thread.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Dynamic Routing (`[id]`): Next.js App Router loads the item ID from URL path.
 * 2. Interactive Custom Date Picker: Pure React state-driven calendar allowing
 *    date selection while disabling dates past the maximum borrowing duration.
 * 3. Client Validation: Prevents students from requesting their own listed items.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is the item details view. A student views photos, verifies the
 * owner's reputation, picks their return deadline on our custom interactive calendar,
 * and submits a borrow request."
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Info,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
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
  const [bookmarked, setBookmarked] = useState(false);

  // Form & Calendar state
  const [selectedMode, setSelectedMode] = useState('BORROW');
  const [borrowerNotes, setBorrowerNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeHour, setSelectedTimeHour] = useState('18:00'); // 6:00 PM

  // Current calendar view month/year
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

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

        // Default return date: 2 days ahead
        const defDate = new Date();
        defDate.setDate(defDate.getDate() + Math.min(2, itemData.item.maxDuration));
        setSelectedDate(defDate);
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

  // Calendar calculations
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const isDateDisabled = (day: number) => {
    if (!item) return true;
    const date = new Date(calendarYear, calendarMonth, day, 23, 59, 59);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + item.maxDuration);
    maxDate.setHours(23, 59, 59, 999);

    return date < today || date > maxDate;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === calendarMonth &&
      selectedDate.getFullYear() === calendarYear
    );
  };

  const handleSelectDay = (day: number) => {
    if (isDateDisabled(day)) return;
    const newDate = new Date(calendarYear, calendarMonth, day);
    setSelectedDate(newDate);
  };

  const handleRequestBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!selectedDate) {
      setError('Please select a return deadline on the calendar');
      return;
    }

    setRequestLoading(true);
    setError(null);

    try {
      const [h, m] = selectedTimeHour.split(':').map(Number);
      const finalDeadline = new Date(selectedDate);
      finalDeadline.setHours(h, m, 0, 0);

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          deadline: finalDeadline.toISOString(),
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
      }, 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Item Not Found</h2>
        <p className="text-xs text-slate-500">This listing may have been removed or does not exist.</p>
        <a href="/explore" className="text-xs font-semibold text-teal-700 hover:underline">
          Return to Explore
        </a>
      </div>
    );
  }

  const isOwner = currentUser?.id === item.ownerId;
  const badgeStyle = getStatusBadgeStyle(item.availability);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Mobile & Desktop Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition bg-white dark:bg-slate-900 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to items</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2 rounded-full border transition ${
              bookmarked
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${bookmarked ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image & Overview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
            <div className="relative h-80 sm:h-96 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  {item.availability}
                </span>
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {item.condition}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-900/60 border border-teal-200/40 dark:border-teal-700/50 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  {item.campusLocation}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {item.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>

              {/* Item stats row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">Max Duration</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {item.maxDuration} Days
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">Declared Base</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {formatINR(item.declaredValue)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold block">Late Penalty</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                    5% / day
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Trust Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Owner Profile &amp; Trust Index
            </h3>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={item.owner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={item.owner.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.owner.name}</h4>
                    <span className="text-[10px] font-bold text-teal-800 dark:text-teal-200 bg-mint-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700/50 px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {item.owner.studentId} • {item.owner.branch}, {item.owner.year}
                  </p>
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                    Verified IIIT-Naya Raipur Student
                  </p>
                </div>
              </div>

              {/* Rating metrics */}
              <div className="flex items-center gap-2.5">
                <div className="text-center bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {item.owner.rating.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold block">Peer Rating</span>
                </div>

                <div className="text-center bg-mint-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-3.5 py-2 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-teal-800 dark:text-teal-300 font-black text-sm">
                    <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    {item.owner.reliabilityScore.toFixed(0)}%
                  </div>
                  <span className="text-[10px] text-teal-800 dark:text-teal-300 font-semibold block">Reliability</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Booking & Calendar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs sticky top-24 space-y-5 transition-colors">
            {/* Price / Mode header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                Availability &amp; Pricing
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {item.mode === 'RENT' ? (
                  <span className="text-teal-700 dark:text-teal-400">{formatINR(item.rentalPrice || 0)} / day</span>
                ) : item.mode === 'BOTH' ? (
                  <span>Free Borrow or {formatINR(item.rentalPrice || 0)}/d</span>
                ) : (
                  <span className="text-teal-700 dark:text-teal-400">Free Peer Borrowing</span>
                )}
              </div>
            </div>

            {isOwner ? (
              <div className="p-5 bg-mint-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl text-xs text-teal-900 dark:text-teal-200 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  You own this item listing
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage requests for this item in your <strong>Rent &amp; Lend</strong> dashboard.
                </p>
                <a
                  href="/lent"
                  className="inline-block mt-2 font-bold text-teal-700 dark:text-teal-400 hover:underline"
                >
                  View Incoming Requests &rarr;
                </a>
              </div>
            ) : item.availability !== 'AVAILABLE' ? (
              <div className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">Currently Borrowed</p>
                <p>This item is currently with another student. Check back once returned.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestBorrow} className="space-y-5">
                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-mint-100 dark:bg-teal-900/60 border border-teal-200/40 dark:border-teal-700/50 text-teal-900 dark:text-teal-200 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Borrow request dispatched to {item.owner.name}!</span>
                  </div>
                )}

                {/* Mode Selector if item supports BOTH */}
                {item.mode === 'BOTH' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Choose Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMode('BORROW')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          selectedMode === 'BORROW'
                            ? 'bg-mint-100 dark:bg-teal-900/60 border-teal-600 text-teal-800 dark:text-teal-200'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        Free Borrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMode('RENT')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          selectedMode === 'RENT'
                            ? 'bg-mint-100 dark:bg-teal-900/60 border-teal-600 text-teal-800 dark:text-teal-200'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        Rent ({formatINR(item.rentalPrice || 0)}/d)
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Calendar Date Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Select Return Deadline:</span>
                    </label>
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                      Max {item.maxDuration} days
                    </span>
                  </div>

                  {/* Calendar Widget Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    {/* Month Header with < > Navigation */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>
                        {monthNames[calendarMonth]} {calendarYear}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* S M T W T F S header */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                      <span>S</span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {/* Empty cells for offset */}
                      {Array.from({ length: firstDayOfMonth(calendarMonth, calendarYear) }).map(
                        (_, idx) => (
                          <div key={`empty-${idx}`} className="h-8" />
                        )
                      )}

                      {/* Month Days */}
                      {Array.from({ length: daysInMonth(calendarMonth, calendarYear) }).map((_, idx) => {
                        const day = idx + 1;
                        const disabled = isDateDisabled(day);
                        const selected = isDateSelected(day);

                        return (
                          <button
                            type="button"
                            key={day}
                            disabled={disabled}
                            onClick={() => handleSelectDay(day)}
                            className={`h-8 w-8 mx-auto rounded-full font-semibold flex items-center justify-center transition ${
                              selected
                                ? 'bg-teal-600 text-white font-bold shadow-sm'
                                : disabled
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 hover:text-teal-800 dark:hover:text-teal-200'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Date readout & Time selector */}
                    <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Due: <strong className="text-teal-800 dark:text-teal-300">{selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}</strong>
                      </span>
                      <select
                        value={selectedTimeHour}
                        onChange={(e) => setSelectedTimeHour(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="10:00">10:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="18:00">6:00 PM (Evening)</option>
                        <option value="21:00">9:00 PM (Hostel Close)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Handover Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meetup Message for {item.owner.name.split(' ')[0]}:
                  </label>
                  <textarea
                    rows={2}
                    value={borrowerNotes}
                    onChange={(e) => setBorrowerNotes(e.target.value)}
                    placeholder="e.g. 'Can meet at Raman ground floor lobby after 5 PM!'"
                    className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* Overdue Penalty Policy Notice */}
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-[11px] text-amber-950 dark:text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1 text-amber-900 dark:text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Simulated 5%/Day Overdue Penalty
                  </p>
                  <p>
                    Late returns accumulate ₹{(item.declaredValue * 0.05).toFixed(0)}/day and automatically
                    lower your Reliability Score.
                  </p>
                </div>

                {/* Big Teal CTA Button */}
                <button
                  type="submit"
                  disabled={requestLoading || success}
                  className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-700 active:scale-98 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold text-sm rounded-full shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{requestLoading ? 'Requesting...' : 'Request Booking / Borrow'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
