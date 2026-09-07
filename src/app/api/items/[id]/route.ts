import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Only owner or admin can delete
    if (item.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to delete this item' }, { status: 403 });
    }

    await prisma.item.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete item' }, { status: 500 });
  }
}
