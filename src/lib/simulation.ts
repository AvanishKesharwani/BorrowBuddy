/**
 * ============================================================================
 * TIME SIMULATION & PENALTY ENGINE (src/lib/simulation.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Powers the "Virtual Time-Travel" and Automated Overdue Penalty engine.
 * Instead of waiting days in real time to test deadline expirations, this file
 * allows students and evaluators to advance platform time by +1 day, +3 days,
 * etc., instantly recalculating penalties, updating transaction statuses, and
 * deducting student reliability scores.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Virtual Clock: Uses `simulatedTimeOffsetHours` stored in `PlatformConfig`
 *    to compute `simulatedNow = Date.now() + offsetMs`.
 * 2. Automated Sweeps (`runOverdueAndReminderSweep`): Scans all active loans,
 *    detects expired deadlines, and computes overdue days.
 * 3. Daily Penalty Formula:
 *    `Penalty = OverdueDays * PenaltyRateDaily (5%) * DeclaredValue`
 *    subject to a maximum safety ceiling (e.g. 50% of the item's declared value).
 * 4. Automated Reputation Impact: Deducts 0.2 to 0.4 points from a student's
 *    reputation if they default on a return, keeping campus borrowing trustworthy.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this file contains our virtual clock engine. In real life, borrow
 * periods last days or weeks. During presentations, this engine lets us fast-forward
 * time to demonstrate automated overdue alerts, daily penalty accruals, and
 * borrower reliability score reductions without waiting for real days to pass."
 * ============================================================================
 */

import { prisma } from './prisma';

/**
 * ----------------------------------------------------------------------------
 * getPlatformConfig():
 * Retrieves global platform configuration (penalty rates, simulated offset).
 * If no configuration exists in the SQLite database, it initializes defaults.
 * ----------------------------------------------------------------------------
 */
export async function getPlatformConfig() {
  let config = await prisma.platformConfig.findUnique({
    where: { id: 'global' },
  });

  if (!config) {
    config = await prisma.platformConfig.create({
      data: {
        id: 'global',
        penaltyRateDaily: 0.05,       // Default 5% daily late penalty
        penaltyMaxPercent: 0.50,      // Max penalty capped at 50% of item value
        simulatedTimeOffsetHours: 0,  // Real-time offset starts at 0 hours
      },
    });
  }

  return config;
}

/**
 * ----------------------------------------------------------------------------
 * getSimulatedNow():
 * Returns the effective current date/time on campus by adding the simulated
 * hour offset to the real system clock.
 * ----------------------------------------------------------------------------
 */
export async function getSimulatedNow(): Promise<Date> {
  const config = await getPlatformConfig();
  const offsetMs = (config.simulatedTimeOffsetHours || 0) * 3600 * 1000;
  return new Date(Date.now() + offsetMs);
}

/**
 * ----------------------------------------------------------------------------
 * advanceSimulationHours(hours):
 * Advances the campus clock forward by the specified number of hours and
 * immediately runs the overdue & reminder sweep.
 * ----------------------------------------------------------------------------
 */
export async function advanceSimulationHours(hours: number) {
  const config = await getPlatformConfig();
  const newOffset = (config.simulatedTimeOffsetHours || 0) + hours;

  // Persist new hour offset to SQLite
  await prisma.platformConfig.update({
    where: { id: 'global' },
    data: { simulatedTimeOffsetHours: newOffset },
  });

  // Check which loans have now become overdue or need reminders
  await runOverdueAndReminderSweep();
  return getSimulatedNow();
}

/**
 * ----------------------------------------------------------------------------
 * resetSimulation():
 * Resets the simulated clock offset back to 0 (syncs back to real local time).
 * ----------------------------------------------------------------------------
 */
export async function resetSimulation() {
  await prisma.platformConfig.update({
    where: { id: 'global' },
    data: { simulatedTimeOffsetHours: 0 },
  });

  await runOverdueAndReminderSweep();
  return getSimulatedNow();
}

