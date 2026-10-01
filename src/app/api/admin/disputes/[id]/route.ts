/**
 * ============================================================================
 * ADMIN DISPUTE ARBITRATION API (src/app/api/admin/disputes/[id]/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows Campus Administrators to arbitrate and resolve student disputes:
 * 1. `GET`: Loads full dispute audit logs, including transaction details, item
 *    history, and complete chat transcripts between the students.
 * 2. `PATCH`: Admin enters official findings and closes the case. Updates the
 *    dispute status to `RESOLVED`, sets the transaction outcome (`RETURNED` or
 *    `CANCELLED`), makes the item `AVAILABLE` again, and notifies both students.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Administrative Oversight: Complete audit transparency by loading all private
 *    chat messages associated with the disputed transaction.
 * 2. Multi-Table Atomic Closure: Uses `prisma.$transaction` to guarantee that
 *    the dispute status, transaction status, item availability, and student notifications
 *    are updated simultaneously.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers our campus dispute resolution system. Faculty admins
 * can view the full conversation history between both students, write official
 * resolution findings, and close the case."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Loads detailed dispute dossier with transaction history and chat transcript.
 * ----------------------------------------------------------------------------
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Fetch dispute with full audit trail
    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        raisedBy: true,
        transaction: {
          include: {
            item: true,
            owner: true,
            borrower: true,
            messages: {
              include: { sender: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ dispute });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * ----------------------------------------------------------------------------
 * PATCH Handler:
 * Executes admin resolution: logs findings, unfreezes item, and alerts students.
 * ----------------------------------------------------------------------------
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Read resolution decision and notes
    const { resolutionNotes, action } = await req.json(); // action: 'RESOLVE_RETURNED' | 'RESOLVE_CANCELLED'

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: { transaction: { include: { item: true } } },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const simulatedNow = await getSimulatedNow();

    let newTxStatus = 'RETURNED';
    let itemAvailability = 'AVAILABLE';

    if (action === 'RESOLVE_CANCELLED') {
      newTxStatus = 'CANCELLED';
      itemAvailability = 'AVAILABLE';
    }

    // Step 3: Atomic database transaction closing dispute and updating states
    await prisma.$transaction([
      prisma.dispute.update({
        where: { id: params.id },
        data: {
          status: 'RESOLVED',
          resolutionNotes: resolutionNotes || 'Resolved by campus administrator after reviewing logs.',
          resolvedAt: simulatedNow,
        },
      }),
      prisma.transaction.update({
        where: { id: dispute.transactionId },
        data: {
          status: newTxStatus,
          actualReturnDate: simulatedNow,
        },
      }),
      prisma.item.update({
        where: { id: dispute.transaction.itemId },
        data: { availability: itemAvailability },
      }),
      // Notify the owner of the outcome
      prisma.notification.create({
        data: {
          userId: dispute.transaction.ownerId,
          title: `Dispute Resolved: ${dispute.transaction.item.name}`,
          message: `Campus Administrator resolved dispute. Resolution: ${resolutionNotes || 'Case closed.'}`,
          type: 'DISPUTE',
          link: '/lent',
        },
      }),
      // Notify the borrower of the outcome
      prisma.notification.create({
        data: {
          userId: dispute.transaction.borrowerId,
          title: `Dispute Resolved: ${dispute.transaction.item.name}`,
          message: `Campus Administrator resolved dispute. Resolution: ${resolutionNotes || 'Case closed.'}`,
          type: 'DISPUTE',
          link: '/borrowings',
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Dispute resolved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
