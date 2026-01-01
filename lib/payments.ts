// lib/payments.ts
import { env } from './env';
import { dodoClient } from './dodo-client';

export function buildReturnUrl(sessionId: string) {
  const base = env.DODO_PAYMENTS_RETURN_URL || '/checkout/success';
  // If base is a full URL, use it directly; otherwise, prefix with NEXT_PUBLIC_BASE_URL (or localhost)
  const host = env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const u = new URL(base, host);
    u.searchParams.set('session_id', sessionId);
    return u.toString();
  } catch (err) {
    return `${host}${base}${base.includes('?') ? '&' : '?'}session_id=${encodeURIComponent(sessionId)}`;
  }
}

export async function createCheckoutSession(productId: string, localSessionId: string, opts?: { quantity?: number; metadata?: Record<string, any> }) {
  const quantity = opts?.quantity ?? 1;
  const metadata = { ...(opts?.metadata || {}), local_session_id: localSessionId };
  const return_url = buildReturnUrl(localSessionId);

  // Use SDK-only to create checkout session
  const resp: any = await dodoClient.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity
      }
    ],
    return_url,
    metadata
  });

  // Normalize response
  return {
    session_id: resp.session_id || resp.id || resp.data?.id,
    checkout_url: resp.checkout_url || resp.checkoutUrl || resp.url || return_url
  };
}
