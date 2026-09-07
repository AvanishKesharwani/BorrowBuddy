import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSimulatedNow } from '@/lib/simulation';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    const simulatedNow = await getSimulatedNow();

    return NextResponse.json({
      user: {
        ...user,
        unreadNotifications: unreadCount,
      },
      simulatedNow: simulatedNow.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}
