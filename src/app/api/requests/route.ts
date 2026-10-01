/**
 * ============================================================================
 * BORROW REQUEST API ENDPOINT (src/app/api/requests/route.ts)
 * ============================================================================
 * 
 * WHAT THIS FILE DOES:
 * This is a backend REST API route handler that handles HTTP POST requests
 * when a student clicks "Confirm Borrow Request" on any item page.
 * 
 * THE ARCHITECTURAL FLOW:
 * [Student Browser] 
 *        │ (HTTP POST with itemId, deadline, borrowerNotes)
 *        ▼
 * [This API Route: POST(req)]
 *   1. Check Auth (Who is making the request?)
 *   2. Validation (Are inputs valid? Is item available? Cannot borrow own item.)
 *   3. Database Mutations via Prisma:
 *        - Create record in `Transaction` table (status = 'REQUESTED')
 *        - Create record in `Notification` table for the owner
 *        - Create initial welcome `Message` in the transaction chat
 *   4. Return HTTP 200 JSON { success: true, transaction } to the browser.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getSimulatedNow } from '@/lib/simulation';

export async function POST(req: NextRequest) {
  try {
    // ------------------------------------------------------------------------
    // STEP 1: AUTHENTICATION CHECK
    // Only logged-in students are permitted to create borrow requests.
    // ------------------------------------------------------------------------
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ------------------------------------------------------------------------
    // STEP 2: PARSE THE INCOMING JSON BODY
    // Extracts the data sent by the frontend fetch() call.
    // ------------------------------------------------------------------------
    const { itemId, deadline, mode, borrowerNotes } = await req.json();

    if (!itemId || !deadline) {
      return NextResponse.json({ error: 'Item ID and Return Deadline are required' }, { status: 400 });
    }

    // ------------------------------------------------------------------------
    // STEP 3: BUSINESS RULE VALIDATIONS
    // ------------------------------------------------------------------------
    // Fetch the item and its owner details from SQLite database
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { owner: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Rule A: A student cannot borrow an item they listed themselves
    if (item.ownerId === user.id) {
      return NextResponse.json({ error: 'You cannot borrow an item that you own!' }, { status: 400 });
    }

    // Rule B: The item must currently be marked as AVAILABLE
    if (item.availability !== 'AVAILABLE') {
      return NextResponse.json({ error: 'This item is currently unavailable for borrowing' }, { status: 400 });
    }

    const simulatedNow = await getSimulatedNow();
    const returnDeadline = new Date(deadline);

    // Rule C: Return deadline cannot be in the past
    if (returnDeadline <= simulatedNow) {
      return NextResponse.json({ error: 'Return deadline must be in the future' }, { status: 400 });
    }

    // Rule D: Requested time cannot exceed the owner's set maximum borrowing duration
    const durationDays = (returnDeadline.getTime() - simulatedNow.getTime()) / (1000 * 60 * 60 * 24);
    if (durationDays > item.maxDuration + 0.5) {
      return NextResponse.json(
        { error: `Requested duration (${Math.ceil(durationDays)} days) exceeds owner's maximum limit of ${item.maxDuration} days` },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------------
    // STEP 4: DATABASE MUTATION — CREATE TRANSACTION RECORD
    // Inserts a new row into the 'Transaction' table with status 'REQUESTED'.
    // ------------------------------------------------------------------------
    const transaction = await prisma.transaction.create({
      data: {
        itemId: item.id,
        ownerId: item.ownerId,
        borrowerId: user.id,
        requestDate: simulatedNow,
        deadline: returnDeadline,
        mode: mode || item.mode === 'RENT' ? 'RENT' : 'BORROW',
        status: 'REQUESTED',
        borrowerNotes: borrowerNotes?.trim() || null,
      },
    });

    // ------------------------------------------------------------------------
    // STEP 5: CREATE NOTIFICATION FOR THE OWNER
    // Alerts the owner that someone wants to borrow their item.
    // ------------------------------------------------------------------------
    await prisma.notification.create({
      data: {
        userId: item.ownerId,
        title: `New Borrow Request for ${item.name}`,
        message: `${user.name} (${user.studentId}, ${user.branch}) wants to borrow your ${item.name} until ${returnDeadline.toLocaleDateString()}.`,
        type: 'REQUEST',
        link: '/lent',
      },
    });

    // ------------------------------------------------------------------------
    // STEP 6: CREATE INITIAL CHAT MESSAGE
    // Opens an in-app chat thread between owner and borrower for coordination.
    // ------------------------------------------------------------------------
    await prisma.message.create({
      data: {
        transactionId: transaction.id,
        senderId: user.id,
        receiverId: item.ownerId,
        content: borrowerNotes?.trim() || `Hi ${item.owner.name}, I would like to borrow your ${item.name}. Where can we meet on campus?`,
      },
    });

    // ------------------------------------------------------------------------
    // STEP 7: SEND SUCCESS RESPONSE BACK TO FRONTEND
    // ------------------------------------------------------------------------
    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit borrow request' }, { status: 500 });
  }
}
