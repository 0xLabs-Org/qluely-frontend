'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', coupon: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDesktopSource, setIsDesktopSource] = useState(false);

  // Check if user came from desktop app
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDesktopSource(params.get('source') === 'desktop');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare data, excluding empty coupon
      const submitData = {
        email: formData.email,
        password: formData.password,
        ...(formData.coupon.trim() && { coupon: formData.coupon.trim() }),
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

        // If user came from desktop app, redirect to desktop callback
        if (isDesktopSource) {
          console.log('Desktop source detected, redirecting to callback...');
          router.push(`/desktop-callback?token=${encodeURIComponent(token)}`);
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

          // Extract user data from API response (not from token)
          // The backend returns user info in data.data.user
          const userData = {
            id: data.data?.user?.id || payload.id || 'unknown',
            email: formData.email, // Use the email from the registration form since it's not in token
            accountType: payload.plan || payload.accountType || 'FREE',
            isOnboarded: data.data?.user?.isOnboarded || false,
            onboardingSkipped: data.data?.user?.onboardingSkipped || false,
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
            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code (Optional)
            </label>
            <input
              id="coupon"
              name="coupon"
              type="text"
              value={formData.coupon}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter coupon code"
            />
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
