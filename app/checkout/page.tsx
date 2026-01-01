"use client";
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [plan, setPlan] = useState('starter');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        window.location.href = `/signin?callbackUrl=/checkout`;
        return;
      }
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'Failed to create checkout');
      window.location.href = body.checkoutUrl;
    } catch (err: any) {
      alert(err?.message || 'Failed to start checkout');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 900, width: '100%', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <h1>Choose a plan</h1>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
              <input type="radio" name="plan" value="starter" checked={plan === 'starter'} onChange={() => setPlan('starter')} /> Starter — $5/mo
            </label>
            <label style={{ display: 'block', padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
              <input type="radio" name="plan" value="pro" checked={plan === 'pro'} onChange={() => setPlan('pro')} /> Pro — $15/mo
            </label>
            <label style={{ display: 'block', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
              <input type="radio" name="plan" value="premium" checked={plan === 'premium'} onChange={() => setPlan('premium')} /> Premium — $49/mo
            </label>
          </div>
        </div>

        <aside style={{ padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Summary</h3>
          <p>Plan: {plan}</p>
          <button disabled={loading} onClick={handlePay} style={{ marginTop: 12, width: '100%', padding: 10, background: '#0b74ff', color: '#fff', border: 'none' }}>{loading ? 'Redirecting...' : 'Pay'}</button>
        </aside>
      </div>
    </div>
  );
}
