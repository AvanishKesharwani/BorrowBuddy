/**
 * ============================================================================
 * SINGLE ITEM DETAILS & MANAGEMENT API (src/app/api/items/[id]/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Manages operations on a specific campus listing:
 * 1. `GET`: Fetches detailed item specifications, pickup location, condition,
 *    and owner trust profile (reputation, successful return history, active loans).
 * 2. `DELETE`: Allows the item owner or a Campus Administrator to remove a listing
 *    from the marketplace.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Dynamic Route Segment (`params.id`): Next.js App Router passes the URL
 *    item ID parameter to the handler.
 * 2. Authorization Checks: The `DELETE` handler strictly verifies that only the
 *    original owner or an `ADMIN` can delete the listing.
 * 3. Relational Counts: Computes the owner's lifetime successful lend/borrow
 *    counts using Prisma `_count`.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route handles individual item views. When a student clicks an
 * item card, GET loads the item details and owner reputation. DELETE allows the
 * owner or faculty admin to safely remove the item."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Loads item details along with owner stats and active loan status.
 * ----------------------------------------------------------------------------
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Fetch item by ID with related owner profile and active transactions
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
            _count: {
              select: {
                lentTransactions: { where: { status: 'RETURNED' } },
                borrowedTransactions: { where: { status: 'RETURNED' } },
              },
            },
          },
        },
        transactions: {
          where: {
            status: { in: ['REQUESTED', 'ACTIVE', 'RETURN_PENDING', 'OVERDUE'] },
          },
          select: {
            id: true,
            status: true,
            deadline: true,
            borrowerId: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch item' }, { status: 500 });
  }
}

/**
 * ----------------------------------------------------------------------------
 * DELETE Handler:
 * Verifies caller authorization and removes the item from the database.
 * ----------------------------------------------------------------------------
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify authenticated session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Fetch target item
    const item = await prisma.item.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Step 3: Authorization check (only owner or campus admin can delete)
    if (item.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to delete this item' }, { status: 403 });
    }

    // Step 4: Delete item (cascading deletes clean up related records)
    await prisma.item.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete item' }, { status: 500 });
  }
}
