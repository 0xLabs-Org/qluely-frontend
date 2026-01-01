// app/checkout/success/ClientSuccess.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 12; // 12 * 5s = 60s
    const id = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch('/api/payment-status');
        if (!res.ok) {
          setError('Failed to fetch payment status');
          clearInterval(id);
          return;
        }
        const body = await res.json();
        if (body.paymentStatus === 'succeeded' || body.paymentStatus === 'completed') {
          clearInterval(id);
          router.push('/dashboard');
          return;
        }
        if (attempts >= maxAttempts) {
          clearInterval(id);
          setError('Payment is taking longer than expected. Please check your dashboard later.');
        }
      } catch (err: any) {
        clearInterval(id);
        setError(err?.message || 'Polling error');
      }
    }, 5000);

    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">✓ Payment Successful!</h1>
        <p className="text-xl text-slate-300 mb-8">Your subscription is now active. Welcome!</p>
        <div className="space-y-4">
          {error ? (
            <div>
              <p style={{ color: 'orange' }}>{error}</p>
              <a href="/dashboard" className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded">Go to dashboard</a>
            </div>
          ) : (
            <p className="text-slate-300">Payment processing — we&apos;ll redirect when complete.</p>
          )}
          <p className="text-slate-400 text-sm">Session ID: {sessionId}</p>
        </div>
      </div>
    </div>
  );
}
