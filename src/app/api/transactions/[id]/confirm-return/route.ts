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

    // Only owner can confirm receipt
    if (tx.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the item owner can confirm receipt and return' }, { status: 403 });
    }

    if (tx.status !== 'RETURN_PENDING' && tx.status !== 'ACTIVE' && tx.status !== 'OVERDUE') {
      return NextResponse.json({ error: `Cannot confirm return for transaction in ${tx.status} state` }, { status: 400 });
    }

    const simulatedNow = await getSimulatedNow();

    const [updatedTx] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'RETURNED',
          actualReturnDate: simulatedNow,
        },
      }),
      prisma.item.update({
        where: { id: tx.itemId },
        data: { availability: 'AVAILABLE' },
      }),
      // Notification to borrower
      prisma.notification.create({
        data: {
          userId: tx.borrowerId,
          title: `Return Confirmed: ${tx.item.name}`,
          message: `${tx.owner.name} has confirmed the return of ${tx.item.name}. Thank you for returning it safely! You can now rate your experience.`,
          type: 'RETURNED',
          link: '/borrowings',
        },
      }),
      // Notification to owner
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
