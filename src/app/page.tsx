import React from 'react';
import { prisma } from '@/lib/prisma';
import ItemCard from '@/components/ItemCard';
import {
  Search,
  BookOpen,
  Laptop,
  Tent,
  Cpu,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  Star,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [items, totalStudents, totalItems, completedTransactions] = await Promise.all([
    prisma.item.findMany({
      where: { availability: 'AVAILABLE' },
      include: {
        owner: {
          select: {
            id: true,
            studentId: true,
            name: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
          },
        },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.item.count(),
    prisma.transaction.count({ where: { status: 'RETURNED' } }),
  ]);

  const featuredCategories = [
    {
      name: 'Textbooks & Academics',
      query: 'Academic Equipment',
      icon: BookOpen,
      count: 'Calculators, Books, Lab Tools',
    },
    {
      name: 'Electronics & Tech',
      query: 'Electronics',
      icon: Laptop,
      count: 'Chargers, HDMI, Audio',
    },
    {
      name: 'Outdoor & Sports',
      query: 'Sports',
      icon: Tent,
      count: 'Badminton, Cycles, Gear',
    },
    {
      name: 'Project & Lab Gear',
      query: 'Project Equipment',
      icon: Cpu,
      count: 'Arduino, Multimeter, Sensors',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* 1. IIIT-NR Campus Hero Banner with Real Campus Photo */}
      <section className="relative rounded-4xl bg-white border border-slate-200/80 p-6 sm:p-10 lg:p-14 overflow-hidden shadow-xs">
        {/* Mint gradient highlight */}
        <div className="absolute top-0 right-0 w-3/5 h-full bg-gradient-to-l from-mint-100/70 via-mint-50/40 to-transparent pointer-events-none -z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: Headline & Action Points */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-mint-100 border border-teal-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-teal-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Dr. SPM IIIT-Naya Raipur Official Campus Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              BORROWBUDDY: Your Campus Borrowing &amp; Renting Marketplace
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Save money, share resources, and connect with fellow students at IIIT-Naya Raipur.
              Borrow calculators, chargers, lab equipment, cycles, and books across Ramanujan &amp; Bose hostels.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href="/explore"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-bold px-7 py-3.5 rounded-full shadow-md shadow-teal-700/20 transition"
              >
                <span>Browse Items</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/items/new"
                className="inline-flex items-center gap-2 bg-mint-100 hover:bg-mint-200 border border-teal-200 text-teal-900 text-sm font-bold px-6 py-3.5 rounded-full transition"
              >
                <span>+ List an Item</span>
              </a>
            </div>

            {/* Important Highlights for IIIT-NR Students */}
            <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Verified @iiitnr.edu.in Only</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Hostels &amp; Library Handover</span>
              </div>
            </div>
          </div>

          {/* Right: Actual IIIT-Naya Raipur Campus Photo Banner Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] bg-slate-100 group">
              <img
                src="/images/iiitnr-campus-banner.jpg"
                alt="Dr. Shyama Prasad Mukherjee IIIT Naya Raipur campus building and students"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />

              {/* Banner Badge overlay with institutional name */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-100 shadow-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider bg-mint-100 px-2 py-0.5 rounded-full">
                    Campus Landmark
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    100% Safe Returns
                  </span>
                </div>
                <p className="text-xs font-extrabold text-slate-900">
                  Dr. SPM IIIT-Naya Raipur Main Campus
                </p>
                <p className="text-[11px] text-slate-500">
                  Connected across Hostel Ramanujan (Boys) &amp; Hostel Bose (Girls)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Key Institutional Highlights Strip on Hero Banner */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-mint-50/70 border border-teal-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Campus Locations</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Meetups outside Ramanujan, Bose, Central Library, SAC, and IoT Labs.
            </p>
          </div>

          <div className="bg-mint-50/70 border border-teal-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Two-Step Return</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Borrower marks returned $\rightarrow$ Owner physically inspects &amp; confirms.
            </p>
          </div>

          <div className="bg-mint-50/70 border border-teal-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
              <AlertCircle className="w-4 h-4 text-teal-600" />
              <span>Overdue Protection</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Automated 5%/day simulated penalty protects owners from unreturned gear.
            </p>
          </div>

          <div className="bg-mint-50/70 border border-teal-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Trust &amp; Reliability</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Dual ratings: peer review score + behavior-based reliability index.
            </p>
          </div>
        </div>

        {/* 3. Integrated Floating Search Bar in Banner */}
        <div className="mt-6 pt-4">
          <form
            action="/explore"
            method="GET"
            className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto bg-slate-50 p-2 rounded-full border border-slate-200 shadow-xs"
          >
            <div className="flex-1 flex items-center px-4 w-full">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search for calculators, chargers, Arduino kits, textbooks, cycles..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold px-7 py-2.5 rounded-full transition shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-400">Popular on campus:</span>
            <a
              href="/explore?q=Calculator"
              className="bg-white hover:bg-mint-100 text-teal-800 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-semibold transition"
            >
              Casio Calculator
            </a>
            <a
              href="/explore?q=Arduino"
              className="bg-white hover:bg-mint-100 text-teal-800 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-semibold transition"
            >
              Arduino Starter Kit
            </a>
            <a
              href="/explore?q=Charger"
              className="bg-white hover:bg-mint-100 text-teal-800 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-semibold transition"
            >
              Dell 65W Charger
            </a>
            <a
              href="/explore?q=Physics"
              className="bg-white hover:bg-mint-100 text-teal-800 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-semibold transition"
            >
              Physics Textbook
            </a>
            <a
              href="/explore?q=Bicycle"
              className="bg-white hover:bg-mint-100 text-teal-800 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-semibold transition"
            >
              Geared Bicycle
            </a>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section (matches the mint cards in mockup) */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Featured Categories
          </h2>
          <p className="text-xs text-slate-500">
            Browse physical equipment listed by category across campus hostels
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.name}
                href={`/explore?category=${encodeURIComponent(cat.query)}`}
                className="bg-mint-100/70 hover:bg-mint-100 border border-teal-200/80 rounded-3xl p-6 text-center card-hover transition duration-200 flex flex-col items-center justify-center space-y-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs group-hover:scale-110 transition duration-200">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-800 transition">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.count}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* 3. Newest Listings (matches laptop screen mockup) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Newest Campus Listings
            </h2>
            <p className="text-xs text-slate-500">
              Fresh equipment available today for borrowing or rental
            </p>
          </div>
          <a
            href="/explore"
            className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All ({totalItems})</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. How It Works Section (matches tablet screen mockup in center) */}
      <section className="bg-white rounded-4xl p-8 sm:p-12 border border-slate-200/80 shadow-xs space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs text-slate-500">
            A simple 3-step campus borrowing protocol built around trust and accountability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-mint-50 border border-teal-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-base">1. Browse items near you</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Search calculators, chargers, or lab kits available from peers across Ramanujan and Bose hostels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-mint-50 border border-teal-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">2. Request to borrow / rent</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your required return deadline and send a request. Owner approves and item is reserved for you.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-mint-50 border border-teal-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">3. Meet up &amp; exchange on campus</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use in-app chat to coordinate meetup, complete two-step return verification, and exchange peer ratings.
            </p>
          </div>
        </div>

        {/* 5. Top Borrowers & Trust / Safety (matches tablet bottom row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          {/* Top Students Card */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Top Campus Borrowers &amp; Lenders</span>
              </h4>
              <span className="text-[11px] font-bold text-teal-700 bg-mint-100 px-2.5 py-0.5 rounded-full">
                Active Cohort
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
                    alt="Arjun Mehta"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Arjun Mehta</p>
                    <p className="text-[10px] text-slate-500">DSAI • 8 Borrows</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.8 ★</span>
                  <span className="ml-2 text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-semibold px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                    alt="Priya Sharma"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Priya Sharma</p>
                    <p className="text-[10px] text-slate-500">CSE • 12 Items Lent</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 ★</span>
                  <span className="ml-2 text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-semibold px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Safety Card */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Campus Trust &amp; Safety Protocol</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                BorrowBuddy verifies institutional identities (`@iiitnr.edu.in`) and uses a strict
                two-step return confirmation. Items cannot be self-confirmed as returned without owner
                inspection.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 mt-3 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Automated 5%/day overdue penalty tracking</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Direct handover chat &amp; designated hostel meetup spots</span>
                </li>
              </ul>
            </div>

            <a
              href="/explore"
              className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition"
            >
              <span>Explore All Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
