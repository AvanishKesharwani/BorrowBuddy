import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const mode = searchParams.get('mode') || '';
    const availability = searchParams.get('availability') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxDuration = parseInt(searchParams.get('maxDuration') || '0');

    const andConditions: any[] = [];

    if (q.trim()) {
      const tokens = q.trim().split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        andConditions.push({
          OR: [
            { name: { contains: token } },
            { description: { contains: token } },
            { category: { contains: token } },
            { campusLocation: { contains: token } },
          ],
        });
      }
    }

    if (category && category !== 'All') {
      andConditions.push({ category });
    }

    if (mode && mode !== 'ALL') {
      andConditions.push({
        OR: [{ mode }, { mode: 'BOTH' }],
      });
    }

    if (availability && availability !== 'ALL') {
      andConditions.push({ availability });
    }

    if (maxDuration > 0) {
      andConditions.push({ maxDuration: { gte: maxDuration } });
    }

    if (minRating > 0) {
      andConditions.push({
        owner: {
          rating: { gte: minRating },
        },
      });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

    const items = await prisma.item.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            studentId: true,
            name: true,
            branch: true,
            year: true,
            avatarUrl: true,
            rating: true,
            reliabilityScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const data = await req.json();
    const {
      name,
      category,
      description,
      imageUrl,
      condition,
      mode,
      rentalPrice,
      declaredValue,
      securityDeposit,
      maxDuration,
      campusLocation,
    } = data;

    if (!name || !category || !description) {
      return NextResponse.json({ error: 'Name, category and description are required' }, { status: 400 });
    }

    const defaultImage =
      imageUrl && imageUrl.trim().length > 0
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';

    const item = await prisma.item.create({
      data: {
        ownerId: user.id,
        name: name.trim(),
        category,
        description: description.trim(),
        imageUrl: defaultImage,
        condition: condition || 'Good',
        mode: mode || 'BORROW',
        rentalPrice: mode !== 'BORROW' && rentalPrice ? parseFloat(rentalPrice) : null,
        declaredValue: declaredValue ? parseFloat(declaredValue) : 1000.0,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
        maxDuration: maxDuration ? parseInt(maxDuration) : 7,
        availability: 'AVAILABLE',
        campusLocation: campusLocation || 'Hostel Raman',
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create listing' }, { status: 500 });
  }
}
