import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { resolutionNotes, action } = await req.json(); // action: 'RESOLVE_RETURNED' | 'RESOLVE_CANCELLED' | 'RESOLVE_UPHELD'

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
      prisma.notification.create({
        data: {
          userId: dispute.transaction.ownerId,
          title: `Dispute Resolved: ${dispute.transaction.item.name}`,
          message: `Campus Administrator resolved dispute. Resolution: ${resolutionNotes || 'Case closed.'}`,
          type: 'DISPUTE',
          link: '/lent',
        },
      }),
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
