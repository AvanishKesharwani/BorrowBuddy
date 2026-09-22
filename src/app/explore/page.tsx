'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Tag } from 'lucide-react';
import ItemCard from '@/components/ItemCard';
import { CATEGORIES } from '@/lib/utils';

export default function ExplorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [minRating, setMinRating] = useState('0');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedMode && selectedMode !== 'ALL') params.set('mode', selectedMode);
      if (selectedAvailability && selectedAvailability !== 'ALL') params.set('availability', selectedAvailability);
      if (minRating && minRating !== '0') params.set('minRating', minRating);

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory, selectedMode, selectedAvailability, minRating]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMode('ALL');
    setSelectedAvailability('ALL');
    setMinRating('0');
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

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, model, keyword (e.g. 'Calculator', 'Arduino', 'Charger', 'Physics')..."
            className="w-full pl-12 pr-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
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
