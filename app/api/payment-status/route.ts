import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payment = await prisma.payment.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ paymentStatus: payment?.status || 'pending' });
}
