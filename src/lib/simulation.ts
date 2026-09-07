import { prisma } from './prisma';

export async function getPlatformConfig() {
  let config = await prisma.platformConfig.findUnique({
    where: { id: 'global' },
  });

  if (!config) {
    config = await prisma.platformConfig.create({
      data: {
        id: 'global',
        penaltyRateDaily: 0.05,
        penaltyMaxPercent: 0.50,
        simulatedTimeOffsetHours: 0,
      },
    });
  }

  return config;
}

export async function getSimulatedNow(): Promise<Date> {
  const config = await getPlatformConfig();
  const offsetMs = (config.simulatedTimeOffsetHours || 0) * 3600 * 1000;
  return new Date(Date.now() + offsetMs);
}

export async function advanceSimulationHours(hours: number) {
  const config = await getPlatformConfig();
  const newOffset = (config.simulatedTimeOffsetHours || 0) + hours;

  await prisma.platformConfig.update({
    where: { id: 'global' },
    data: { simulatedTimeOffsetHours: newOffset },
  });

  await runOverdueAndReminderSweep();
  return getSimulatedNow();
}

export async function resetSimulation() {
  await prisma.platformConfig.update({
    where: { id: 'global' },
    data: { simulatedTimeOffsetHours: 0 },
  });

  await runOverdueAndReminderSweep();
  return getSimulatedNow();
}

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

    if (diffMs > 0) {
      // It is overdue!
      const overdueDays = Math.max(1, Math.ceil(diffMs / (24 * 3600 * 1000)));
      const penaltyRate = tx.penaltyRate || config.penaltyRateDaily || 0.05;
      const maxCap = tx.maxPenaltyCap || config.penaltyMaxPercent || 0.50;
      const declaredVal = tx.item.declaredValue || 1000;

      const rawPenalty = overdueDays * penaltyRate * declaredVal;
      const cappedPenalty = Math.min(rawPenalty, maxCap * declaredVal);

      // Check if newly overdue or penalty increased
      const wasActive = tx.status === 'ACTIVE';
      const penaltyChanged = tx.penalty !== cappedPenalty;

      if (wasActive || penaltyChanged) {
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

          // Send notifications
          await prisma.notification.create({
            data: {
              userId: tx.borrowerId,
              title: `⚠️ Overdue Notice: ${tx.item.name}`,
              message: `Your return deadline has passed! A simulated penalty of ₹${cappedPenalty.toFixed(0)} has been applied (5%/day). Please return the item immediately.`,
              type: 'OVERDUE',
              link: '/borrowings',
            },
          });

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
      // Check for 24h deadline approaching reminder
      const hoursUntilDeadline = Math.abs(diffMs) / (3600 * 1000);
      if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 0 && tx.status === 'ACTIVE') {
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: tx.borrowerId,
            type: 'DUE_SOON',
            message: { contains: tx.item.name },
          },
        });

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
