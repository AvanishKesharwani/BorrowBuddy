'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder to avoid layout shift before hydration
    return (
      <div
        className={`w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 active:scale-90 border focus:outline-none focus:ring-2 focus:ring-teal-500/50 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-750 text-amber-400 border-slate-700 hover:border-amber-400/40 shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-teal-300 shadow-2xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] animate-in zoom-in-75 duration-200" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] animate-in zoom-in-75 duration-200" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold whitespace-nowrap">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
