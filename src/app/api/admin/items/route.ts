/**
 * ============================================================================
 * ADMIN INVENTORY AUDIT API (src/app/api/admin/items/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows Campus Administrators to inspect and manage all equipment listed across campus:
 * 1. `GET`: Lists all marketplace items along with owner details and lifetime loan counts.
 * 2. `DELETE`: Allows administrators to immediately remove inappropriate, prohibited,
 *    or policy-violating items from the campus catalog.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Moderation Authority: Faculty admins have global override capability to
 *    delete any listing, regardless of who owns it.
 * 2. Relational Analytics: Computes `_count: { transactions: true }` to identify
 *    popular or highly circulated campus equipment.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route provides administrative oversight over all listings.
 * Administrators can audit what items are being circulated on campus and take down
 * any inappropriate or prohibited items."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Returns all listings with owner profiles and transaction counts for admin audit.
 * ----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Query all campus items
    const items = await prisma.item.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            studentId: true,
            email: true,
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * ----------------------------------------------------------------------------
 * DELETE Handler:
 * Permanently removes a listed item by ID.
 * ----------------------------------------------------------------------------
 */
export async function DELETE(req: NextRequest) {
  try {
    // Step 1: Verify Campus Admin role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Read target item ID
    const { itemId } = await req.json();

    // Step 3: Delete from SQLite database
    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true, message: 'Item listing removed by campus administrator' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
