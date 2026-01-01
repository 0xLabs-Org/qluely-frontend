// app/checkout/success/ClientSuccess.tsx
"use client";

import { useSearchParams } from 'next/navigation';

export default function ClientSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">✓ Payment Successful!</h1>
        <p className="text-xl text-slate-300 mb-8">Your subscription is now active. Welcome!</p>
        <div className="space-y-4">
          <a
            href="/signin"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Go to Sign in
          </a>
          <p className="text-slate-400 text-sm">Session ID: {sessionId}</p>
        </div>
      </div>
    </div>
  );
}
