/**
 * ============================================================================
 * DARK / LIGHT THEME CONTEXT PROVIDER (src/components/ThemeProvider.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Implements full-application Dark and Light mode state management:
 * 1. Checks `localStorage` or browser `prefers-color-scheme` on initial load.
 * 2. Toggles the `.dark` class on the `<html>` root element.
 * 3. Provides a React Context hook (`useTheme()`) so any button or component
 *    can read or change the active theme.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. React Context API (`createContext`, `useContext`): Avoids prop drilling by
 *    making theme state accessible throughout the entire component tree.
 * 2. Hydration Mismatch Prevention: Uses `useEffect` with `mounted` state to
 *    safely sync client preferences with server-rendered markup.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file implements our Dark/Light theme provider using the React
 * Context API. It persists user preferences in localStorage and applies the Tailwind
 * dark class to the HTML document root."
 * ============================================================================
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check initial preference from localStorage or OS system settings
    const savedTheme = localStorage.getItem('borrowbuddy-theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    } else {
      setThemeState('light');
      document.documentElement.classList.remove('dark');
    }
    setMounted(true);
  }, []);

  /**
   * --------------------------------------------------------------------------
   * setTheme(newTheme):
   * Sets new theme, writes to localStorage, and updates documentElement classes.
   * --------------------------------------------------------------------------
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('borrowbuddy-theme', newTheme);
    } catch (e) {}

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * --------------------------------------------------------------------------
   * toggleTheme():
   * Inverts theme between 'light' and 'dark'.
   * --------------------------------------------------------------------------
   */
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * ----------------------------------------------------------------------------
 * useTheme():
 * Custom React hook for consuming theme state and actions in components.
 * ----------------------------------------------------------------------------
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
