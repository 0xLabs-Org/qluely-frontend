import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(_: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res);
  return res;
}
