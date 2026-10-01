/**
 * ============================================================================
 * BORROWBUDDY AUTHENTICATION UTILITY (src/lib/auth.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Handles user authentication sessions using JSON Web Tokens (JWT) and secure
 * HTTP cookies. It generates tokens upon login, validates them on incoming
 * requests, and fetches the logged-in student's profile from the database.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Stateless Authentication: Web servers are stateless. When a student logs
 *    in, we issue an encrypted JWT stored in an HTTP-only cookie.
 * 2. Cryptographic Security: Tokens are digitally signed with `JWT_SECRET` so
 *    they cannot be forged or altered by malicious clients.
 * 3. Protected Sessions: The `getCurrentUser()` helper verifies the token on
 *    the server, checks if the account is active/suspended, and loads user data.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file handles student login sessions using JWT. Instead of
 * querying passwords constantly, we issue a secure signed cookie. The server
 * verifies this cookie on every request to know which student is logged in."
 * ============================================================================
 */

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

// Secret key used to digitally sign tokens (prevent tampering).
// In production, this should be stored securely in an environment variable (.env).
const JWT_SECRET = process.env.JWT_SECRET || 'iiitnr-campus-borrow-super-secret-key-2026';

// The cookie name where the user's login session is stored in their browser.
export const AUTH_COOKIE_NAME = 'campus_session';

/**
 * TokenPayload:
 * Defines the user information packed inside the encrypted JWT token.
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * signToken(payload):
 * Generates an encrypted JWT token string that expires in 7 days.
 * Called when a student successfully logs in.
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * verifyToken(token):
 * Decodes and verifies the signature of a token.
 * Returns the decoded payload if valid, or null if someone tampered with it or it expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * getCurrentUser():
 * Helper function used across server components and API routes.
 * 
 * FLOW:
 * 1. Reads the 'campus_session' cookie from the incoming request.
 * 2. Verifies the JWT token inside it.
 * 3. Fetches the student's fresh profile details from the SQLite database.
 * 4. Checks if the student was suspended by an admin.
 * 5. Returns the User object if authorized, or null if not logged in.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    // Query SQLite database through Prisma for this specific user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
        branch: true,
        year: true,
        avatarUrl: true,
        rating: true,
        reliabilityScore: true,
        role: true,
        isSuspended: true,
        createdAt: true,
      },
    });

    // If user doesn't exist or is suspended, treat them as logged out
    if (!user || user.isSuspended) return null;
    return user;
  } catch (error) {
    return null;
  }
}
