import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/zod/schema';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/helper/auth';
import { AccountType, STATUS } from '@/lib/types';

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
    // publish event to server (no auth required)
    try {
      console.log('[LOGIN] AUTH EVENT STARTED');
      let backendUrl = process.env.BACKEND_API_URL;
      if (!backendUrl) {
        console.warn('[LOGIN] BACKEND_API_URL not configured; skipping event publish');
      } else {
        // ensure URL has protocol
        if (!/^https?:\/\//i.test(backendUrl)) {
          backendUrl = `http://${backendUrl}`;
        }

        // fire-and-forget with timeout to avoid blocking the login flow
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch(`${backendUrl}/api/v1/web/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'LOGIN', email: user.email, id: user.id }),
          signal: controller.signal,
        })
          .then(async (res) => {
            clearTimeout(timeout);
            if (!res.ok) {
              const text = await res.text().catch(() => null);
              console.error('[LOGIN] Event publish failed:', res.status, text);
            } else {
              console.log('[LOGIN] AUTH EVENT COMPLETED');
            }
          })
          .catch((err) => {
            clearTimeout(timeout);
            if (err && err.name === 'AbortError') {
              console.error('[LOGIN] Event publish aborted due to timeout');
            } else {
              console.error(
                '[LOGIN] Error publishing event to backend:',
                err instanceof Error ? err.message : String(err),
              );
            }
          });
      }
    } catch (err) {
      console.error(
        '[LOGIN] Unexpected error in event publish block:',
        err instanceof Error ? err.message : String(err),
      );
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
