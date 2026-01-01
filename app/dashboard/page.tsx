// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';

export default function DashboardRedirect() {
  useEffect(() => {
    // Immediately route to sign-in since dashboard is not available.
    if (typeof window !== 'undefined') {
      window.location.href = '/signin';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-base text-gray-600">Redirecting to sign-in...</p>
    </div>
  );
}