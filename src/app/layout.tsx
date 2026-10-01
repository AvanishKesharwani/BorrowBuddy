/**
 * ============================================================================
 * ROOT APPLICATION LAYOUT (src/app/layout.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * The foundational root layout wrapping every page in the Next.js application:
 * 1. Configures HTML `<head>` metadata (page titles, descriptions, favicon).
 * 2. Injects an inline anti-flash script ensuring dark mode preference is loaded
 *    instantly before the DOM paints, preventing white flash on dark theme.
 * 3. Wraps the page tree in `ThemeProvider` for campus dark/light mode.
 * 4. Mounts the presentation `DemoToolbar` and global `Navbar`.
 * 5. Injects the shared campus footer across all views.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Root Layout in App Router: In Next.js 13+, `app/layout.tsx` persists state
 *    across route navigations without re-rendering the surrounding chrome.
 * 2. Anti-FOUC (Flash of Unstyled Content) Script: Reads localStorage synchronously
 *    before browser render to prevent theme flashing.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this is our root layout. It wraps every page in the app with our global
 * ThemeProvider, persistent navigation bar, campus footer, and presentation demo toolbar."
 * ============================================================================
 */

import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import DemoToolbar from '@/components/DemoToolbar';
import BorrowBuddyLogo from '@/components/BorrowBuddyLogo';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'BorrowBuddy — Campus Borrowing & Renting Marketplace | IIIT-Naya Raipur',
  description:
    'Borrow, lend, or rent items securely across the IIIT-NR campus community. Calculators, chargers, books, lab components, cycles, and more.',
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC theme hydration script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var saved = localStorage.getItem('borrowbuddy-theme');
                var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased selection:bg-teal-600 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {/* Interactive Presentation Toolbar for Live Demonstrations */}
          <DemoToolbar />

          {/* Global Institutional Navbar */}
          <Navbar />

          {/* Main Dynamic Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>

          {/* Campus Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <BorrowBuddyLogo size="sm" />

                <div className="flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <a href="/explore" className="hover:text-teal-700 dark:hover:text-teal-400 transition">Browse Items</a>
                  <a href="/borrowings" className="hover:text-teal-700 dark:hover:text-teal-400 transition">My Borrowings</a>
                  <a href="/lent" className="hover:text-teal-700 dark:hover:text-teal-400 transition">Rent &amp; Lend</a>
                  <a href="/disputes" className="hover:text-teal-700 dark:hover:text-teal-400 transition">Disputes</a>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                <p>© 2026 BorrowBuddy. Student-to-Student Campus Marketplace for IIIT-NR.</p>
                <p>Hostel Raman &amp; Shabri Campus Network • Zero Lost Items Protocol</p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
