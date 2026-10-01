/**
 * ============================================================================
 * BORROWBUDDY HOMEPAGE & DISCOVERY PORTAL (src/app/page.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Renders the main landing page of BorrowBuddy:
 * 1. Hero banner with quick search bar and campus metrics counters.
 * 2. Visual category cards (Electronics, Academic Textbooks, Lab Gear, Sports).
 * 3. "Recently Listed on Campus" live marketplace grid.
 * 4. "How BorrowBuddy Works" 3-step student guide (Search & Request -> Meet & Handover -> Return & Review).
 * 5. Campus Trust & Reliability rules (Zero Lost Items, Student ID verification, Overdue alerts).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. React Server Component (RSC): Notice there is NO 'use client' directive.
 *    This component executes directly on the Node.js server.
 * 2. Direct Server-Side DB Querying: Queries SQLite directly with `prisma.item.findMany()`
 *    and `Promise.all` count queries. No client-side fetch waterfall or loading spinners!
 * 3. Fast Zero-JS Payload: Sends pre-rendered HTML to the student's browser.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is our homepage built as a Next.js React Server Component.
 * It queries our SQLite database directly on the server to display live campus statistics
 * and recently listed items with maximum performance."
 * ============================================================================
 */

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

// Tells Next.js to always fetch fresh data from SQLite on every visit (no stale cache)
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // --------------------------------------------------------------------------
  // PARALLEL DATA FETCHING (Using Promise.all)
  // Instead of waiting for 4 queries one after another (Query 1 -> Query 2 -> Query 3),
  // Promise.all fires all 4 queries concurrently to the SQLite database.
  // This drastically reduces page load latency!
  // --------------------------------------------------------------------------
  const [items, totalStudents, totalItems, completedTransactions] = await Promise.all([
    // 1. Fetch latest 8 available items with their owner profiles
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
    // 2. Count registered student accounts
    prisma.user.count({ where: { role: 'STUDENT' } }),
    // 3. Count total campus listings
    prisma.item.count(),
    // 4. Count successful returned transactions
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
      {/* 1. Panoramic IIIT-NR Campus Hero Banner inspired by reference design */}
      <section className="relative rounded-4xl overflow-hidden shadow-2xl border border-teal-900/30 text-white min-h-[580px] sm:min-h-[620px] flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        {/* Background Image: Real IIIT-Naya Raipur Campus */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 hover:scale-105"
          style={{ backgroundImage: `url('/images/iiitnr-campus-banner.jpg')` }}
        />

        {/* Deep atmospheric overlay with signature Teal / Slate gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-teal-950/80 to-slate-950/95 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/25 via-transparent to-black/60 pointer-events-none" />

        {/* Centered Hero Content */}
        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto my-auto pt-4 sm:pt-8">

          {/* Big, Bold Typography (matching reference school hero) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
            Borrow What You Need.
            <span className="block text-mint-300 bg-gradient-to-r from-mint-300 via-teal-200 to-teal-400 bg-clip-text text-transparent">
              Lend What You Have.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-sm">
            Empowering students with knowledge, resources, and trust across IIIT-Naya Raipur.
            Borrow calculators, chargers, lab kits, and cycles across Raman &amp; Shabri hostels!
          </p>

          {/* Centered Action Buttons (matching reference buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="/explore"
              className="inline-flex items-center gap-2.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 text-sm sm:text-base font-black px-8 py-3.5 rounded-full shadow-xl shadow-teal-950/50 hover:shadow-teal-400/30 transition duration-200"
            >
              <span>Browse Items</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </a>

            <a
              href="/items/new"
              className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/30 backdrop-blur-md text-sm sm:text-base font-bold px-8 py-3.5 rounded-full transition duration-200 shadow-lg"
            >
              <span>+ List an Item</span>
            </a>
          </div>

          {/* Integrated Floating Search Bar inside Hero */}
          <div className="pt-4 max-w-2xl mx-auto w-full">
            <form
              action="/explore"
              method="GET"
              className="flex flex-col sm:flex-row items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-full border border-white/40 shadow-2xl"
            >
              <div className="flex-1 flex items-center px-4 w-full">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search calculators, chargers, Arduino kits, textbooks, cycles..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold px-7 py-2.5 rounded-full transition shadow-md shrink-0"
              >
                Search
              </button>
            </form>

            {/* Quick Search Chips */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-300 flex-wrap">
              <span className="font-semibold text-slate-400">Popular on campus:</span>
              <a
                href="/explore?q=Calculator"
                className="bg-slate-900/60 hover:bg-teal-900/80 text-teal-200 border border-teal-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold transition"
              >
                Casio Calculator
              </a>
              <a
                href="/explore?q=Arduino"
                className="bg-slate-900/60 hover:bg-teal-900/80 text-teal-200 border border-teal-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold transition"
              >
                Arduino Starter Kit
              </a>
              <a
                href="/explore?q=Charger"
                className="bg-slate-900/60 hover:bg-teal-900/80 text-teal-200 border border-teal-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold transition"
              >
                Dell 65W Charger
              </a>
              <a
                href="/explore?q=Physics"
                className="bg-slate-900/60 hover:bg-teal-900/80 text-teal-200 border border-teal-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold transition"
              >
                Physics Textbook
              </a>
              <a
                href="/explore?q=Bicycle"
                className="bg-slate-900/60 hover:bg-teal-900/80 text-teal-200 border border-teal-500/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold transition"
              >
                Geared Bicycle
              </a>
            </div>
          </div>
        </div>

        {/* Institutional Trust Highlights Strip (Frosted Glass Inside Hero) */}
        <div className="relative z-10 pt-8 mt-6 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 text-left">
          <div className="bg-slate-950/60 hover:bg-slate-950/75 border border-white/15 backdrop-blur-md p-4 rounded-2xl transition duration-200">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1">
              <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Campus Locations</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Meetups outside Raman, Shabri, Central Library, SAC, and IoT Labs.
            </p>
          </div>

          <div className="bg-slate-950/60 hover:bg-slate-950/75 border border-white/15 backdrop-blur-md p-4 rounded-2xl transition duration-200">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Two-Step Return</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Borrower marks returned &rarr; Owner physically inspects &amp; confirms.
            </p>
          </div>

          <div className="bg-slate-950/60 hover:bg-slate-950/75 border border-white/15 backdrop-blur-md p-4 rounded-2xl transition duration-200">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1">
              <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Overdue Protection</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Automated 5%/day simulated penalty protects owners from unreturned gear.
            </p>
          </div>

          <div className="bg-slate-950/60 hover:bg-slate-950/75 border border-white/15 backdrop-blur-md p-4 rounded-2xl transition duration-200">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span>Trust &amp; Reliability</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Dual ratings: peer review score + behavior-based reliability index.
            </p>
          </div>
        </div>
      </section>

      {/* Verified Campus Statistics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs transition-colors duration-200">
        <div className="flex items-center gap-3.5 px-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{totalStudents}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Verified Students</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{totalItems}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Campus Items Listed</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{completedTransactions}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Successful Returns</div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 px-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">Raman &amp; Shabri</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Hostels Network</div>
          </div>
        </div>
      </div>

      {/* 2. Featured Categories Section (matches the mint cards in mockup) */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Featured Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
                className="bg-mint-100/70 dark:bg-slate-900 hover:bg-mint-100 dark:hover:bg-slate-850 border border-teal-200/80 dark:border-slate-800 rounded-3xl p-6 text-center card-hover transition duration-200 flex flex-col items-center justify-center space-y-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-300 shadow-2xs group-hover:scale-110 transition duration-200">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-800 dark:group-hover:text-teal-300 transition">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{cat.count}</p>
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
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Newest Campus Listings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fresh equipment available today for borrowing or rental
            </p>
          </div>
          <a
            href="/explore"
            className="text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1"
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
      <section className="bg-white dark:bg-slate-900 rounded-4xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8 transition-colors duration-200">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A simple 3-step campus borrowing protocol built around trust and accountability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-mint-50 dark:bg-slate-950 border border-teal-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
              1
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">1. Browse items near you</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Search calculators, chargers, or lab kits available from peers across Raman and Shabri hostels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-mint-50 dark:bg-slate-950 border border-teal-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
              2
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">2. Request to borrow / rent</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Select your required return deadline and send a request. Owner approves and item is reserved for you.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-mint-50 dark:bg-slate-950 border border-teal-100 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-sm">
              3
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">3. Meet up &amp; exchange on campus</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Use in-app chat to coordinate meetup, complete two-step return verification, and exchange peer ratings.
            </p>
          </div>
        </div>

        {/* 5. Top Borrowers & Trust / Safety (matches tablet bottom row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          {/* Top Students Card */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Top Campus Borrowers &amp; Lenders</span>
              </h4>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-950/70 px-2.5 py-0.5 rounded-full border border-teal-200/40 dark:border-teal-800/60">
                Active Cohort
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"
                    alt="Arjun Mehta"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Arjun Mehta</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">DSAI • 8 Borrows</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.8 ★</span>
                  <span className="ml-2 text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                    alt="Priya Sharma"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Priya Sharma</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">CSE • 12 Items Lent</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 ★</span>
                  <span className="ml-2 text-[10px] bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Safety Card */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Campus Trust &amp; Safety Protocol</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                BorrowBuddy verifies institutional identities (`@iiitnr.edu.in`) and uses a strict
                two-step return confirmation. Items cannot be self-confirmed as returned without owner
                inspection.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 mt-3 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Automated 5%/day overdue penalty tracking</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Direct handover chat &amp; designated hostel meetup spots</span>
                </li>
              </ul>
            </div>

            <a
              href="/explore"
              className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition shadow-xs"
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
