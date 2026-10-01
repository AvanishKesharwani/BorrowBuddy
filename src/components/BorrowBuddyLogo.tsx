/**
 * ============================================================================
 * BRAND LOGO & EMBLEM COMPONENT (src/components/BorrowBuddyLogo.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Renders the official BorrowBuddy brand identity and campus subtitle
 * ("BorrowBuddy — IIIT-Naya Raipur").
 * Supports three responsive sizes (`sm`, `md`, `lg`) and dynamic light/dark styling.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Reusable Presentational Component: Isolates brand styling and typography
 *    in one place, ensuring consistent visual identity across the Navbar, Footer,
 *    and Auth screens.
 * 2. Dark-Mode Adaptive Glow: Uses Tailwind drop shadows and glow filters that
 *    adaptively shine in dark mode.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this component renders our institutional logo. It supports multiple
 * size configurations and automatically adjusts colors and glow effects for dark mode."
 * ============================================================================
 */

import React from 'react';

interface BorrowBuddyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * ----------------------------------------------------------------------------
 * FancyLogoIcon:
 * Renders the isolated logo graphic with custom drop-shadow and hover scaling.
 * ----------------------------------------------------------------------------
 */
export function FancyLogoIcon({
  className = 'w-10 h-10',
  alt = 'BorrowBuddy Emblem',
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`object-contain ${className} drop-shadow-[0_2px_8px_rgba(20,184,166,0.2)] dark:drop-shadow-[0_0_20px_rgba(45,212,191,0.35)] dark:brightness-105 transition-transform duration-200 select-none`}
    />
  );
}

/**
 * ----------------------------------------------------------------------------
 * BorrowBuddyLogo:
 * Main brand component combining emblem and responsive typography.
 * ----------------------------------------------------------------------------
 */
export default function BorrowBuddyLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
}: BorrowBuddyLogoProps) {
  // Sizing definitions for responsive display
  const sizeMap = {
    sm: {
      icon: 'w-8 h-8',
      text: 'text-base',
      sub: 'text-[9px]',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-10 h-10 sm:w-11 sm:h-11',
      text: 'text-lg sm:text-xl',
      sub: 'text-[10px] sm:text-[11px]',
      gap: 'gap-2.5 sm:gap-3',
    },
    lg: {
      icon: 'w-14 h-14 sm:w-16 sm:h-16',
      text: 'text-2xl sm:text-3xl',
      sub: 'text-xs',
      gap: 'gap-3.5',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center ${currentSize.gap} shrink-0 group ${className}`}>
      {/* Brand Icon Emblem */}
      <div className="shrink-0 relative transition-transform duration-200 group-hover:scale-105">
        <FancyLogoIcon className={currentSize.icon} />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 leading-none">
          <span className={`font-extrabold text-slate-900 dark:text-white ${currentSize.text} tracking-tight whitespace-nowrap transition-colors`}>
            BorrowBuddy
          </span>
        </div>
        {showSubtitle && (
          <p className={`${currentSize.sub} font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mt-1 whitespace-nowrap transition-colors`}>
            IIIT-Naya Raipur
          </p>
        )}
      </div>
    </div>
  );
}
