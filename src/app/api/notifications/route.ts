/**
 * ============================================================================
 * NOTIFICATIONS FEED & READ STATUS API (src/app/api/notifications/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Powers the student notification inbox:
 * 1. `GET`: Fetches the latest 50 alerts (loan approvals, overdue notices, 24h
 *    reminders, dispute alerts, and rating requests) for the logged-in student.
 * 2. `PATCH`: Marks either a single notification or all notifications as read (`read: true`).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Selective Batch Updates: `prisma.notification.updateMany()` marks all unread
 *    notifications as read in a single SQL update statement.
 * 2. Capped Feed: `take: 50` prevents payload bloat while keeping recent history accessible.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route provides real-time alerts to students. GET loads their
 * notification list (overdue warnings, borrow requests, returns), and PATCH clears
 * the unread red badge when the student views them."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Returns the most recent 50 notifications for the logged-in student.
 * ----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Fetch recent notifications ordered by newest first
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

/**
 * ----------------------------------------------------------------------------
 * PATCH Handler:
 * Updates notification read status (either individually or "mark all as read").
 * ----------------------------------------------------------------------------
 */
export async function PATCH(req: NextRequest) {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id, markAll } = await req.json();

    // Option A: Mark all unread notifications for this user as read
    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    // Option B: Mark a single specific notification as read
    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}
