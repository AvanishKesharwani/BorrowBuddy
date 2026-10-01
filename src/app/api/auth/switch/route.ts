/**
 * ============================================================================
 * DEMO USER SWITCHER API ENDPOINT (src/app/api/auth/switch/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows instantaneous switching between demo campus personas (e.g. Arjun as
 * borrower, Priya as lender, Dr. S. K. Verma as campus administrator) without
 * needing to log out and re-type passwords.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Presentation Mode Convenience: Developed specifically for live project
 *    evaluations so students can quickly show both sides of a peer-to-peer
 *    transaction (e.g., switch to Priya to approve a request, then switch to
 *    Arjun to inspect the active loan).
 * 2. Instant Token Generation: Generates a new signed JWT for the selected
 *    user and immediately overwrites the browser's `campus_session` cookie.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route is our demo presentation switcher. It lets us seamlessly
 * swap between student and admin perspectives in one click from the demo toolbar
 * to showcase borrower and lender workflows side-by-side."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Looks up the selected persona by email or studentId, generates a new JWT,
 * and sets the session cookie.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Read requested student identifier or email
    const { studentIdOrEmail } = await req.json();

    // Step 2: Locate user record in SQLite
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: studentIdOrEmail },
          { studentId: studentIdOrEmail },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 3: Mint new signed JWT token for the target user
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Step 4: Return sanitized user profile
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl,
        rating: user.rating,
        reliabilityScore: user.reliabilityScore,
        role: user.role,
      },
    });

    // Step 5: Replace browser session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Switch failed' }, { status: 500 });
  }
}
