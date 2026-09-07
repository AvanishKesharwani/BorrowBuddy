import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'iiitnr-campus-borrow-super-secret-key-2026';
export const AUTH_COOKIE_NAME = 'campus_session';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
        branch: true,
        year: true,
        avatarUrl: true,
        rating: true,
        reliabilityScore: true,
        role: true,
        isSuspended: true,
        createdAt: true,
      },
    });

    if (!user || user.isSuspended) return null;
    return user;
  } catch (error) {
    return null;
  }
}
