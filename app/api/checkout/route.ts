// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { validateCheckoutRequest } from '@/lib/validation';
import { logError } from '@/lib/logger';
import { buildReturnUrl, createCheckoutSession } from '@/lib/payments';
import { checkRateLimit } from '@/lib/rateLimit';
import { logInfo } from '@/lib/logger';
import { getTokenFromReq, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const securityHeaders = {
      'Content-Security-Policy': "default-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer'
    };

    // Basic rate limiting by IP to protect checkout endpoint
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rl = await checkRateLimit(`checkout:${ip}`, 20, 60_000);
    if (rl.limited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: securityHeaders });
    }

    // 1. Parse & validate request
    const body = await request.json();
    const validation = validateCheckoutRequest(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: securityHeaders });
    }

    const { plan } = validation.data;

    // Require authentication for checkout flow. If missing, instruct client to redirect to sign-in.
    const token = getTokenFromReq(request);
    const payload = token ? verifyToken(token) : null;
    if (!payload || !payload.sub) {
      const loginUrl = `/signin?return_to=${encodeURIComponent(`/checkout?plan=${plan}`)}`;
      return NextResponse.json({ error: 'auth_required', login_url: loginUrl }, { status: 401, headers: securityHeaders });
    }
    const userId = payload.sub as string;

    // 2. Get user & account
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: securityHeaders });
    }

    // Ensure there is an account record for this user (used to store external customer/sub IDs)
    let account = await prisma.account.findUnique({ where: { userId: user.id } });
    if (!account) {
      account = await prisma.account.create({ data: { userId: user.id } });
    }

    // 4. Get plan config
    const planConfig = getPlanConfig(plan);
    if (!planConfig || !planConfig.productId) {
      logError('Plan configuration missing or invalid', { plan });
      return NextResponse.json({ error: 'Invalid plan configuration' }, { status: 500, headers: securityHeaders });
    }

    // 5. Create a local checkout session first so we can include our session id
    //    in the return URL that the payment provider will redirect back to.
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // create a temporary unique placeholder for sessionId so prisma unique constraint is satisfied
    const tempSessionId = `local_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const localSession = await prisma.checkoutSession.create({
      data: {
        userId: user.id,
        sessionId: tempSessionId,
        // fill checkoutUrl after provider responds
        checkoutUrl: '',
        planSlug: plan,
        expiresAt
      }
    });

    // 6. Create checkout session with DodoPayments SDK (via lib/payments)
    let checkoutSession: { session_id: string; checkout_url: string } | null = null;
    try {
      checkoutSession = await createCheckoutSession(planConfig.productId, localSession.id, { quantity: 1, metadata: { plan_slug: plan } });
    } catch (err) {
      logError('createCheckoutSession failed:', err);
      // fallback to local return URL
      checkoutSession = {
        session_id: `sess_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        checkout_url: buildReturnUrl(localSession.id)
      };
    }

    // 7. Update local session with provider values
    await prisma.checkoutSession.update({
      where: { id: localSession.id },
      data: {
        sessionId: checkoutSession!.session_id,
        checkoutUrl: checkoutSession!.checkout_url
      }
    });

    logInfo('Checkout session created', { userId: user.id, sessionId: localSession.id });
    return NextResponse.json(
      {
        checkout_url: checkoutSession.checkout_url,
        session_id: localSession.id,
        expires_at: localSession.expiresAt.toISOString(),
        amount: {
          cents: planConfig.priceCents,
          currency: 'INR'
        }
      },
      { headers: securityHeaders }
    );

  } catch (error) {
    logError('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 });
  }
}

function getPlanConfig(plan: string) {
    const configs: Record<string, any> = {
    starter: {
      productId: env.DODO_PRODUCT_ID_STARTER!,
      priceCents: 14900
    },
    pro: {
      productId: env.DODO_PRODUCT_ID_PRO!,
      priceCents: 49900
    },
    premium: {
      productId: env.DODO_PRODUCT_ID_PREMIUM!,
      priceCents: 129900
    },
    enterprise: {
      productId: env.DODO_PRODUCT_ID_ENTERPRISE!,
      priceCents: 199900
    }
  };

  return configs[plan] || null;
}
