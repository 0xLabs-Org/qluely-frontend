// lib/payments.ts
export function buildReturnUrl(sessionId: string) {
  const base = process.env.DODO_PAYMENTS_RETURN_URL || '/checkout/success';
  try {
    const u = new URL(base, 'http://localhost');
    u.searchParams.set('session_id', sessionId);
    return u.toString();
  } catch (err) {
    return `${base}${base.includes('?') ? '&' : '?'}session_id=${encodeURIComponent(sessionId)}`;
  }
}
