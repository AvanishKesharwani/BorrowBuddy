/**
 * ============================================================================
 * TAILWIND CSS STYLING CONFIGURATION (tailwind.config.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Customizes Tailwind CSS utility classes with IIIT-NR's signature color palette
 * (Teal `#0D7A75`, Mint `#E8F6F5`), custom border-radii (`3xl`, `4xl` for rounded
 * modern cards), and enables class-based Dark Mode (`darkMode: 'class'`).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Design System: Unifies colors across the app so all buttons, badges, and
 *    headers use matching campus brand tokens.
 * 2. Dark Mode Support: Configured with `class` strategy so `next-themes` can
 *    toggle between Dark and Light mode by adding the `.dark` class to `<html>`.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file defines our design system. We defined custom color palettes
 * (IIIT-NR brand teal and mint), custom rounded container shapes, and enabled
 * dark mode support across the entire frontend."
 * ============================================================================
 */

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand teal palette
        teal: {
          50: '#F0FAF9',
          100: '#E6F4F3',
          200: '#CCEAE8',
          300: '#99D5D1',
          400: '#4DB5AE',
          500: '#14938B',
          600: '#0D7A75', // Primary signature teal
          700: '#0A615D',
          800: '#074946',
          900: '#043230',
          950: '#021C1B',
        },
        // Soft mint accent colors for badges and highlights
        mint: {
          50: '#F6FCFB',
          100: '#E8F6F5',
          200: '#D1EDEA',
          300: '#B0DFDB',
        },
        // Institutional color tokens
        iiit: {
          50: '#F0FAF9',
          100: '#E6F4F3',
          500: '#14938B',
          600: '#0D7A75',
          700: '#0A615D',
          800: '#074946',
          900: '#043230',
        },
      },
      // Soft, modern pill and card corners
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
