import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { runOverdueAndReminderSweep } from '@/lib/simulation';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    await runOverdueAndReminderSweep();

    const [
      totalStudents,
      totalItems,
      activeBorrowings,
      completedReturns,
      overdueTransactions,
      disputedTransactions,
      penaltiesSum,
      allUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.item.count(),
      prisma.transaction.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.count({ where: { status: 'RETURNED' } }),
      prisma.transaction.count({ where: { status: 'OVERDUE' } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.transaction.aggregate({
        _sum: { penalty: true },
      }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { rating: true, reliabilityScore: true },
      }),
    ]);

    const avgRating =
      allUsers.length > 0
        ? Number((allUsers.reduce((acc, u) => acc + u.rating, 0) / allUsers.length).toFixed(1))
        : 5.0;

    const avgReliability =
      allUsers.length > 0
        ? Number((allUsers.reduce((acc, u) => acc + u.reliabilityScore, 0) / allUsers.length).toFixed(1))
        : 100.0;

    return NextResponse.json({
      totalStudents,
      totalItems,
      activeBorrowings,
      completedReturns,
      overdueTransactions,
      disputedTransactions,
      totalSimulatedPenalties: penaltiesSum._sum.penalty || 0,
      averageStudentRating: avgRating,
      averageReliability: avgReliability,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
