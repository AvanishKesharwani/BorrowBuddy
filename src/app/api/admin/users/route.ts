import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            items: true,
            borrowedTransactions: true,
            lentTransactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { userId, isSuspended } = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isSuspended },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete an administrator account' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Fetch items owned by the target user
      const userItems = await tx.item.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      const userItemIds = userItems.map((i) => i.id);

      // 2. Fetch transactions involving the target user or their items
      const userTransactions = await tx.transaction.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { borrowerId: userId },
            { itemId: { in: userItemIds } },
          ],
        },
        select: { id: true, itemId: true, status: true },
      });
      const txIds = userTransactions.map((t) => t.id);

      // 3. Reset availability of other users' items that were actively borrowed/requested by this user
      const otherItemIdsToRestore = userTransactions
        .filter(
          (t) =>
            !userItemIds.includes(t.itemId) &&
            ['ACTIVE', 'REQUESTED', 'RETURN_PENDING', 'OVERDUE'].includes(t.status)
        )
        .map((t) => t.itemId);

      if (otherItemIdsToRestore.length > 0) {
        await tx.item.updateMany({
          where: { id: { in: otherItemIdsToRestore } },
          data: { availability: 'AVAILABLE' },
        });
      }

      // 4. Delete dependent records for these transactions
      if (txIds.length > 0) {
        await tx.dispute.deleteMany({ where: { transactionId: { in: txIds } } });
        await tx.message.deleteMany({ where: { transactionId: { in: txIds } } });
        await tx.rating.deleteMany({ where: { transactionId: { in: txIds } } });
        await tx.transaction.deleteMany({ where: { id: { in: txIds } } });
      }

      // 5. Delete any remaining disputes, messages, and ratings involving the user
      await tx.dispute.deleteMany({ where: { raisedById: userId } });
      await tx.message.deleteMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      });
      await tx.rating.deleteMany({
        where: { OR: [{ reviewerId: userId }, { revieweeId: userId }] },
      });

      // 6. Delete notifications
      await tx.notification.deleteMany({ where: { userId } });

      // 7. Delete the user's owned items
      if (userItemIds.length > 0) {
        await tx.item.deleteMany({ where: { id: { in: userItemIds } } });
      }

      // 8. Delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

