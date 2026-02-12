'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';

function DesktopCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [deepLink, setDeepLink] = useState('');

  useEffect(() => {
    const handleDesktopRedirect = async () => {
      try {
        // Get the JWT token from URL params
        const token = searchParams.get('token');

        if (!token) {
          throw new Error('No authentication token provided');
        }

        // Call backend API directly (not through Next.js proxy)
        // The /api/v1/desktop endpoint is in the backend, not in Next.js
        const backendUrl = (() => {
          const envUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          if (process.env.NODE_ENV === 'production' && !envUrl) {
            throw new Error('NEXT_PUBLIC_BACKEND_API_URL must be set in production');
          }
          return envUrl || 'http://localhost:8080';
        })();
        const response = await fetch(`${backendUrl}/api/v1/desktop/auth-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Backend response:', errorData);
          throw new Error(errorData.message || 'Failed to generate desktop authentication token');
        }

        const data = await response.json();

        if (!data.success || !data.data.oneTimeToken) {
          throw new Error('Invalid response from server');
        }

        // Create deep link with one-time token
        const link = `qluely://auth/callback?token=${encodeURIComponent(data.data.oneTimeToken)}`;
        setDeepLink(link);
        setStatus('success');
        setMessage('Authentication successful! Redirecting to desktop app...');

        // Attempt automatic redirect
        setTimeout(() => {
          window.location.href = link;
        }, 1500);
      } catch (error) {
        console.error('Desktop redirect error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to redirect to desktop app');
      }
    };

    handleDesktopRedirect();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Qluely
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Success!</h2>
            <p className="text-gray-600">{message}</p>

            {deepLink && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">If the app didn't open automatically:</p>
                <a
                  href={deepLink}
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Open Desktop App
                </a>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            <p className="text-red-600">{message}</p>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href="/login"
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Back to Login
              </a>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function DesktopCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <DesktopCallbackContent />
    </Suspense>
  );
}
