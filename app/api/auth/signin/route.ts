export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signIn, setAuthCookie } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

    const { user, token } = await signIn(email, password);
    const res = NextResponse.json({ user });
    setAuthCookie(res, token);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Sign in failed' }, { status: 400 });
  }
}
