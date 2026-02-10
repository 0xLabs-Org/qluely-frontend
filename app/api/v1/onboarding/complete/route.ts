import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/types';

type OnboardingRequest = {
  role: string;
  useCases: string[];
};

export async function POST(request: NextRequest) {
  try {
    console.log('[ONBOARDING] Submit request received');

    const body = await request.json();
    console.log('[ONBOARDING] Request body:', body);

    // Basic validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: true, message: 'Invalid request body' },
        { status: STATUS.UNPROCESSABLE_ENTITY },
      );
    }

    const { role, useCases } = body as OnboardingRequest;
    if (!role || typeof role !== 'string') {
      return NextResponse.json(
        { success: false, error: true, message: 'Missing or invalid role' },
        { status: STATUS.UNPROCESSABLE_ENTITY },
      );
    }

    if (!Array.isArray(useCases) || useCases.length === 0) {
      return NextResponse.json(
        { success: false, error: true, message: 'Missing or invalid use cases' },
        { status: STATUS.UNPROCESSABLE_ENTITY },
      );
    }

    // Verify JWT from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[ONBOARDING] Missing authorization token');
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

    // Update user onboarding fields
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        useCases,
        isOnboarded: true,
        onboardedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        role: true,
        useCases: true,
        isOnboarded: true,
        onboardedAt: true,
      },
    });

    console.log('[ONBOARDING] Onboarding submitted successfully for user:', userId);
    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'Onboarding completed successfully',
        data: { user: updated },
      },
      { status: STATUS.OK },
    );
  } catch (error) {
    console.error('[ONBOARDING] Error submitting onboarding:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Failed to submit onboarding data' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
