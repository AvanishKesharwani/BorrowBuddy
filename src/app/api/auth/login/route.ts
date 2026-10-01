/**
 * ============================================================================
 * INSTITUTIONAL LOGIN API ENDPOINT (src/app/api/auth/login/route.ts)
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * Handles student login attempts when submitting the login form.
 * 
 * HOW SECURE AUTHENTICATION WORKS:
 * 1. Plain passwords are NEVER stored in a database.
 * 2. In SQLite, we only store a "hash" created by the `bcrypt` algorithm.
 * 3. When logging in, `bcrypt.compare(enteredPassword, storedHash)` verifies
 *    if the password matches without decrypting anything.
 * 4. If valid, we create a signed JWT token and attach it as an HTTP-only cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: PARSE CREDENTIALS (Email or Student ID + Password)
    // ------------------------------------------------------------------------
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please provide email or Student ID and password' }, { status: 400 });
    }

    // ------------------------------------------------------------------------
    // STEP 2: LOOKUP USER IN SQLITE VIA PRISMA
    // Checks if the identifier matches either the student's email or studentId.
    // ------------------------------------------------------------------------
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim().toLowerCase() },
          { studentId: identifier.trim().toUpperCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    // ------------------------------------------------------------------------
    // STEP 3: CHECK ACCOUNT STATUS
    // Suspended users are locked out from logging in.
    // ------------------------------------------------------------------------
    if (user.isSuspended) {
      return NextResponse.json({ error: 'Your account has been suspended by campus administration.' }, { status: 403 });
    }

    // ------------------------------------------------------------------------
    // STEP 4: VERIFY PASSWORD HASH USING BCRYPT
    // Compares the typed password against the salted one-way hash in dev.db.
    // ------------------------------------------------------------------------
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // ------------------------------------------------------------------------
    // STEP 5: GENERATE SIGNED JWT TOKEN
    // Encrypts user identity into a compact, cryptographically tamper-proof token.
    // ------------------------------------------------------------------------
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ------------------------------------------------------------------------
    // STEP 6: CONSTRUCT RESPONSE OBJECT
    // Return sanitized student profile details (never expose passwordHash!).
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // STEP 7: ATTACH SECURE HTTP-ONLY COOKIE
    // `httpOnly: true` prevents malicious browser scripts (XSS attacks) from
    // stealing the session token.
    // ------------------------------------------------------------------------
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
