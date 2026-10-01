/**
 * ============================================================================
 * ADMIN USER MANAGEMENT & SUSPENSION API (src/app/api/admin/users/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows Campus Administrators to govern student accounts:
 * 1. `GET`: Lists all registered campus users with activity metrics (items listed,
 *    items borrowed, items lent).
 * 2. `PATCH`: Toggles student account suspension (`isSuspended: true/false`).
 *    Suspended students are immediately blocked from logging in or requesting items.
 * 3. `DELETE`: Performs an atomic, multi-table cascade deletion to completely
 *    remove a user account while safely restoring items borrowed from other students
 *    back to `AVAILABLE`.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Transactional Cleanup: The `DELETE` endpoint demonstrates transactional
 *    integrity by cleaning up dependent transactions, messages, ratings, disputes,
 *    and resetting affected items before deleting the user record.
 * 2. Disciplinary Enforcement: Toggling `isSuspended` provides a non-destructive
 *    disciplinary action for repeat defaulters.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers the User Management tab in the Admin Panel.
 * Administrators can monitor all registered students, suspend accounts of chronic
 * defaulters with one click, or delete student profiles while safely cleaning up records."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Returns all campus users and their participation statistics.
 * ----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Query all users with relational activity counts
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

/**
 * ----------------------------------------------------------------------------
 * PATCH Handler:
 * Toggles a student's suspension status (blocks or unblocks account access).
 * ----------------------------------------------------------------------------
 */
export async function PATCH(req: NextRequest) {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Update suspension state
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

/**
 * ----------------------------------------------------------------------------
 * DELETE Handler:
 * Safely removes a student account and re-links affected transactions and items.
 * ----------------------------------------------------------------------------
 */
export async function DELETE(req: NextRequest) {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent admin self-deletion
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

    // Step 2: Atomic cleanup of dependent records
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

      // 3. Restore other users' items that were borrowed by this user back to AVAILABLE
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

      // 4. Delete dependent transaction records (disputes, messages, ratings)
      if (txIds.length > 0) {
        await tx.dispute.deleteMany({ where: { transactionId: { in: txIds } } });
        await tx.message.deleteMany({ where: { transactionId: { in: txIds } } });
        await tx.rating.deleteMany({ where: { transactionId: { in: txIds } } });
        await tx.transaction.deleteMany({ where: { id: { in: txIds } } });
      }

      // 5. Delete standalone disputes, messages, and ratings involving the user
      await tx.dispute.deleteMany({ where: { raisedById: userId } });
      await tx.message.deleteMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      });
      await tx.rating.deleteMany({
        where: { OR: [{ reviewerId: userId }, { revieweeId: userId }] },
      });

      // 6. Delete notifications
      await tx.notification.deleteMany({ where: { userId } });

      // 7. Delete owned items
      if (userItemIds.length > 0) {
        await tx.item.deleteMany({ where: { id: { in: userItemIds } } });
      }

      // 8. Delete user profile
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
