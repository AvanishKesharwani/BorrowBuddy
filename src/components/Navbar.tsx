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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
          {/* Logo & University Emblem (matches mockup) */}
          <a href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-700/20 group-hover:bg-teal-700 transition">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                  BorrowBuddy
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-700 mt-0.5">
                IIIT-Naya Raipur
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <a
              href="/borrowings"
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                pathname === '/borrowings'
                  ? 'text-teal-700 bg-mint-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Borrow
            </a>
            <a
              href="/lent"
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                pathname === '/lent'
                  ? 'text-teal-700 bg-mint-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Rent & Lend
            </a>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center gap-1"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in"
                  onClick={() => setCategoriesOpen(false)}
                >
                  {CATEGORIES.map((cat) => (
                    <a
                      key={cat}
                      href={`/explore?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-mint-50 hover:text-teal-700 transition"
                    >
                      {cat}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a
              href="/explore"
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                pathname === '/explore'
                  ? 'text-teal-700 bg-mint-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              All Items
            </a>

            {currentUser?.role === 'ADMIN' && (
              <a
                href="/admin"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                  pathname === '/admin'
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </a>
            )}
          </div>

          {/* Search bar inside header (matches mockup desktop view) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative max-w-xs w-full"
          >
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2.5">
            {/* List an Item CTA (in signature Teal from mockup) */}
            <a
              href="/items/new"
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List an Item</span>
            </a>

            {/* Notifications Bell */}
            <a
              href="/notifications"
              className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
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
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-teal-300 transition"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden xl:block text-xs font-bold text-slate-800 pr-1">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{currentUser.studentId || currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {currentUser.rating?.toFixed(1) || '5.0'}
                        </span>
                        <span className="flex items-center gap-1 text-teal-800 font-semibold bg-mint-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          {currentUser.reliabilityScore?.toFixed(0) || '100'}% Reliability
                        </span>
                      </div>
                    </div>

                    <a
                      href={`/profile/${currentUser.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Student Profile
                    </a>

                    <a
                      href="/borrowings"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Borrowed Items
                    </a>

                    <a
                      href="/lent"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Layers className="w-4 h-4 text-slate-400" />
                      My Lent Items & Requests
                    </a>

                    <a
                      href="/disputes"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      Disputes Center
                    </a>

                    {currentUser.role === 'ADMIN' && (
                      <a
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 font-bold"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </a>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <a
                  href="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-teal-700 px-3 py-2"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="text-xs sm:text-sm font-bold bg-mint-100 hover:bg-mint-200 text-teal-800 px-3.5 py-2 rounded-full transition"
                >
                  Get Started
                </a>
              </div>
            )}

            {/* Mobile menu toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-2 text-xs text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <a
            href="/borrowings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-mint-50"
          >
            Borrow
          </a>
          <a
            href="/lent"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-mint-50"
          >
            Rent & Lend
          </a>
          <a
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-mint-50"
          >
            Explore Catalog
          </a>
          {currentUser?.role === 'ADMIN' && (
            <a
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-purple-700 bg-purple-50"
            >
              Admin Panel
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
