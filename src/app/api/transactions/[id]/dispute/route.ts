import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { reason } = await req.json();
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Dispute reason is required' }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true, owner: true, borrower: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.ownerId !== user.id && tx.borrowerId !== user.id) {
      return NextResponse.json({ error: 'Only participants in this transaction can raise a dispute' }, { status: 403 });
    }

    const otherUserId = tx.ownerId === user.id ? tx.borrowerId : tx.ownerId;

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
      // Notify counterparty
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

    // Notify all admins
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
