export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signUp, setAuthCookie } from '../../../../lib/auth';
import { Prisma } from '@prisma/client';
import { logError } from '../../../../lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password too short' }, { status: 400 });

    const { user, token } = await signUp(email, username || null, password);
    const res = NextResponse.json({ user });
    setAuthCookie(res, token);
    return res;
  } catch (err: any) {
    // Handle unique constraint (email) gracefully
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }
    // Log full error server-side, but return a generic message to clients
    logError('Signup error', err);
    return NextResponse.json({ error: 'Sign up failed' }, { status: 500 });
  }
}
