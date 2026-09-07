import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { itemId, deadline, mode, borrowerNotes } = await req.json();

    if (!itemId || !deadline) {
      return NextResponse.json({ error: 'Item ID and Return Deadline are required' }, { status: 400 });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { owner: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Rule: Cannot borrow own item
    if (item.ownerId === user.id) {
      return NextResponse.json({ error: 'You cannot borrow an item that you own!' }, { status: 400 });
    }

    // Rule: Item must be available
    if (item.availability !== 'AVAILABLE') {
      return NextResponse.json({ error: 'This item is currently unavailable for borrowing' }, { status: 400 });
    }

    const simulatedNow = await getSimulatedNow();
    const returnDeadline = new Date(deadline);

    if (returnDeadline <= simulatedNow) {
      return NextResponse.json({ error: 'Return deadline must be in the future' }, { status: 400 });
    }

    // Check maximum duration
    const durationDays = (returnDeadline.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24);
    if (durationDays > item.maxDuration + 0.5) {
      return NextResponse.json(
        { error: `Requested duration (${Math.ceil(durationDays)} days) exceeds owner's maximum limit of ${item.maxDuration} days` },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        itemId: item.id,
        ownerId: item.ownerId,
        borrowerId: user.id,
        requestDate: simulatedNow,
        deadline: returnDeadline,
        mode: mode || item.mode === 'RENT' ? 'RENT' : 'BORROW',
        status: 'REQUESTED',
        borrowerNotes: borrowerNotes?.trim() || null,
      },
    });

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: item.ownerId,
        title: `New Borrow Request for ${item.name}`,
        message: `${user.name} (${user.studentId}, ${user.branch}) wants to borrow your ${item.name} until ${returnDeadline.toLocaleDateString()}.`,
        type: 'REQUEST',
        link: '/lent',
      },
    });

    // Initial message in transaction chat
    await prisma.message.create({
      data: {
        transactionId: transaction.id,
        senderId: user.id,
        receiverId: item.ownerId,
        content: borrowerNotes?.trim() || `Hi ${item.owner.name}, I would like to borrow your ${item.name}. Where can we meet on campus?`,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit borrow request' }, { status: 500 });
  }
}
