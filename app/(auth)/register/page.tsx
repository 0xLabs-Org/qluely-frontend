'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', referralCode: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDesktopSource, setIsDesktopSource] = useState(false);
  const [showReferral, setShowReferral] = useState<boolean>(false);
  // Check if user came from desktop app and pre-fill referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDesktopSource(params.get('source') === 'desktop');
    const code = params.get('referralcode') || params.get('referralCode');
    if (code) {
      setFormData((prev) => ({ ...prev, referralCode: code.trim().toUpperCase() }));
      setShowReferral(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare data, excluding empty referral code
      const submitData = {
        email: formData.email,
        password: formData.password,
        ...(formData.referralCode.trim() && { referralCode: formData.referralCode.trim().toUpperCase() }),
      };

      localStorage.removeItem('token');

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Register response data:', data);

      if (data.success) {
        // Check if token exists
        const token = data.data?.token || data.token;
        if (!token) {
          throw new Error('No token received from server');
        }

        console.log('Received token:', token.substring(0, 30) + '...');

        // If user came from desktop app, store token out-of-band and navigate
        // without exposing the token in the URL/history. The desktop callback
        // will read and remove the token from sessionStorage.
        if (isDesktopSource) {
          try {
            sessionStorage.setItem('desktop_auth_token', token);
          } catch (e) {
            console.warn('Failed to write desktop token to sessionStorage', e);
          }
          console.log('Desktop source detected, redirecting to callback...');
          router.replace('/desktop-callback');
          return;
        }

        // Normal web flow - decode JWT token to extract user information
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }

          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('JWT payload:', payload);

          // Extract user data from API response (not from token).
          // Normalize API envelopes: prefer `data.data.userId` or `data.data.user.id`,
          // then the decoded token `payload.id`, falling back to a safe default.
          const userData = {
            id: data.data?.userId || data.data?.user?.id || payload.id || 'unknown',
            email: formData.email, // Use the email from the registration form since it's not in token
            accountType: payload.plan || payload.accountType || 'FREE',
            isOnboarded: (data.data?.isOnboarded ?? data.data?.user?.isOnboarded) || false,
            onboardingSkipped:
              (data.data?.onboardingSkipped ?? data.data?.user?.onboardingSkipped) || false,
          };

          console.log('Extracted user data:', userData);
          login(token, userData);

          // Redirect to onboarding for new users
          router.push('/onboarding');
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
          throw new Error('Invalid token received from server');
        }
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join us today! Please fill in the details below.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Switch
                id="referral-toggle"
                checked={showReferral}
                onCheckedChange={(val) => {
                  setShowReferral(Boolean(val));
                  if (!val) setFormData((prev) => ({ ...prev, referralCode: '' }));
                }}
              />
            </div>

            {showReferral && (
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                value={formData.referralCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="Enter referral code (e.g. AB3X9KZ2)"
                maxLength={16}
              />
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
