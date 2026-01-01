export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signOut } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    await signOut(req, res);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Sign out failed' }, { status: 500 });
  }
}
