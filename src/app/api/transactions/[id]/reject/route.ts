import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true, owner: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.ownerId !== user.id) {
      return NextResponse.json({ error: 'Only the item owner can reject this request' }, { status: 403 });
    }

    if (tx.status !== 'REQUESTED') {
      return NextResponse.json({ error: `Cannot reject transaction with status: ${tx.status}` }, { status: 400 });
    }

    const updatedTx = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'REJECTED' },
    });

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
