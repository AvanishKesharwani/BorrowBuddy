/**
 * ============================================================================
 * PEER RATINGS & REPUTATION CALCULATION API (src/app/api/ratings/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows students to submit 1-to-5 star peer reviews and written feedback after
 * completing an item return:
 * 1. Validates that only participants (owner or borrower) can rate the transaction.
 * 2. Prevents double-rating on the same transaction.
 * 3. Saves the review record in the `Rating` table.
 * 4. Automatically recalculates the reviewee's cumulative average rating (e.g. 4.9 ⭐)
 *    and updates their `User` record in SQLite.
 * 5. Sends a congratulatory notification to the reviewed student.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Reputation Recomputation: Mathematically aggregates all historical ratings
 *    (`sum / count`) and saves the rounded score directly on the User model.
 * 2. Fraud Prevention: Enforces a strict one-review-per-participant constraint.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route processes peer reviews. After a return is finalized,
 * students rate each other from 1 to 5 stars. This route saves the review,
 * dynamically recalculates the student's average campus rating, and updates their profile."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Submits rating, recalculates user average, and dispatches notification.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Validate rating parameters
    const { transactionId, rating, comment, criteria } = await req.json();

    if (!transactionId || !rating) {
      return NextResponse.json({ error: 'Transaction ID and Rating are required' }, { status: 400 });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating)));

    // Step 3: Fetch transaction
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { item: true, owner: true, borrower: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 4: Verify caller was involved in this transaction
    if (tx.ownerId !== user.id && tx.borrowerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to review this transaction' }, { status: 403 });
    }

    const revieweeId = tx.ownerId === user.id ? tx.borrowerId : tx.ownerId;

    // Step 5: Prevent duplicate reviews
    const existing = await prisma.rating.findFirst({
      where: {
        transactionId: tx.id,
        reviewerId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted a rating for this transaction' }, { status: 400 });
    }

    // Step 6: Insert review into Rating table
    const createdRating = await prisma.rating.create({
      data: {
        transactionId: tx.id,
        reviewerId: user.id,
        revieweeId,
        rating: numericRating,
        comment: comment?.trim() || 'No additional comment provided.',
        criteria: criteria || '',
      },
    });

    // Step 7: Recalculate reviewee cumulative average rating
    const allRatings = await prisma.rating.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / allRatings.length).toFixed(1));

    await prisma.user.update({
      where: { id: revieweeId },
      data: { rating: avg },
    });

    // Step 8: Notify reviewee
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        title: `New Rating Received: ${numericRating} ⭐`,
        message: `${user.name} rated your transaction on ${tx.item.name}: "${comment?.trim() || 'Good interaction'}"`,
        type: 'RATING',
        link: `/profile/${revieweeId}`,
      },
    });

    return NextResponse.json({ success: true, rating: createdRating, newAverage: avg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit rating' }, { status: 500 });
  }
}
