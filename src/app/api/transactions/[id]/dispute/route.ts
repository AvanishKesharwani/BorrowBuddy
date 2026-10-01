/**
 * ============================================================================
 * RAISE DISPUTE API (src/app/api/transactions/[id]/dispute/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows either participant (borrower or lender) to report a critical issue
 * (e.g. item returned damaged, missing parts, or unreturned item):
 * 1. Verifies that the caller is a participant in the transaction.
 * 2. Creates a formal `Dispute` ticket in the database.
 * 3. Freezes the Transaction status by marking it `DISPUTED`.
 * 4. Alerts both the peer student and all Campus Administrators for investigation.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Conflict Escalation: Freezes the normal return/review workflow so penalties
 *    or bad ratings can be audited by college authorities.
 * 2. Administrative Broadcast: Queries all users where `role: 'ADMIN'` and delivers
 *    an urgent notification linking to the Admin Control Panel.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route handles student conflict resolution. If an item is damaged
 * or stolen, either party can raise a dispute. The loan freezes and campus faculty
 * administrators are immediately notified on their dashboard to investigate."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Logs a dispute ticket, flags the transaction, and dispatches admin notifications.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Read reason from request body
    const { reason } = await req.json();
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Dispute reason is required' }, { status: 400 });
    }

    // Step 3: Fetch transaction details
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true, owner: true, borrower: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 4: Authorization (only borrower or owner can dispute)
    if (tx.ownerId !== user.id && tx.borrowerId !== user.id) {
      return NextResponse.json({ error: 'Only participants in this transaction can raise a dispute' }, { status: 403 });
    }

    const otherUserId = tx.ownerId === user.id ? tx.borrowerId : tx.ownerId;

    // Step 5: Atomic dispute creation and status update
    const [dispute, updatedTx] = await prisma.$transaction([
      prisma.dispute.create({
        data: {
          transactionId: tx.id,
          raisedById: user.id,
          reason: reason.trim(),
          status: 'OPEN',
        },
      }),
      prisma.transaction.update({
        where: { id: tx.id },
        data: { status: 'DISPUTED' },
      }),
      // Notify the other student involved
      prisma.notification.create({
        data: {
          userId: otherUserId,
          title: `Dispute Raised: ${tx.item.name}`,
          message: `${user.name} has opened a dispute regarding ${tx.item.name}: "${reason.trim()}". Campus Admin has been notified for review.`,
          type: 'DISPUTE',
          link: '/disputes',
        },
      }),
    ]);

    // Step 6: Dispatch notification to campus faculty administrators
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const adm of admins) {
      await prisma.notification.create({
        data: {
          userId: adm.id,
          title: `Action Required: New Dispute on ${tx.item.name}`,
          message: `Dispute filed between ${tx.owner.name} and ${tx.borrower.name}. Reason: ${reason.trim()}`,
          type: 'DISPUTE',
          link: '/admin',
        },
      });
    }

    return NextResponse.json({ success: true, dispute, transaction: updatedTx });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to raise dispute' }, { status: 500 });
  }
}
