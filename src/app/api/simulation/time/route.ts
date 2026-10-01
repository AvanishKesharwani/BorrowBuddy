/**
 * ============================================================================
 * TIME TRAVEL SIMULATION API (src/app/api/simulation/time/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Powers the interactive presentation demo toolbar:
 * 1. `GET`: Returns the current virtual clock timestamp, active hour offset,
 *    and platform penalty configuration.
 * 2. `POST`: Accepts time-travel commands:
 *    - `action: "advance"`: Fast-forwards time by a given number of hours (+24h, +72h).
 *    - `action: "advanceToDeadline"`: Dynamically jumps straight to 2 hours past the
 *      earliest active loan deadline to immediately demonstrate overdue penalty logic.
 *    - `action: "reset"`: Resets the clock offset back to zero (real local time).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Synchronous Sweep Execution: Every time change immediately triggers
 *    `runOverdueAndReminderSweep()`, so overdue banners and penalty amounts
 *    appear instantly without a page reload.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers our presentation time-travel buttons. When we click
 * '+1 Day' or 'Jump to Overdue', this endpoint increments our virtual clock offset
 * and instantly runs the overdue penalty calculation algorithm."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSimulatedNow,
  advanceSimulationHours,
  resetSimulation,
  getPlatformConfig,
  runOverdueAndReminderSweep,
} from '@/lib/simulation';
import { prisma } from '@/lib/prisma';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Returns current virtual clock details and penalty settings.
 * ----------------------------------------------------------------------------
 */
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

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Advances or resets virtual time and triggers the overdue sweep.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    const { action, hours } = await req.json();
    let newSimulatedNow: Date;

    // Action A: Reset simulation to real local time
    if (action === 'reset') {
      newSimulatedNow = await resetSimulation();
    } 
    // Action B: Advance by specific hours (e.g. 24h, 72h)
    else if (action === 'advance') {
      const h = parseInt(hours) || 24;
      newSimulatedNow = await advanceSimulationHours(h);
    } 
    // Action C: Smart jump straight past the earliest active loan deadline
    else if (action === 'advanceToDeadline') {
      const earliest = await prisma.transaction.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { deadline: 'asc' },
      });

      if (earliest) {
        const currentSimNow = await getSimulatedNow();
        const diffHours = Math.ceil((new Date(earliest.deadline).getTime() - currentSimNow.getTime()) / (3600 * 1000));
        // Jump to 2 hours past deadline to guarantee it becomes overdue
        const jumpHours = Math.max(1, diffHours + 2);
        newSimulatedNow = await advanceSimulationHours(jumpHours);
      } else {
        newSimulatedNow = await advanceSimulationHours(24);
      }
    } 
    // Action D: Refresh overdue sweep without advancing time
    else {
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
