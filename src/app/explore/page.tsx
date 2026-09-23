'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import ItemCard from '@/components/ItemCard';
import { CATEGORIES } from '@/lib/utils';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'All';
  const urlMode = searchParams.get('mode') || 'ALL';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedMode, setSelectedMode] = useState(urlMode);
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [minRating, setMinRating] = useState('0');

  // Keep state in sync with URL search params (Navbar search, Category cards, chips)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'All';
    const mode = searchParams.get('mode') || 'ALL';
    setSearchQuery(q);
    setSelectedCategory(cat);
    setSelectedMode(mode);
  }, [searchParams]);

  const fetchItems = useCallback(
    async (
      query: string,
      category: string,
      mode: string,
      availability: string,
      rating: string
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (category && category !== 'All') params.set('category', category);
        if (mode && mode !== 'ALL') params.set('mode', mode);
        if (availability && availability !== 'ALL') params.set('availability', availability);
        if (rating && rating !== '0') params.set('minRating', rating);

        const res = await fetch(`/api/items?${params.toString()}`);
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        console.error('Failed to fetch items:', e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce API calls when typing or selecting filters
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchItems(searchQuery, selectedCategory, selectedMode, selectedAvailability, minRating);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory, selectedMode, selectedAvailability, minRating, fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedMode && selectedMode !== 'ALL') params.set('mode', selectedMode);
    const qs = params.toString();
    router.replace(qs ? `/explore?${qs}` : '/explore', { scroll: false });
    fetchItems(searchQuery, selectedCategory, selectedMode, selectedAvailability, minRating);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (cat && cat !== 'All') params.set('category', cat);
    if (selectedMode && selectedMode !== 'ALL') params.set('mode', selectedMode);
    const qs = params.toString();
    router.replace(qs ? `/explore?${qs}` : '/explore', { scroll: false });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (selectedMode && selectedMode !== 'ALL') params.set('mode', selectedMode);
    const qs = params.toString();
    router.replace(qs ? `/explore?${qs}` : '/explore', { scroll: false });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMode('ALL');
    setSelectedAvailability('ALL');
    setMinRating('0');
    router.replace('/explore', { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-900/60 px-3 py-1 rounded-full inline-block mb-1.5 border border-teal-200/40 dark:border-teal-700/50">
            Campus Marketplace Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Browse All Campus Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Physical equipment available across IIIT-NR hostels, labs, and academic blocks.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, model, keyword (e.g. 'Calculator', 'Arduino', 'Charger', 'Physics')..."
            className="w-full pl-12 pr-28 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`text-xs px-4 py-2 rounded-full font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-mint-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter controls row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Filters:</span>
            </div>

            {/* Mode Filter */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="ALL">All Modes (Borrow &amp; Rent)</option>
              <option value="BORROW">Free Borrow Only</option>
              <option value="RENT">Rental Only</option>
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="ALL">All Availability</option>
              <option value="AVAILABLE">Available Now Only</option>
            </select>

            {/* Owner Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="0">Any Owner Rating</option>
              <option value="4.0">⭐ 4.0+ Stars</option>
              <option value="4.5">⭐ 4.5+ Stars</option>
            </select>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 font-semibold px-2 py-1 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-500">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Searching campus listings...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-4xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No matching items found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, category, or filter criteria. Or list this item yourself!
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="bg-mint-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200/40 dark:border-teal-700/50 text-xs font-bold px-5 py-2.5 rounded-full hover:bg-mint-200 dark:hover:bg-teal-800 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">
            Showing <span className="font-bold text-slate-900 dark:text-white">{items.length}</span> items across IIIT-NR campus
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExploreSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-4xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-8 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div
            key={n}
            className="h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreContent />
    </Suspense>
  );
}
