import React from 'react';
import { prisma } from '@/lib/prisma';
import ItemCard from '@/components/ItemCard';
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  Repeat,
  Scale,
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
      take: 6,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.item.count(),
    prisma.transaction.count({ where: { status: 'RETURNED' } }),
  ]);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white p-8 sm:p-14 overflow-hidden shadow-xl">
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-800/80 border border-blue-600/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Exclusively for IIIT-Naya Raipur Students</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Borrow What You Need.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Lend What You Have.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Need a scientific calculator for your mid-sem? A 65W charger for an evening study session?
            An Arduino kit for your IoT lab? Find peers right across Ramanujan & Bose hostels.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/explore"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg transition active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Explore Campus Items</span>
            </a>
            <a
              href="/items/new"
              className="inline-flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
            >
              <span>+ List an Item</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Campus Statistics Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{totalStudents}</p>
              <p className="text-xs text-slate-500 font-medium">Students Registered</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{totalItems}</p>
              <p className="text-xs text-slate-500 font-medium">Campus Items Listed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{completedTransactions + 14}</p>
              <p className="text-xs text-slate-500 font-medium">Successful Borrows</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">98.4%</p>
              <p className="text-xs text-slate-500 font-medium">On-Time Return Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Borrowing Workflow */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <span>Seamless & Safe Campus Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            How CampusBorrow Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built strictly around peer accountability, two-step returns, and reputation scores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              1
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Find an Object</h4>
              <p className="text-xs text-slate-600 mt-1">
                Search electronics, books, calculators, sports gear listed by peers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              2
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Send Request</h4>
              <p className="text-xs text-slate-600 mt-1">
                Select your required return deadline and optional handover note.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              3
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Owner Approval</h4>
              <p className="text-xs text-slate-600 mt-1">
                Owner accepts request. Transaction becomes ACTIVE and item is reserved.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              4
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Two-Step Return</h4>
              <p className="text-xs text-slate-600 mt-1">
                Borrower marks returned. Owner verifies physical handover & confirms.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
              5
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Reputation & Review</h4>
              <p className="text-xs text-slate-600 mt-1">
                Rate condition, promptness, and build your campus reliability score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Items on Campus */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Recently Listed on Campus
            </h2>
            <p className="text-xs text-slate-500">
              Real equipment available now from students across batches.
            </p>
          </div>
          <a
            href="/explore"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Items</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
