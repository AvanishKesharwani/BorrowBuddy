import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { transactionId, rating, comment, criteria } = await req.json();

    if (!transactionId || !rating) {
      return NextResponse.json({ error: 'Transaction ID and Rating are required' }, { status: 400 });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating)));

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { item: true, owner: true, borrower: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.ownerId !== user.id && tx.borrowerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to review this transaction' }, { status: 403 });
    }

    const revieweeId = tx.ownerId === user.id ? tx.borrowerId : tx.ownerId;

    // Check if already rated by this user
    const existing = await prisma.rating.findFirst({
      where: {
        transactionId: tx.id,
        reviewerId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted a rating for this transaction' }, { status: 400 });
    }

    const createdRating = await prisma.rating.create({
      data: {
        transactionId: tx.id,
        reviewerId: user.id,
        revieweeId,
        rating: numericRating,
        comment: comment?.trim() || 'No additional comment provided.',
        criteria: criteria || '',
      },
    });

    // Recalculate reviewee average rating
    const allRatings = await prisma.rating.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / allRatings.length).toFixed(1));

    await prisma.user.update({
      where: { id: revieweeId },
      data: { rating: avg },
    });

    // Notify reviewee
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        title: `New Rating Received: ${numericRating} ⭐`,
        message: `${user.name} rated your transaction on ${tx.item.name}: "${comment?.trim() || 'Good interaction'}"`,
        type: 'RATING',
        link: `/profile/${revieweeId}`,
      },
    });

    return NextResponse.json({ success: true, rating: createdRating, newAverage: avg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit rating' }, { status: 500 });
  }
}
