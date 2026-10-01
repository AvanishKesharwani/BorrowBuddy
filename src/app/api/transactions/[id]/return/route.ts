/**
 * ============================================================================
 * BORROWER RETURN INITIATION API (src/app/api/transactions/[id]/return/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows a student borrower to initiate the return process after physically
 * handing the item back to the owner:
 * 1. Checks that caller is the registered borrower.
 * 2. Updates Transaction status to `RETURN_PENDING`.
 * 3. Notifies the owner to inspect the physical condition of the item and confirm.
 * 4. Posts an automated notification in the transaction chat thread.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Two-Step Handshake Protocol: BorrowBuddy avoids fraud by preventing borrowers
 *    from unilaterally marking items as "RETURNED". Instead, it transitions to
 *    `RETURN_PENDING`, requiring the lender's final physical confirmation.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route handles the first half of our secure return protocol.
 * When the borrower hands the item back, they mark it 'Returned'. The status becomes
 * RETURN_PENDING until the owner verifies the item is undamaged and confirms receipt."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Moves status to RETURN_PENDING and requests lender verification.
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
      include: { item: true, owner: true, borrower: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 3: Authorization (only borrower can initiate return)
    if (tx.borrowerId !== user.id) {
      return NextResponse.json({ error: 'Only the borrower can mark an item as returned' }, { status: 403 });
    }

    if (tx.status !== 'ACTIVE' && tx.status !== 'OVERDUE') {
      return NextResponse.json({ error: `Cannot return item with status: ${tx.status}` }, { status: 400 });
    }

    // Step 4: Update status to RETURN_PENDING
    const updatedTx = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'RETURN_PENDING' },
    });

    // Step 5: Notify owner to physically verify and confirm return
    await prisma.notification.create({
      data: {
        userId: tx.ownerId,
        title: `Return Pending: ${tx.item.name}`,
        message: `${tx.borrower.name} has marked ${tx.item.name} as returned. Please check physical condition and click 'Confirm Return'.`,
        type: 'RETURN_PENDING',
        link: '/lent',
      },
    });

    // Step 6: Post automated chat message
    await prisma.message.create({
      data: {
        transactionId: tx.id,
        senderId: user.id,
        receiverId: tx.ownerId,
        content: `I have handed over/returned your ${tx.item.name}. Please confirm the return in BorrowBuddy.`,
      },
    });

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to mark return' }, { status: 500 });
  }
}
