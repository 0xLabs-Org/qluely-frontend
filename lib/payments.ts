// lib/payments.ts
import { env } from './env';

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
