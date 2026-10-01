/**
 * ============================================================================
 * LOGOUT API ENDPOINT (src/app/api/auth/logout/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Safely terminates a student's active login session by clearing the authentication
 * cookie from their web browser.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Cookie Destruction: Sets the cookie `value: ''` with `maxAge: 0`. The browser
 *    immediately deletes the cookie from its local storage.
 * 2. HTTP-only Protection: Enforces `httpOnly: true` to prevent any client script
 *    interference during session termination.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route logs the user out. It instructs the browser to immediately
 * expire and erase the session cookie (`campus_session`), ending the student's authenticated session."
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Clears the session cookie and returns a JSON logout confirmation.
 * ----------------------------------------------------------------------------
 */
export async function POST() {
  // Step 1: Create success response payload
  const response = NextResponse.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });

  // Step 2: Overwrite session cookie with maxAge: 0 (immediate browser deletion)
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
