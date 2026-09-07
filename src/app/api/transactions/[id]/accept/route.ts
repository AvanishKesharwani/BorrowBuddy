import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true, borrower: true, owner: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Authorization: Only owner can accept
    if (tx.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the item owner can accept this request' }, { status: 403 });
    }

    if (tx.status !== 'REQUESTED') {
      return NextResponse.json({ error: `Cannot accept transaction with status: ${tx.status}` }, { status: 400 });
    }

    const simulatedNow = await getSimulatedNow();

    // Update transaction to ACTIVE and item to BORROWED
    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'ACTIVE',
          approvalDate: simulatedNow,
          startDate: simulatedNow,
        },
      }),
      prisma.item.update({
        where: { id: tx.itemId },
        data: { availability: 'BORROWED' },
      }),
      // Notify borrower
      prisma.notification.create({
        data: {
          userId: tx.borrowerId,
          title: `Request Accepted: ${tx.item.name}!`,
          message: `${tx.owner.name} accepted your request to borrow ${tx.item.name}. Due on ${new Date(tx.deadline).toLocaleDateString()}. Coordinate pickup now!`,
          type: 'ACCEPTED',
          link: '/borrowings',
        },
      }),
      // Add chat message
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
