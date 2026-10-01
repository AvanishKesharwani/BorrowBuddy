/**
 * ============================================================================
 * REJECT BORROW REQUEST API (src/app/api/transactions/[id]/reject/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows an item owner to decline an incoming borrow request:
 * 1. Checks that the caller is indeed the owner.
 * 2. Updates the transaction status to `REJECTED`.
 * 3. Sends a polite notification to the requesting student.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Non-destructive State Transition: Retains the transaction history record
 *    with status `REJECTED` rather than deleting it, allowing auditability.
 * 2. Item Remains Available: The item's availability remains `AVAILABLE` for
 *    other campus peers to request.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route runs when a student declines a borrow request. It marks
 * the transaction as REJECTED, keeps the item listed as AVAILABLE for other students,
 * and notifies the requester."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Rejects a requested transaction and alerts the borrower.
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
      include: { item: true, owner: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 3: Authorization check (only owner can reject)
    if (tx.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the item owner can reject this request' }, { status: 403 });
    }

    if (tx.status !== 'REQUESTED') {
      return NextResponse.json({ error: `Cannot reject transaction with status: ${tx.status}` }, { status: 400 });
    }

    // Step 4: Update status to REJECTED
    const updatedTx = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'REJECTED' },
    });

    // Step 5: Notify the borrower
    await prisma.notification.create({
      data: {
        userId: tx.borrowerId,
        title: `Request Declined: ${tx.item.name}`,
        message: `${tx.owner.name} was unable to accept your borrow request for ${tx.item.name} at this time.`,
        type: 'REJECTED',
        link: '/borrowings',
      },
    });

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reject request' }, { status: 500 });
  }
}
