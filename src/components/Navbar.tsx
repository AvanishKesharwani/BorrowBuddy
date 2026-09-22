'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  PlusCircle,
  Package,
  Layers,
  Search,
  User,
  LogOut,
  Shield,
  HelpCircle,
  Menu,
  X,
  Star,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/utils';
import BorrowBuddyLogo from '@/components/BorrowBuddyLogo';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 8000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Custom Fancy BorrowBuddy Logo (Books + Headphones) */}
          <a href="/" className="shrink-0">
            <BorrowBuddyLogo size="md" />
          </a>

          {/* Desktop Navigation Links (strictly 1 line with whitespace-nowrap) */}
          <div className="hidden lg:flex items-center space-x-1 shrink-0">
            <a
              href="/borrowings"
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                pathname === '/borrowings'
                  ? 'text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-950/70 border border-teal-200/50 dark:border-teal-800/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Borrow
            </a>
            <a
              href="/lent"
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                pathname === '/lent'
                  ? 'text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-950/70 border border-teal-200/50 dark:border-teal-800/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Rent &amp; Lend
            </a>

            {/* Categories Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <span className="whitespace-nowrap">Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in"
                  onClick={() => setCategoriesOpen(false)}
                >
                  {CATEGORIES.map((cat) => (
                    <a
                      key={cat}
                      href={`/explore?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-mint-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-300 transition whitespace-nowrap"
                    >
                      {cat}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/explore"
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                pathname === '/explore'
                  ? 'text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-950/70 border border-teal-200/50 dark:border-teal-800/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Items
            </a>

            {currentUser?.role === 'ADMIN' && (
              <a
                href="/admin"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  pathname === '/admin'
                    ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50'
                    : 'text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </a>
            )}
          </div>

          {/* Search bar inside header (flexibly sized to never crowd out text) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden xl:flex items-center relative w-40 2xl:w-56 shrink-1"
          >
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* List an Item CTA (strictly single line) */}
            <a
              href="/items/new"
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-xs transition whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">List an Item</span>
            </a>

            {/* Notifications Bell */}
            <a
              href="/notifications"
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
              title="Notifications"
            >
              <Bell className="w-5 h-5 shrink-0" />
              {currentUser?.unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {currentUser.unreadNotifications > 9 ? '9+' : currentUser.unreadNotifications}
                </span>
              )}
            </a>

            {/* User Profile / Account Trigger */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden xl:block text-xs font-bold text-slate-800 dark:text-slate-200 pr-1">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{currentUser.studentId || currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/40">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {currentUser.rating?.toFixed(1) || '5.0'}
                        </span>
                        <span className="flex items-center gap-1 text-teal-800 dark:text-teal-300 font-semibold bg-mint-100 dark:bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-200/50 dark:border-teal-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          {currentUser.reliabilityScore?.toFixed(0) || '100'}% Reliability
                        </span>
                      </div>
                    </div>

                    <a
                      href={`/profile/${currentUser.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Student Profile
                    </a>

                    <a
                      href="/borrowings"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Borrowed Items
                    </a>

                    <a
                      href="/lent"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-4 h-4 text-slate-400" />
                      My Lent Items & Requests
                    </a>

                    <a
                      href="/disputes"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      Disputes Center
                    </a>

                    {currentUser.role === 'ADMIN' && (
                      <a
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-bold"
                      >
                        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        Admin Dashboard
                      </a>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <a
                  href="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 px-2.5 sm:px-3 py-2 whitespace-nowrap shrink-0"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="text-xs sm:text-sm font-bold bg-mint-100 dark:bg-teal-900/60 hover:bg-mint-200 dark:hover:bg-teal-800/80 text-teal-800 dark:text-teal-200 px-3 sm:px-3.5 py-2 rounded-full transition whitespace-nowrap shrink-0 shadow-2xs border border-teal-200/40 dark:border-teal-700/50"
                >
                  Get Started
                </a>
              </div>
            )}

            {/* Mobile menu toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <a
            href="/borrowings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-mint-50 dark:hover:bg-slate-800"
          >
            Borrow
          </a>
          <a
            href="/lent"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-mint-50 dark:hover:bg-slate-800"
          >
            Rent &amp; Lend
          </a>
          <a
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-mint-50 dark:hover:bg-slate-800"
          >
            Explore Catalog
          </a>
          {currentUser?.role === 'ADMIN' && (
            <a
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40"
            >
              Admin Panel
            </a>
          )}

          {/* Mobile Theme Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <ThemeToggle showLabel className="w-full justify-start px-3 py-2 rounded-xl text-sm" />
          </div>
        </div>
      )}
    </nav>
  );
}
