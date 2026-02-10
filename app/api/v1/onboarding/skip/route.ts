import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    console.log('[ONBOARDING] Skip request received');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: true, message: 'Missing or invalid authorization token' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    } catch (err) {
      console.log('[ONBOARDING] Token verification failed', err);
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const userId = decoded?.id;
    if (!userId) {
      console.log('[ONBOARDING] User ID not found in token');
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    // Update user to mark onboarding skipped
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingSkipped: true,
        isOnboarded: false,
      },
      select: {
        id: true,
        email: true,
        isOnboarded: true,
        onboardingSkipped: true,
      },
    });

    console.log('[ONBOARDING] Onboarding skipped successfully for user:', userId);
    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'Onboarding skipped successfully',
        data: { user: updated },
      },
      { status: STATUS.OK },
    );
  } catch (error) {
    console.error('[ONBOARDING] Error skipping onboarding:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to skip onboarding' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
