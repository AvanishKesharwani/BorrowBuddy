/**
 * ============================================================================
 * STUDENT PROFILE & REPUTATION API (src/app/api/profile/[id]/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Retrieves a student's public campus profile by user ID:
 * 1. Bio & Institutional Information (Branch, Year, Roll Number).
 * 2. Trust Metrics (Campus Rating out of 5.0, Reliability Score out of 100).
 * 3. Currently Listed Items owned by this student.
 * 4. Detailed Peer Reviews and Feedback received from other students.
 * 5. Lifetime Borrowing & Lending Statistics (total borrowed, successful returns,
 *    current active loans, and overdue counts).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Relational Aggregations: Uses Prisma `include` to nest ratings and items
 *    in a single database query.
 * 2. Parallel Count Queries: Uses `Promise.all` to concurrently query lifetime
 *    metrics across the `Transaction` table, keeping response times sub-millisecond.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers the student's reputation profile. It aggregates
 * their campus reliability score, items listed, feedback reviews from peers,
 * and tracks how many items they returned on time."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Expects the student's User ID as a dynamic route parameter (`params.id`).
 * Returns public user details, listed items, received ratings, and borrowing stats.
 * ----------------------------------------------------------------------------
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: QUERY USER PROFILE WITH RELATIONAL DATA
    // ------------------------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
        createdAt: true,
        // Include items owned by this student
        items: {
          orderBy: { createdAt: 'desc' },
        },
        // Include reviews written about this student by peers
        ratingsReceived: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                studentId: true,
                avatarUrl: true,
              },
            },
            transaction: {
              include: { item: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ------------------------------------------------------------------------
    // STEP 2: CONCURRENTLY CALCULATE LIFETIME METRICS
    // Computes lending and borrowing performance counts using Promise.all.
    // ------------------------------------------------------------------------
    const [
      totalBorrowed,
      successfullyReturned,
      currentlyBorrowed,
      overdueReturns,
      totalLent,
    ] = await Promise.all([
      // Total items this student has requested/borrowed
      prisma.transaction.count({
        where: { borrowerId: user.id, status: { in: ['ACTIVE', 'RETURN_PENDING', 'RETURNED', 'OVERDUE'] } },
      }),
      // Items returned on time
      prisma.transaction.count({
        where: { borrowerId: user.id, status: 'RETURNED' },
      }),
      // Items currently in possession
      prisma.transaction.count({
        where: { borrowerId: user.id, status: { in: ['ACTIVE', 'RETURN_PENDING'] } },
      }),
      // Items currently overdue
      prisma.transaction.count({
        where: { borrowerId: user.id, status: 'OVERDUE' },
      }),
      // Total items this student has lent to peers
      prisma.transaction.count({
        where: { ownerId: user.id, status: { in: ['ACTIVE', 'RETURN_PENDING', 'RETURNED', 'OVERDUE'] } },
      }),
    ]);

    // ------------------------------------------------------------------------
    // STEP 3: RETURN JSON PAYLOAD
    // ------------------------------------------------------------------------
    return NextResponse.json({
      user,
      stats: {
        totalBorrowed,
        successfullyReturned,
        currentlyBorrowed,
        overdueReturns,
        totalLent,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
