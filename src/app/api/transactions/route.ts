import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { runOverdueAndReminderSweep } from '@/lib/simulation';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Refresh overdue calculations seamlessly
    await runOverdueAndReminderSweep();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // 'borrowed', 'lent', 'all'

    const where: any = {};

    if (type === 'borrowed') {
      where.borrowerId = user.id;
    } else if (type === 'lent') {
      where.ownerId = user.id;
    } else {
      where.OR = [{ borrowerId: user.id }, { ownerId: user.id }];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        item: true,
        owner: {
          select: {
            id: true,
            studentId: true,
            name: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
          },
        },
        borrower: {
          select: {
            id: true,
            studentId: true,
            name: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
          },
        },
        ratings: true,
        disputes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
