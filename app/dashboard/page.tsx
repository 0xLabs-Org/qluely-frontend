// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  // TODO: Implement authentication and data fetching

  useEffect(() => {
    // Fetch user subscription data
    // Minimal demo: check if session exists by calling a lightweight endpoint
    (async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          // no-op; in a real app you'd fetch `/api/me` or similar
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-8 max-w-4xl">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Current Plan</h2>
          <p className="text-slate-300 mb-4">
            {user?.subscriptionTier?.toUpperCase() || 'FREE'}
          </p>
          <div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => window.location.href = '/'}
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Billing</h2>
          <p className="text-slate-300">Next billing: TBD</p>
        </div>
      </div>
    </div>
  );
}