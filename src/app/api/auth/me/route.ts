/**
 * ============================================================================
 * CURRENT USER SESSION API (src/app/api/auth/me/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Returns the currently authenticated student's profile information, their unread
 * notification count, and the platform's current simulated time.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Client Hydration: When the browser loads the React Navbar or Dashboard,
 *    it calls `/api/auth/me` to determine who is logged in without exposing
 *    sensitive database credentials or password hashes.
 * 2. Real-time Unread Badge: Queries `prisma.notification.count({ where: { read: false } })`
 *    to display the red notification pill on the Navbar bell icon.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route is called by our frontend components (like the Navbar)
 * to check who is currently logged in, fetch their profile, and show their unread
 * notification counter."
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSimulatedNow } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Validates the cookie, retrieves user details & unread count, and returns JSON.
 * ----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    // Step 1: Validate session cookie and retrieve authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Step 2: Fetch number of unread alerts for this student
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    // Step 3: Fetch the current simulated campus time
    const simulatedNow = await getSimulatedNow();

    // Step 4: Return enriched user profile and system time
    return NextResponse.json({
      user: {
        ...user,
        unreadNotifications: unreadCount,
      },
      simulatedNow: simulatedNow.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}