/**
 * ----------------------------------------------------------------------------
 * runOverdueAndReminderSweep():
 * Background evaluation job that inspects all ACTIVE and OVERDUE transactions:
 * 1. Checks if deadline has expired according to simulated time.
 * 2. If expired:
 *    - Marks transaction as 'OVERDUE'
 *    - Calculates late days and daily penalty amount
 *    - Reduces the borrower's campus reliability score
 *    - Dispatches instant in-app alerts to both borrower and lender
 * 3. If within 24 hours of deadline:
 *    - Sends an upcoming deadline courtesy reminder to the borrower
 * ----------------------------------------------------------------------------
 */
export async function runOverdueAndReminderSweep() {
  const simulatedNow = await getSimulatedNow();
  const config = await getPlatformConfig();

  // Find all ACTIVE and OVERDUE transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'OVERDUE'],
      },
    },
    include: {
      item: true,
      borrower: true,
      owner: true,
    },
  });

  for (const tx of transactions) {
    const deadline = new Date(tx.deadline);
    const diffMs = simulatedNow.getTime() - deadline.getTime();

    // Condition 1: Current simulated time has surpassed the return deadline
    if (diffMs > 0) {
      // Calculate overdue days (at least 1 day)
      const overdueDays = Math.max(1, Math.ceil(diffMs / (24 * 3600 * 1000)));
      const penaltyRate = tx.penaltyRate || config.penaltyRateDaily || 0.05;
      const maxCap = tx.maxPenaltyCap || config.penaltyMaxPercent || 0.50;
      const declaredVal = tx.item.declaredValue || 1000;

      // Calculate fee capped at safety maximum (e.g. 50% of declared value)
      const rawPenalty = overdueDays * penaltyRate * declaredVal;
      const cappedPenalty = Math.min(rawPenalty, maxCap * declaredVal);

      // Check if newly overdue or penalty increased
      const wasActive = tx.status === 'ACTIVE';
      const penaltyChanged = tx.penalty !== cappedPenalty;

      if (wasActive || penaltyChanged) {
        // Update transaction status and accumulated penalty
        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            status: 'OVERDUE',
            overdueDays,
            penalty: cappedPenalty,
          },
        });

        // Deduct borrower reliability score if newly overdue or increased
        if (wasActive) {
          const deduction = overdueDays === 1 ? 0.2 : 0.4;
          const currentReliability = tx.borrower.reliabilityScore || 100;
          const newScore = Math.max(50.0, Number((currentReliability - deduction).toFixed(1)));
          
          await prisma.user.update({
            where: { id: tx.borrowerId },
            data: { reliabilityScore: newScore },
          });

          // Send overdue notice to the borrower
          await prisma.notification.create({
            data: {
              userId: tx.borrowerId,
              title: `⚠️ Overdue Notice: ${tx.item.name}`,
              message: `Your return deadline has passed! A simulated penalty of ₹${cappedPenalty.toFixed(0)} has been applied (5%/day). Please return the item immediately.`,
              type: 'OVERDUE',
              link: '/borrowings',
            },
          });

          // Send notification to the owner/lender
          await prisma.notification.create({
            data: {
              userId: tx.ownerId,
              title: `⚠️ Item Overdue: ${tx.item.name}`,
              message: `${tx.borrower.name} has not returned your item by the scheduled deadline. The transaction is marked Overdue.`,
              type: 'OVERDUE',
              link: '/lent',
            },
          });
        }
      }
    } else {
      // Condition 2: Check for 24h deadline approaching reminder
      const hoursUntilDeadline = Math.abs(diffMs) / (3600 * 1000);
      if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 0 && tx.status === 'ACTIVE') {
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: tx.borrowerId,
            type: 'DUE_SOON',
            message: { contains: tx.item.name },
          },
        });

        // Create reminder if not already sent
        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              userId: tx.borrowerId,
              title: `⏰ Due Soon: ${tx.item.name}`,
              message: `Reminder: Your borrowed ${tx.item.name} is due within 24 hours. Please coordinate handover with ${tx.owner.name}.`,
              type: 'DUE_SOON',
              link: '/borrowings',
            },
          });
        }
      }
    }
  }
}
