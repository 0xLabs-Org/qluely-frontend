import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/types';
import { generateToken } from '@/helper/auth';
import { AccountType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    console.log('[USER] Profile refresh request received');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: true, message: 'Invalid' },
        { status: STATUS.CONFLICT },
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
        { success: false, error: true, message: 'Invalid' },
        { status: STATUS.CONFLICT },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isOnboarded: true,
        onboardingSkipped: true,
        email: true,
        account: { select: { plan: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: STATUS.NOT_FOUND });
    }

    const tokenRefresh = generateToken(userId, (user.account?.plan as string) || AccountType.FREE);

    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'user logged successful',
        data: {
          refreshToken: tokenRefresh,
          email: user.email,
          accounntType: user.account?.plan,
          isOnboarded: user.isOnboarded,
          onboardingSkipped: user.onboardingSkipped,
        },
      },
      { status: STATUS.OK },
    );
  } catch (error) {
    console.error('[USER] Profile refresh error:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'failed to login' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
