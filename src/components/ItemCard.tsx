/**
 * ============================================================================
 * ITEM CARD REUSABLE COMPONENT (src/components/ItemCard.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * A reusable React UI card representing a single marketplace listing (e.g.
 * "Casio Scientific Calculator", "Arduino Kit", "Lab Coat"):
 * 1. Displays product photo, condition badge, and campus pickup location.
 * 2. Visualizes owner reputation rating (e.g. 4.9 ⭐) and reliability score (98%).
 * 3. Shows pricing badge (Free Borrow vs Daily Rent).
 * 4. Links directly to the item details and request page (`/items/[id]`).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Client Component ('use client'): Enables client interactivity such as bookmarking.
 * 2. Component Props Interface: Strict TypeScript typing ensuring all parent components
 *    pass compliant item models.
 * 3. Conditional Pricing: Dynamically renders free vs rental pricing badges.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is our reusable item card component. It displays key listing
 * information at a glance—condition, campus location, pricing mode, and owner
 * trust scores—used across the Homepage and Explore page."
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { Star, MapPin, Clock, ShieldCheck, Heart, Bookmark } from 'lucide-react';
import { formatINR, getStatusBadgeStyle } from '@/lib/utils';

// TypeScript contract: Describes the shape of an Item object passed from the database
interface ItemCardProps {
  item: {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    condition: string;
    mode: string;
    rentalPrice: number | null;
    declaredValue: number;
    maxDuration: number;
    availability: string;
    campusLocation: string;
    owner: {
      id: string;
      studentId: string;
      name: string;
      branch: string;
      year: string;
      avatarUrl: string;
      rating: number;
      reliabilityScore: number;
    };
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  // Local state for toggling bookmark heart icon on this individual card
  const [bookmarked, setBookmarked] = useState(false);
  const badgeStyle = getStatusBadgeStyle(item.availability);

  return (
    // Outer Card Container with Apple Liquid Glass frosted effect
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-800/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(13,122,117,0.14)] card-hover transition duration-300 flex flex-col group">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border shadow-xs ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {item.availability}
          </span>
          <span className="bg-slate-900/75 backdrop-blur-xs text-white text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
            {item.condition}
          </span>
        </div>

        {/* Bookmark Heart icon (matches mockup) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setBookmarked(!bookmarked);
          }}
          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-xs transition ${
            bookmarked
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600'
          }`}
          title="Save item"
        >
          <Heart className={`w-4 h-4 ${bookmarked ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Mode & Price Pill (signature teal/mint from mockup) */}
        <div className="absolute bottom-3 left-3">
          {item.mode === 'RENT' ? (
            <span className="bg-teal-700/90 backdrop-blur-xs text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              {formatINR(item.rentalPrice || 0)} / day
            </span>
          ) : item.mode === 'BOTH' ? (
            <span className="bg-teal-700/90 backdrop-blur-xs text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              Borrow or {formatINR(item.rentalPrice || 0)}/d
            </span>
          ) : (
            <span className="bg-teal-700/90 backdrop-blur-xs text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
              Free Borrow
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
            {item.category}
          </span>

          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition mt-0.5">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Rating and Duration info */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            {/* Star Rating badge (matches mockup: ★★★★★ 4.8) */}
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                <span>{item.owner.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                ({item.owner.reliabilityScore.toFixed(0)}% trust)
              </span>
            </div>

            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Max {item.maxDuration}d
            </span>
          </div>

          {/* Location on campus */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="truncate">{item.campusLocation}</span>
          </div>

          {/* Owner & CTA Button */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={`/profile/${item.owner.id}`}
              className="flex items-center gap-2 group/owner hover:opacity-85"
            >
              <img
                src={item.owner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={item.owner.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {item.owner.name.split(' ')[0]}
                </p>
                <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-mint-100 dark:bg-teal-950/70 px-1.5 py-0.2 rounded-full border border-teal-200/40 dark:border-teal-800/60">
                  Verified
                </span>
              </div>
            </a>

            <a
              href={`/items/${item.id}`}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 ${
                item.availability === 'AVAILABLE'
                  ? 'btn-teal'
                  : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed pointer-events-none'
              }`}
            >
              {item.availability === 'AVAILABLE' ? 'Borrow Item' : 'Borrowed'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
