import React from 'react';

interface BorrowBuddyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function FancyLogoIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bbLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D7A75" />
          <stop offset="100%" stopColor="#043230" />
        </linearGradient>
        <linearGradient id="bbMintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
        <linearGradient id="bbGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Squircle Badge Background */}
      <rect width="48" height="48" rx="13" fill="url(#bbLogoBg)" />
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="12"
        stroke="#2DD4BF"
        strokeWidth="1.2"
        strokeOpacity="0.35"
      />

      {/* Headphone Arch / Headband */}
      <path
        d="M 12 24 C 12 13.5 36 13.5 36 24"
        stroke="url(#bbMintGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Inner Headband Cushion */}
      <path
        d="M 16 19.5 C 19 17 29 17 32 19.5"
        stroke="#E6F4F3"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Left Earcup */}
      <rect
        x="8.5"
        y="19.5"
        width="5.5"
        height="9"
        rx="2.5"
        fill="#14B8A6"
        stroke="#FFFFFF"
        strokeWidth="1.2"
      />
      <rect x="10.2" y="21.5" width="2" height="5" rx="1" fill="#043230" />

      {/* Right Earcup */}
      <rect
        x="34"
        y="19.5"
        width="5.5"
        height="9"
        rx="2.5"
        fill="#14B8A6"
        stroke="#FFFFFF"
        strokeWidth="1.2"
      />
      <rect x="35.7" y="21.5" width="2" height="5" rx="1" fill="#043230" />

      {/* Book Cover / Shadow base */}
      <path
        d="M 13 36.5 C 17 35 21 35 24 37 C 27 35 31 35 35 36.5 L 35 38 C 31 36.5 27 36.5 24 38.5 C 21 36.5 17 36.5 13 38 Z"
        fill="url(#bbGoldGrad)"
      />

      {/* Left Book Page */}
      <path
        d="M 24 26 C 20 24.5 16 24.8 13.5 26.2 L 13.5 35.8 C 16 34.5 20 34.2 24 35.8 Z"
        fill="#FFFFFF"
      />
      {/* Right Book Page */}
      <path
        d="M 24 26 C 28 24.5 32 24.8 34.5 26.2 L 34.5 35.8 C 32 34.5 28 34.2 24 35.8 Z"
        fill="#F0FAF9"
      />

      {/* Page Text Lines Left */}
      <line x1="16" y1="28.5" x2="21.5" y2="28" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="16" y1="31" x2="21.5" y2="30.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="16" y1="33.5" x2="20" y2="33" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />

      {/* Page Text Lines Right */}
      <line x1="26.5" y1="28" x2="32" y2="28.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="26.5" y1="30.5" x2="32" y2="31" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="26.5" y1="33" x2="30" y2="33.5" stroke="#94A3B8" strokeWidth="0.9" strokeLinecap="round" />

      {/* Spine & Center Bookmark Ribbon */}
      <path
        d="M 23.3 25.5 L 24.7 25.5 L 24.7 37.5 L 24 36.8 L 23.3 37.5 Z"
        fill="url(#bbGoldGrad)"
      />

      {/* Sparkle accent */}
      <path
        d="M 37 13 L 37.7 14.5 L 39.2 15.2 L 37.7 15.9 L 37 17.4 L 36.3 15.9 L 34.8 15.2 L 36.3 14.5 Z"
        fill="url(#bbMintGrad)"
      />
    </svg>
  );
}

export default function BorrowBuddyLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
}: BorrowBuddyLogoProps) {
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
      icon: 'w-14 h-14',
      text: 'text-2xl',
      sub: 'text-xs',
      gap: 'gap-3.5',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center ${currentSize.gap} shrink-0 group ${className}`}>
      <div className="shrink-0 relative transition-transform duration-200 group-hover:scale-105 drop-shadow-md">
        <FancyLogoIcon className={currentSize.icon} />
      </div>
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
