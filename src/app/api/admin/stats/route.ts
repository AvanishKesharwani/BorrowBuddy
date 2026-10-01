/**
 * ============================================================================
 * ADMIN CAMPUS METRICS & ANALYTICS API (src/app/api/admin/stats/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Computes high-level campus-wide metrics for the Admin Dashboard:
 * 1. Total registered students and campus items listed.
 * 2. Active, completed, and overdue loan counters.
 * 3. Open dispute count.
 * 4. Sum of simulated late penalties accumulated across campus.
 * 5. Campus-wide average student rating (e.g. 4.8 ⭐) and average reliability score (e.g. 96.5%).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Parallel Aggregations: Runs 8 database queries concurrently using `Promise.all`,
 *    including Prisma SQL aggregate functions like `_sum: { penalty: true }`.
 * 2. Automatic Freshness: Executes `runOverdueAndReminderSweep()` prior to tallying,
 *    guaranteeing up-to-the-minute statistics.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers the KPI summary cards on the Admin Dashboard.
 * It calculates campus-wide statistics: total active loans, overdue items, sum of late
 * penalties, open disputes, and the average student reliability score across IIIT-NR."
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { runOverdueAndReminderSweep } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Aggregates campus metrics and returns statistical KPI payload for administrators.
 * ----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Refresh overdue calculations
    await runOverdueAndReminderSweep();

    // Step 3: Run concurrent aggregation queries across SQLite tables
    const [
      totalStudents,
      totalItems,
      activeBorrowings,
      completedReturns,
      overdueTransactions,
      disputedTransactions,
      penaltiesSum,
      allUsers,
    ] = await Promise.all([
      // Count total registered students
      prisma.user.count({ where: { role: 'STUDENT' } }),
      // Count total equipment listings
      prisma.item.count(),
      // Count active loans
      prisma.transaction.count({ where: { status: 'ACTIVE' } }),
      // Count successfully returned loans
      prisma.transaction.count({ where: { status: 'RETURNED' } }),
      // Count overdue loans
      prisma.transaction.count({ where: { status: 'OVERDUE' } }),
      // Count open dispute cases
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      // Calculate total accumulated late penalties (₹)
      prisma.transaction.aggregate({
        _sum: { penalty: true },
      }),
      // Query ratings and reliability scores to calculate platform averages
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { rating: true, reliabilityScore: true },
      }),
    ]);

    // Step 4: Calculate campus average rating and reliability score
    const avgRating =
      allUsers.length > 0
        ? Number((allUsers.reduce((acc, u) => acc + u.rating, 0) / allUsers.length).toFixed(1))
        : 5.0;

    const avgReliability =
      allUsers.length > 0
        ? Number((allUsers.reduce((acc, u) => acc + u.reliabilityScore, 0) / allUsers.length).toFixed(1))
        : 100.0;

    // Step 5: Return comprehensive KPI payload
    return NextResponse.json({
      totalStudents,
      totalItems,
      activeBorrowings,
      completedReturns,
      overdueTransactions,
      disputedTransactions,
      totalSimulatedPenalties: penaltiesSum._sum.penalty || 0,
      averageStudentRating: avgRating,
      averageReliability: avgReliability,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
