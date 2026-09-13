import type { Metadata } from 'next';
import './globals.css';
import DemoToolbar from '@/components/DemoToolbar';
import Navbar from '@/components/Navbar';
import BorrowBuddyLogo from '@/components/BorrowBuddyLogo';

export const metadata: Metadata = {
  title: 'BorrowBuddy — Campus Borrowing & Renting Marketplace | IIIT-Naya Raipur',
  description:
    'Borrow, lend, or rent items securely across the IIIT-NR campus community. Calculators, chargers, books, lab components, cycles, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50/60 antialiased selection:bg-teal-600 selection:text-white">
        {/* Sticky Demo Presentation Bar */}
        <DemoToolbar />

        {/* Global Institutional Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Campus Footer (matches footer block in mockup) */}
        <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <BorrowBuddyLogo size="sm" />

              <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
                <a href="/explore" className="hover:text-teal-700 transition">Browse Items</a>
                <a href="/borrowings" className="hover:text-teal-700 transition">My Borrowings</a>
                <a href="/lent" className="hover:text-teal-700 transition">Rent &amp; Lend</a>
                <a href="/disputes" className="hover:text-teal-700 transition">Disputes</a>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <p>© 2026 BorrowBuddy. Student-to-Student Campus Marketplace for IIIT-NR.</p>
              <p>Hostel Raman &amp; Shabri Campus Network • Zero Lost Items Protocol</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
