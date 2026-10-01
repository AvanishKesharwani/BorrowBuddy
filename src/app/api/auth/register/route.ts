/**
 * ============================================================================
 * STUDENT REGISTRATION API ENDPOINT (src/app/api/auth/register/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Processes student sign-up requests. Validates institutional email domains
 * (`@iiitnr.edu.in`), checks for duplicate Student IDs, hashes passwords securely
 * with `bcrypt`, assigns default perfect trust scores (100.0 reliability, 5.0 rating),
 * generates an avatar, creates an onboarding welcome notification, and sets the login cookie.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Domain-Restricted Registration: Enforces security by restricting registrations
 *    to verified IIIT-NR institutional email addresses.
 * 2. Password Security: Uses `bcrypt.hash(password, 10)` to prevent plain text
 *    passwords from ever touching SQLite.
 * 3. Atomic Session Setup: Automatically logs the student in upon successful
 *    registration by generating a JWT token and returning an HTTP-only cookie.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route registers new students. It enforces our campus policy:
 * only students with institutional `@iiitnr.edu.in` emails can join. Passwords
 * are securely hashed with bcrypt, and every new student starts with a 100%
 * reliability score."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Parses form inputs, validates campus domain, creates user, and signs JWT.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: PARSE AND VALIDATE INPUT FIELDS
    // ------------------------------------------------------------------------
    const { name, studentId, email, password, branch, year } = await req.json();

    if (!name || !studentId || !email || !password || !branch || !year) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = studentId.trim().toUpperCase();

    // ------------------------------------------------------------------------
    // STEP 2: INSTITUTIONAL DOMAIN RESTRICTION CHECK
    // Restricts registration to official campus email accounts.
    // ------------------------------------------------------------------------
    if (!cleanEmail.endsWith('@iiitnr.edu.in') && !cleanEmail.endsWith('iiitnr.ac.in')) {
      return NextResponse.json(
        { error: 'Registration is restricted to IIIT-NR institutional email domain (@iiitnr.edu.in)' },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------------
    // STEP 3: CHECK FOR DUPLICATE ACCOUNTS
    // Ensures both email and Student ID are unique across campus.
    // ------------------------------------------------------------------------
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { studentId: cleanStudentId }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A student with this email or Student ID already exists' }, { status: 409 });
    }

    // ------------------------------------------------------------------------
    // STEP 4: HASH PASSWORD USING BCRYPT (SALT ROUNDS = 10)
    // ------------------------------------------------------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    // ------------------------------------------------------------------------
    // STEP 5: INSERT NEW STUDENT INTO SQLITE DATABASE
    // Initializes with 5.0 rating and 100.0 reliability score.
    // ------------------------------------------------------------------------
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        studentId: cleanStudentId,
        email: cleanEmail,
        passwordHash,
        branch,
        year,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanStudentId}`,
        rating: 5.0,
        reliabilityScore: 100.0,
        role: 'STUDENT',
      },
    });

    // ------------------------------------------------------------------------
    // STEP 6: DISPATCH SYSTEM ONBOARDING NOTIFICATION
    // ------------------------------------------------------------------------
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to BorrowBuddy!',
        message: 'Your institutional IIIT-NR student profile is active. You can now borrow or list campus items on BorrowBuddy.',
        type: 'SYSTEM',
      },
    });

    // ------------------------------------------------------------------------
    // STEP 7: ISSUE JWT SESSION COOKIE & RETURN RESPONSE
    // ------------------------------------------------------------------------
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
