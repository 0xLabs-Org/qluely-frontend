// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DodoPayments } from 'dodopayments';
import { prisma } from '@/lib/prisma';
import { validateCheckoutRequest } from '@/lib/validation';
import { logError } from '@/lib/logger';
import { buildReturnUrl } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse & validate request
    const body = await request.json();
    const validation = validateCheckoutRequest(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { plan, userId } = validation.data;

    // 2. Get user & DodoPayments customer (require DB)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { dodoCustomer: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Create DodoPayments customer if doesn't exist
    let dodoCustomerId = user.dodoCustomer?.dodoCustomerId;
    const dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode') as any
    });

    if (!dodoCustomerId) {
      try {
        const customer: any = await dodoClient.customers.create({
          email: user.email,
          name: user.name || 'User',
          metadata: { app_user_id: user.id }
        } as any);

        dodoCustomerId = customer.id;

        await prisma.dodoCustomer.create({
          data: {
            userId: user.id,
            dodoCustomerId: customer.id,
            email: user.email,
            name: user.name
          }
        });
      } catch (err) {
        logError('Dodo customer creation failed:', err);
        return NextResponse.json({ error: 'Dodo customer creation failed' }, { status: 502 });
      }
    }

    // 4. Get plan config
    const planConfig = getPlanConfig(plan);
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 5. Create a local checkout session first so we can include our session id
    //    in the return URL that the payment provider will redirect back to.
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // create a temporary unique placeholder for dodoSessionId so prisma unique constraint is satisfied
    const tempDodoId = `local_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const localSession = await prisma.checkoutSession.create({
      data: {
        userId: user.id,
        dodoSessionId: tempDodoId,
        // fill checkoutUrl after provider responds
        checkoutUrl: '',
        planSlug: plan,
        expiresAt
      }
    });

    // 6. Create checkout session with DodoPayments
    let checkoutSession: any;
    try {
      checkoutSession = await dodoClient.checkoutSessions.create({
        customer: { customer_id: dodoCustomerId! },
        product_cart: [
          {
            product_id: planConfig.productId,
            quantity: 1
          }
        ],
        return_url: buildReturnUrl(localSession.id),
        metadata: {
          plan_slug: plan,
          app_user_id: user.id
        }
      });
    } catch (err) {
      // If provider creation fails, remove the local session to avoid dangling records
      logError('Dodo checkout session creation failed:', err);
      await prisma.checkoutSession.delete({ where: { id: localSession.id } }).catch(() => {});
      const message = (err && (err as any).message) ? (err as any).message : 'Dodo checkout creation failed';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    // 7. Update local session with provider values
    await prisma.checkoutSession.update({
      where: { id: localSession.id },
      data: {
        dodoSessionId: checkoutSession.session_id,
        checkoutUrl: checkoutSession.checkout_url
      }
    });

    return NextResponse.json({
      checkout_url: checkoutSession.checkout_url,
      session_id: localSession.id,
      expires_at: localSession.expiresAt.toISOString(),
      amount: {
        cents: planConfig.priceCents,
        currency: 'INR'
      }
    });

  } catch (error) {
    logError('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 });
  }
}

function getPlanConfig(plan: string) {
  const configs: Record<string, any> = {
    starter: {
      productId: process.env.DODO_PRODUCT_ID_STARTER!,
      priceCents: 14900
    },
    pro: {
      productId: process.env.DODO_PRODUCT_ID_PRO!,
      priceCents: 49900
    },
    premium: {
      productId: process.env.DODO_PRODUCT_ID_PREMIUM!,
      priceCents: 129900
    },
    enterprise: {
      productId: process.env.DODO_PRODUCT_ID_ENTERPRISE!,
      priceCents: 199900
    }
  };

  return configs[plan] || null;
}
