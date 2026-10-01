/**
 * ============================================================================
 * LENDER RETURN CONFIRMATION API (src/app/api/transactions/[id]/confirm-return/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Finalizes the borrowing transaction when the owner confirms they have physically
 * received the item back:
 * 1. Checks that caller is the owner.
 * 2. Runs an atomic transaction to:
 *    - Update Transaction status to `RETURNED` with `actualReturnDate`.
 *    - Reset Item availability back to `AVAILABLE` for future borrowers.
 *    - Notify the borrower that the loan is complete and invite them to leave a review.
 *    - Notify the lender with a confirmation record.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Handshake Closure: Completes the 2-step verification handshake.
 * 2. Unlocks Peer Rating: Once status is `RETURNED`, the UI displays the 5-star
 *    rating modal for both parties to review each other.
 * 3. Item Relisting: Automatically returns the item to the public marketplace.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route finalizes the return. Once the lender confirms physical
 * handover, the transaction status becomes RETURNED, the item becomes AVAILABLE again
 * in the catalog, and both students can leave ratings."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Executes atomic return finalization, marks item AVAILABLE, and alerts users.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Fetch transaction details
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true, borrower: true, owner: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 3: Authorization (only item owner can confirm receipt)
    if (tx.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the item owner can confirm receipt and return' }, { status: 403 });
    }

    if (tx.status !== 'RETURN_PENDING' && tx.status !== 'ACTIVE' && tx.status !== 'OVERDUE') {
      return NextResponse.json({ error: `Cannot confirm return for transaction in ${tx.status} state` }, { status: 400 });
    }

    const simulatedNow = await getSimulatedNow();

    // Step 4: Atomic update across transaction and item tables
    const [updatedTx] = await prisma.$transaction([
      // 1. Mark transaction as RETURNED
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'RETURNED',
          actualReturnDate: simulatedNow,
        },
      }),
      // 2. Return item to AVAILABLE status in campus catalog
      prisma.item.update({
        where: { id: tx.itemId },
        data: { availability: 'AVAILABLE' },
      }),
      // 3. Notify borrower with invitation to submit a peer rating
      prisma.notification.create({
        data: {
          userId: tx.borrowerId,
          title: `Return Confirmed: ${tx.item.name}`,
          message: `${tx.owner.name} has confirmed the return of ${tx.item.name}. Thank you for returning it safely! You can now rate your experience.`,
          type: 'RETURNED',
          link: '/borrowings',
        },
      }),
      // 4. Notify owner
      prisma.notification.create({
        data: {
          userId: tx.ownerId,
          title: `Return Finalized: ${tx.item.name}`,
          message: `Transaction closed for ${tx.item.name}. The item is now listed as Available again.`,
          type: 'RETURNED',
          link: '/lent',
        },
      }),
    ]);

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to confirm return' }, { status: 500 });
  }
}
