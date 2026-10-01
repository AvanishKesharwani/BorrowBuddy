/**
 * ============================================================================
 * PROFILE REDIRECT ROUTE (src/app/profile/page.tsx)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Acts as a smart navigation router for the `/profile` path:
 * 1. Checks the active student session via `/api/auth/me`.
 * 2. If authenticated, seamlessly redirects to `/profile/[id]` where `[id]`
 *    is their personal unique user ID.
 * 3. If unauthenticated, redirects to `/login`.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Dynamic Routing Gateway: Simplifies navigation links in menus and buttons
 *    (e.g. `<Link href="/profile">My Profile</Link>`) without requiring the caller
 *    to already know the student's internal UUID.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route is our smart profile gateway. When a student clicks 'My Profile'
 * in the navbar, this component detects their ID and forwards them directly to their
 * detailed campus reputation dossier."
 * ============================================================================
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.id) {
          router.replace(`/profile/${data.user.id}`);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  return (
    <div className="py-24 text-center">
      <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-xs text-slate-500">Redirecting to your student profile...</p>
    </div>
  );
}
