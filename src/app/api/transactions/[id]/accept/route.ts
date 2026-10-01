/**
 * ============================================================================
 * ACCEPT BORROW REQUEST API (src/app/api/transactions/[id]/accept/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Handles the lender's action to approve an incoming borrow request:
 * 1. Checks that only the owner of the item can accept.
 * 2. Runs an atomic database transaction (`prisma.$transaction`) to:
 *    - Change Transaction status from `REQUESTED` to `ACTIVE`.
 *    - Change Item availability from `AVAILABLE` to `BORROWED`.
 *    - Send an instant in-app notification to the borrower.
 *    - Post an automated confirmation chat message in the transaction thread.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. ACID Transactions (`prisma.$transaction`): Bundles four database mutations
 *    into an all-or-nothing atomic unit. If any step fails, the entire change rolls
 *    back to keep the database consistent.
 * 2. Virtual Clock Synchronization: Sets `startDate` and `approvalDate` using
 *    `getSimulatedNow()` so the simulation engine remains accurate.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route runs when a student clicks 'Accept' on an incoming loan
 * request. It uses an atomic Prisma transaction to set the loan to ACTIVE, mark
 * the item as BORROWED, and notify the borrower with pickup details."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Authorizes the owner, approves the borrow request, and notifies the borrower.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: VERIFY AUTHENTICATED USER
    // ------------------------------------------------------------------------
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ------------------------------------------------------------------------
    // STEP 2: FETCH TRANSACTION RECORD
    // ------------------------------------------------------------------------
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true, borrower: true, owner: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // ------------------------------------------------------------------------
    // STEP 3: AUTHORIZATION & STATUS VALIDATION
    // ------------------------------------------------------------------------
    if (tx.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the item owner can accept this request' }, { status: 403 });
    }

    if (tx.status !== 'REQUESTED') {
      return NextResponse.json({ error: `Cannot accept transaction with status: ${tx.status}` }, { status: 400 });
    }

    const simulatedNow = await getSimulatedNow();

    // ------------------------------------------------------------------------
    // STEP 4: ATOMIC DATABASE TRANSACTION
    // Executes status update, item availability change, alert, and chat message.
    // ------------------------------------------------------------------------
    const [updatedTx] = await prisma.$transaction([
      // 1. Mark transaction as ACTIVE
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'ACTIVE',
          approvalDate: simulatedNow,
          startDate: simulatedNow,
        },
      }),
      // 2. Mark item as BORROWED so other students cannot request it
      prisma.item.update({
        where: { id: tx.itemId },
        data: { availability: 'BORROWED' },
      }),
      // 3. Dispatch in-app notification to the borrower
      prisma.notification.create({
        data: {
          userId: tx.borrowerId,
          title: `Request Accepted: ${tx.item.name}!`,
          message: `${tx.owner.name} accepted your request to borrow ${tx.item.name}. Due on ${new Date(tx.deadline).toLocaleDateString()}. Coordinate pickup now!`,
          type: 'ACCEPTED',
          link: '/borrowings',
        },
      }),
      // 4. Send initial greeting in the transaction chat
      prisma.message.create({
        data: {
          transactionId: tx.id,
          senderId: user.id,
          receiverId: tx.borrowerId,
          content: `Hi ${tx.borrower.name}! I have accepted your borrow request. You can collect it from ${tx.item.campusLocation}.`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to accept request' }, { status: 500 });
  }
}
