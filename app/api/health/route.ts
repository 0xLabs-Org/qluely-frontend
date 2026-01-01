import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedisConnection } from '@/lib/queue';

export async function GET() {
  const result: any = { ok: true, checks: {} };

  try {
    await prisma.$queryRaw`SELECT 1`;
    result.checks.db = 'ok';
  } catch (err) {
    result.ok = false;
    result.checks.db = 'error';
  }

  try {
    const r = getRedisConnection();
    const pong = await r.ping();
    result.checks.redis = pong === 'PONG' ? 'ok' : 'error';
  } catch (err) {
    result.ok = false;
    result.checks.redis = 'error';
  }

  const headers = {
    'Content-Security-Policy': "default-src 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer'
  };

  return NextResponse.json(result, { headers });
}
