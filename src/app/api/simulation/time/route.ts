import { NextRequest, NextResponse } from 'next/server';
import {
  getSimulatedNow,
  advanceSimulationHours,
  resetSimulation,
  getPlatformConfig,
  runOverdueAndReminderSweep,
} from '@/lib/simulation';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await getPlatformConfig();
    const simulatedNow = await getSimulatedNow();

    return NextResponse.json({
      simulatedNow: simulatedNow.toISOString(),
      offsetHours: config.simulatedTimeOffsetHours,
      penaltyRateDaily: config.penaltyRateDaily,
      penaltyMaxPercent: config.penaltyMaxPercent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, hours } = await req.json();
    let newSimulatedNow: Date;

    if (action === 'reset') {
      newSimulatedNow = await resetSimulation();
    } else if (action === 'advance') {
      const h = parseInt(hours) || 24;
      newSimulatedNow = await advanceSimulationHours(h);
    } else if (action === 'advanceToDeadline') {
      // Find earliest active transaction deadline
      const earliest = await prisma.transaction.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { deadline: 'asc' },
      });

      if (earliest) {
        const currentSimNow = await getSimulatedNow();
        const diffHours = Math.ceil((new Date(earliest.deadline).getTime() - currentSimNow.getTime()) / (3600 * 1000));
        // Jump to 2 hours past deadline so it becomes strictly overdue
        const jumpHours = Math.max(1, diffHours + 2);
        newSimulatedNow = await advanceSimulationHours(jumpHours);
      } else {
        // Just advance 24 hours
        newSimulatedNow = await advanceSimulationHours(24);
      }
    } else {
      await runOverdueAndReminderSweep();
      newSimulatedNow = await getSimulatedNow();
    }

    const config = await getPlatformConfig();

    return NextResponse.json({
      success: true,
      simulatedNow: newSimulatedNow.toISOString(),
      offsetHours: config.simulatedTimeOffsetHours,
      message: `Simulated time updated. Overdue sweep completed.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
