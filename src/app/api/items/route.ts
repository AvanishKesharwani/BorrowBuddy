/**
 * ============================================================================
 * CAMPUS ITEMS & MARKETPLACE API (src/app/api/items/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Handles catalog search and new item listing:
 * 1. `GET`: Multi-parameter marketplace search allowing students to filter items
 *    by text search keywords, category, mode (free borrow vs paid rent), minimum
 *    lender rating, campus pickup location, and availability.
 * 2. `POST`: Enables authenticated students to list equipment, books, or lab kits
 *    for borrowing or rental on campus.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Dynamic SQL Query Construction: Dynamically constructs Prisma `where`
 *    conditions (`AND: [...]` / `OR: [...]`) based on URL query parameters.
 * 2. Full-Text Search Simulation: Breaks search queries into tokens and searches
 *    across `name`, `description`, `category`, and `campusLocation`.
 * 3. Protected Mutation: Only logged-in students (`getCurrentUser()`) can list items.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers the Explore page and new listing creation. The GET
 * method handles filtering items by keywords, categories, and owner ratings. The
 * POST method allows students to publish new listings to the campus marketplace."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Parses search parameters from the request URL and queries SQLite via Prisma.
 * ----------------------------------------------------------------------------
 */
export async function GET(req: NextRequest) {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: EXTRACT URL SEARCH PARAMETERS
    // ------------------------------------------------------------------------
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const mode = searchParams.get('mode') || '';
    const availability = searchParams.get('availability') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxDuration = parseInt(searchParams.get('maxDuration') || '0');

    // ------------------------------------------------------------------------
    // STEP 2: BUILD DYNAMIC PRISMA FILTER CRITERIA
    // ------------------------------------------------------------------------
    const andConditions: any[] = [];

    // Filter A: Free-text search across title, description, category, or location
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

    // Filter B: Specific item category (e.g., Electronics, Textbooks)
    if (category && category !== 'All') {
      andConditions.push({ category });
    }

    // Filter C: Mode (Free borrow vs Daily rent)
    if (mode && mode !== 'ALL') {
      andConditions.push({
        OR: [{ mode }, { mode: 'BOTH' }],
      });
    }

    // Filter D: Availability status (AVAILABLE vs BORROWED)
    if (availability && availability !== 'ALL') {
      andConditions.push({ availability });
    }

    // Filter E: Minimum allowed borrowing duration
    if (maxDuration > 0) {
      andConditions.push({ maxDuration: { gte: maxDuration } });
    }

    // Filter F: Minimum owner campus reputation rating
    if (minRating > 0) {
      andConditions.push({
        owner: {
          rating: { gte: minRating },
        },
      });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

    // ------------------------------------------------------------------------
    // STEP 3: EXECUTE QUERY WITH OWNER DATA
    // ------------------------------------------------------------------------
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

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Validates student authentication and creates a new item listing in SQLite.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Verify that requester is an authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Parse listing fields
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

    // Step 3: Enforce required fields
    if (!name || !category || !description) {
      return NextResponse.json({ error: 'Name, category and description are required' }, { status: 400 });
    }

    const defaultImage =
      imageUrl && imageUrl.trim().length > 0
        ? imageUrl.trim()
        : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';

    // Step 4: Insert new item into database
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
