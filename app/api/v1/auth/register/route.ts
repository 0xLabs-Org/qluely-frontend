import { prisma } from '@/lib/prisma';
import { AccountType, STATUS } from '@/lib/types';
import { registerSchema } from '@/lib/zod/schema';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/helper/auth';

type RegisterRequest = {
  email: string;
  password: string;
  coupon?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      console.log('[REGISTER] Validation failed:', parsed.error.flatten());
      return NextResponse.json(
        { status: false, error: true, message: parsed.error.flatten().fieldErrors },
        { status: STATUS.UNPROCESSABLE_ENTITY },
      );
    }

    const { email, password, coupon } = parsed.data;
    console.log('[REGISTER] Parsed data:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('[REGISTER] Missing credentials:', { email: !!email, password: !!password });
      return NextResponse.json(
        { status: false, error: true, mmessage: 'Missing credentials' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    console.log('[REGISTER] Looking up user:', email);
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { status: false, error: true, message: 'user login sucessful' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        account: {
          create: {
            plan: AccountType.FREE,
            planStartedAt: new Date(),
          },
        },
      },
      select: {
        id: true,
        isOnboarded: true,
        onboardingSkipped: true,
        account: {
          select: {
            id: true,
            plan: true,
            planStartedAt: true,
            creditsRemaining: true,
            creditsUsed: true,
          },
        },
      },
    });
    if (!newUser) {
      console.log('[REGISTER] Failed to create user in database');
      return NextResponse.json(
        { success: false, error: true, message: 'failed to create user' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    const token = generateToken(newUser.id, AccountType.FREE);
    console.log('[REGISTER] Token generated successfully');
    console.log('[REGISTER] Registration successful for:', email);
    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'user created',
        data: {
          token,
          user: {
            id: newUser.id,
            isOnboarded: newUser.isOnboarded,
            onboardingSkipped: newUser.onboardingSkipped,
          },
        },
      },
      { status: STATUS.CREATED },
    );
  } catch (error) {
    console.error('[REGISTER] Error during registration:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { success: false, error: true, message: 'failed to create user' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
