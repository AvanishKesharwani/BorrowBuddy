/**
 * ============================================================================
 * IN-TRANSACTION CHAT API (src/app/api/transactions/[id]/messages/route.ts)
 * ============================================================================
 * 
 * 🎯 WHAT THIS FILE DOES:
 * Powers the real-time private messaging thread embedded inside every borrowing transaction:
 * 1. `GET`: Fetches chronological messages between lender and borrower for handover coordination.
 * 2. `POST`: Sends a new message from one participant to the other.
 * 
 * 💡 KEY CONCEPTS / ARCHITECTURE:
 * 1. Transaction-Scoped Chat: Unlike a global open messenger, messages are tied
 *    directly to a specific `transactionId` in SQLite, keeping handover discussions
 *    organized per item.
 * 2. Privacy & Access Control: Only the owner, borrower, or a Campus Admin can read
 *    or post in this thread.
 * 
 * 🎓 TEACHER QUICK EXPLANATION:
 * "Sir/Ma'am, this route powers our in-app messaging modal. When a loan request is
 * made, a private chat thread opens between borrower and lender so they can coordinate
 * meetup locations like Hostel Raman or the Central Library."
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/**
 * ----------------------------------------------------------------------------
 * GET Handler:
 * Loads all chat messages for this transaction in chronological order.
 * ----------------------------------------------------------------------------
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Fetch transaction details
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 3: Authorization (only participants or campus admin can view)
    if (tx.ownerId !== user.id && tx.borrowerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to view messages' }, { status: 403 });
    }

    // Step 4: Query chronological message history
    const messages = await prisma.message.findMany({
      where: { transactionId: params.id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            studentId: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

/**
 * ----------------------------------------------------------------------------
 * POST Handler:
 * Validates message content, determines the recipient, and inserts into SQLite.
 * ----------------------------------------------------------------------------
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Step 1: Verify authenticated student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Step 2: Read message content
    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // Step 3: Fetch transaction details
    const tx = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { item: true },
    });

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Step 4: Authorization
    if (tx.ownerId !== user.id && tx.borrowerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to send message' }, { status: 403 });
    }

    // Step 5: Automatically determine counterparty receiver ID
    const receiverId = tx.ownerId === user.id ? tx.borrowerId : tx.ownerId;

    // Step 6: Create message record
    const message = await prisma.message.create({
      data: {
        transactionId: tx.id,
        senderId: user.id,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            studentId: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
