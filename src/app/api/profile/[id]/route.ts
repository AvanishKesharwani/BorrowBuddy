import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
        role: true,
        createdAt: true,
        items: {
          orderBy: { createdAt: 'desc' },
        },
        ratingsReceived: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                studentId: true,
                avatarUrl: true,
              },
            },
            transaction: {
              include: { item: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [
      totalBorrowed,
      successfullyReturned,
      currentlyBorrowed,
      overdueReturns,
      totalLent,
    ] = await Promise.all([
      prisma.transaction.count({
        where: { borrowerId: user.id, status: { in: ['ACTIVE', 'RETURN_PENDING', 'RETURNED', 'OVERDUE'] } },
      }),
      prisma.transaction.count({
        where: { borrowerId: user.id, status: 'RETURNED' },
      }),
      prisma.transaction.count({
        where: { borrowerId: user.id, status: { in: ['ACTIVE', 'RETURN_PENDING'] } },
      }),
      prisma.transaction.count({
        where: { borrowerId: user.id, status: 'OVERDUE' },
      }),
      prisma.transaction.count({
        where: { ownerId: user.id, status: { in: ['ACTIVE', 'RETURN_PENDING', 'RETURNED', 'OVERDUE'] } },
      }),
    ]);

    return NextResponse.json({
      user,
      stats: {
        totalBorrowed,
        successfullyReturned,
        currentlyBorrowed,
        overdueReturns,
        totalLent,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
