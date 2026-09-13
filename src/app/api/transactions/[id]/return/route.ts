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
      include: { item: true, owner: true, borrower: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Only borrower can initiate return
    if (tx.borrowerId !== user.id) {
      return NextResponse.json({ error: 'Only the borrower can mark an item as returned' }, { status: 403 });
    }

    if (tx.status !== 'ACTIVE' && tx.status !== 'OVERDUE') {
      return NextResponse.json({ error: `Cannot return item with status: ${tx.status}` }, { status: 400 });
    }

    const updatedTx = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: 'RETURN_PENDING' },
    });

    // Notify owner to physically verify and confirm return
    await prisma.notification.create({
      data: {
        userId: tx.ownerId,
        title: `Return Pending: ${tx.item.name}`,
        message: `${tx.borrower.name} has marked ${tx.item.name} as returned. Please check physical condition and click 'Confirm Return'.`,
        type: 'RETURN_PENDING',
        link: '/lent',
      },
    });

    // Add chat message
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
