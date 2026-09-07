import type { Metadata } from 'next';
import './globals.css';
import DemoToolbar from '@/components/DemoToolbar';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CampusBorrow — Student-to-Student Borrowing & Rental Platform | IIIT-Naya Raipur',
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
      <body className="flex flex-col min-h-screen bg-slate-50 antialiased selection:bg-blue-600 selection:text-white">
        {/* Sticky Demo Presentation Bar */}
        <DemoToolbar />

        {/* Global Institutional Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Campus Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                CB
              </div>
              <span className="font-semibold text-slate-800">
                CampusBorrow • International Institute of Information Technology, Naya Raipur (IIIT-NR)
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Hostel Ramanujan & Bose Campus Network</span>
              <span>•</span>
              <span>Student Initiative Prototype</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
