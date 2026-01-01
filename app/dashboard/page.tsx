"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const me = await fetch('/api/me');
      if (me.status === 401) return router.push('/signin?callbackUrl=/dashboard');
      const meJson = await me.json();
      setUser(meJson.user);

      const sub = await fetch('/api/subscription');
      if (sub.status === 401) return router.push('/signin?callbackUrl=/dashboard');
      const subJson = await sub.json();
      setSubscription(subJson.subscription || null);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 720, padding: 20, borderRadius: 8, border: '1px solid #eee' }}>
        <h1>Dashboard</h1>
        {user && (
          <div style={{ marginTop: 12 }}>
            <strong>{user.name || user.email}</strong>
            <div style={{ color: '#666' }}>{user.email}</div>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <h3>Subscription</h3>
          {subscription ? (
            <div>
              <div>Plan: {subscription.plan}</div>
              <div>Status: {subscription.status}</div>
              <div>Expires: {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleString() : '—'}</div>
            </div>
          ) : (
            <div>No active subscription. <a href="/checkout">Choose a plan</a></div>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <button onClick={handleSignOut} style={{ padding: '8px 12px', background: '#eee', border: 'none' }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}