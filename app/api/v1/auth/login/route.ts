import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/zod/schema';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/helper/auth';
import { AccountType, STATUS } from '@/lib/types';
import { publishEvent } from '@/lib/message/publish';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      console.log('[LOGIN] Validation failed:', parsed.error.flatten());
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: STATUS.UNPROCESSABLE_ENTITY },
      );
    }

    const { email, password } = parsed.data;
    console.log('[LOGIN] Parsed data:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('[LOGIN] Missing credentials:', { email: !!email, password: !!password });
      return NextResponse.json({ message: 'Missing credentials' }, { status: STATUS.BAD_REQUEST });
    }

    console.log('[LOGIN] Looking up user:', email);
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        account: true,
        isOnboarded: true,
        onboardingSkipped: true,
      },
    });

    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: STATUS.BAD_REQUEST });
    }

    console.log('[LOGIN] Comparing password...');
    const match = await bcrypt.compare(password, user.password!);

    if (!match) {
      console.log('[LOGIN] Password mismatch for user:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: STATUS.UNAUTHORIZED });
    }

    console.log('[LOGIN] Password verified successfully');
    const token = generateToken(user.id, (user.account?.plan as string) || AccountType.FREE);
    try {
      await publishEvent('email.send', {
        to: email,
        type: 'LOGIN',
        ideompotencyKey: crypto.randomUUID(),
      });
    } catch {
      console.log('Failed to updated user event');
    }
    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'User logged in successfully',
        data: {
          token,
          userId: user.id,
          isOnboarded: user.isOnboarded,
          onboardingSkipped: user.onboardingSkipped,
        },
      },
      { status: STATUS.ACCEPTED },
    );
  } catch (error) {
    console.error('[LOGIN] Error during login:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, error: true, message: 'failed to login' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
