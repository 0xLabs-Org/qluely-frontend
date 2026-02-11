import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS, UserDetails as UserDetailsType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    console.log('[USER] User details request received');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    } catch (err) {
      console.log('[USER] Token verification failed', err);
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    // Fetch fresh details from DB

    // Build details from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        account: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: true, message: 'details not found' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    const account = user.account;
    const details: UserDetailsType = {
      plan: (account?.plan as any) ?? 'FREE',
      period: (account?.period as any) ?? null,
      planStartedAt: account?.planStartedAt ?? null,
      planExpiresAt: account?.planExpiresAt ?? null,
      creditsRemaining: account?.creditsRemaining ?? 0,
      creditsUsed: account?.creditsUsed ?? 0,
      imageCredits: account?.imageCredits ?? 0,
      audioCredits: account?.audioCredits ?? 0,
    };

    // No caching — always return fresh details

    return NextResponse.json(
      { success: true, error: false, message: 'details fetched', data: details },
      { status: STATUS.OK },
    );
  } catch (error) {
    console.error('[USER] Error fetching user details:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'error while fetching user details' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
