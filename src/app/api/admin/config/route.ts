/**
 * ============================================================================
 * ADMIN PLATFORM CONFIGURATION API (src/app/api/admin/config/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Allows Campus Administrators to view and fine-tune global platform financial
 * rules (e.g., daily overdue penalty rate and maximum penalty cap percentage).
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Role-Based Access Control (RBAC): The `PATCH` handler verifies that
 *    `user.role === 'ADMIN'`. Non-admin students are rejected with HTTP 403 Forbidden.
 * 2. Dynamic Policy Configuration: Modifying these settings updates the `PlatformConfig`
 *    record in SQLite, instantly applying the new rate to future overdue evaluations.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route is part of the Admin Control Panel. It allows faculty
 * administrators to adjust the platform's default late penalty rate (e.g. 5% per day)
 * and safety ceiling (e.g. 50% max) according to campus policy."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPlatformConfig } from '@/lib/simulation';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Retrieves the active global configuration settings.
 * ----------------------------------------------------------------------------
 */
export async function GET() {
  try {
    const config = await getPlatformConfig();
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * ----------------------------------------------------------------------------
 * PATCH Handler:
 * Verifies admin role and updates late penalty rates in SQLite.
 * ----------------------------------------------------------------------------
 */
export async function PATCH(req: NextRequest) {
  try {
    // Step 1: Enforce Administrator role
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    // Step 2: Parse new penalty parameters
    const { penaltyRateDaily, penaltyMaxPercent } = await req.json();

    // Step 3: Update global configuration row
    const updated = await prisma.platformConfig.update({
      where: { id: 'global' },
      data: {
        penaltyRateDaily: parseFloat(penaltyRateDaily),
        penaltyMaxPercent: parseFloat(penaltyMaxPercent),
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
