/**
 * ============================================================================
 * USER TRANSACTIONS LIST API (src/app/api/transactions/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Retrieves borrowing and lending transaction records for the logged-in student.
 * Supports filtering by `type=borrowed` (items the student is borrowing) or
 * `type=lent` (items the student is lending out to others).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Background Sweep Trigger: Calls `runOverdueAndReminderSweep()` on every
 *    fetch so transaction penalties and overdue days are recalculated in real time.
 * 2. Role-Based Query Filtering: Filters by `borrowerId` or `ownerId` depending
 *    on the active page tab (My Borrowings vs Lent Items).
 * 3. Deep Relational Nesting: Pre-loads the item, peer user, ratings, and disputes
 *    to provide the frontend with all necessary data in a single network request.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers the 'My Borrowings' and 'Lent Items' screens.
 * Before returning the list, it automatically checks if any loans have crossed
 * their deadlines and recalculates overdue penalties."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { runOverdueAndReminderSweep } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Executes overdue check, reads query filter, and fetches user's transactions.
 * ----------------------------------------------------------------------------
 */
export async function GET(req: NextRequest) {
  try {
    // Step 1: Verify authenticated student session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Trigger overdue and penalty sweep to ensure data freshness
    await runOverdueAndReminderSweep();

    // Step 3: Parse filtering parameter ('borrowed', 'lent', or 'all')
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    const where: any = {};
    if (type === 'borrowed') {
      where.borrowerId = user.id;
    } else if (type === 'lent') {
      where.ownerId = user.id;
    } else {
      where.OR = [{ borrowerId: user.id }, { ownerId: user.id }];
    }

    // Step 4: Query transactions with related items and peer profiles
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        item: true,
        owner: {
          select: {
            id: true,
            studentId: true,
            name: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
          },
        },
        borrower: {
          select: {
            id: true,
            studentId: true,
            name: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
          },
        },
        ratings: true,
        disputes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
