import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, studentId, email, password, branch, year } = await req.json();

    if (!name || !studentId || !email || !password || !branch || !year) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStudentId = studentId.trim().toUpperCase();

    // Validate institutional domain
    if (!cleanEmail.endsWith('@iiitnr.edu.in') && !cleanEmail.endsWith('iiitnr.ac.in')) {
      // In demo mode we can warn or allow, but per requirement: prefer restricting registration to an IIIT-NR institutional email domain
      return NextResponse.json(
        { error: 'Registration is restricted to IIIT-NR institutional email domain (@iiitnr.edu.in)' },
        { status: 400 }
      );
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { studentId: cleanStudentId }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'A student with this email or Student ID already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        studentId: cleanStudentId,
        email: cleanEmail,
        passwordHash,
        branch,
        year,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanStudentId}`,
        rating: 5.0,
        reliabilityScore: 100.0,
        role: 'STUDENT',
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to CampusBorrow!',
        message: 'Your institutional IIIT-NR student profile is active. You can now borrow or list campus items.',
        type: 'SYSTEM',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl,
        rating: user.rating,
        reliabilityScore: user.reliabilityScore,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
