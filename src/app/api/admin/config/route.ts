import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getPlatformConfig } from '@/lib/simulation';

export async function GET() {
  try {
    const config = await getPlatformConfig();
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { penaltyRateDaily, penaltyMaxPercent } = await req.json();

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
