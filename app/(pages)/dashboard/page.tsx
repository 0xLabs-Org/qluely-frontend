// app/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { StatsCard, CreditsCard, PlanCard, UsageTrendsChart } from '@/components/dashboard';
import { AccountType, BillingCycle, UserDetails } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/storage';

// Icons
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CreditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Plan limits configuration
const PLAN_LIMITS: Record<AccountType, { audioMinutes: number; imageRequests: number }> = {
  [AccountType.FREE]: { audioMinutes: 5, imageRequests: 5 },
  [AccountType.BASIC]: { audioMinutes: 300, imageRequests: 50 },
  [AccountType.PRO]: { audioMinutes: 720, imageRequests: 100 },
  [AccountType.UNLIMITED]: { audioMinutes: 600, imageRequests: 2000 },
};

// Helper function to format relative time
const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';

  const now = new Date();
  const pastDate = new Date(date);
  const diffInMs = now.getTime() - pastDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return '1 week ago';
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 60) return '1 month ago';
  return `${Math.floor(diffInDays / 30)} months ago`;
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setDetailsLoading(true);
      setError(null);

      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('/api/v1/user/details', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        setUserDetails(data.data);
      } else {
        setError(data.message || 'Failed to fetch user details');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserDetails();
    }
  }, [user, fetchUserDetails]);

  if (authLoading || detailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-base text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  // Default values when data is not available
  const plan = userDetails?.plan || AccountType.FREE;
  const credits = userDetails?.creditsUsed;
  const creditsRemaining = userDetails?.creditsRemaining;
  const audioCredits = userDetails?.audioCredits;
  const ImageCredits = userDetails?.imageCredits;
  const TotalImageCredits = PLAN_LIMITS[plan].imageRequests;
  const period = userDetails?.period;
  const planStart = userDetails?.planStartedAt;
  const planEnd = userDetails?.planExpiresAt;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.email}!</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchUserDetails}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Meeting Credits"
              icon={<ClockIcon />}
              value={Number(credits)}
              total={Number(credits) + Number(creditsRemaining)}
              subtitle={'Total Credits'}
              progressColor="bg-blue-500"
              showProgress={false}
            />

            <StatsCard
              title="Image Requests"
              icon={<ImageIcon />}
              value={ImageCredits || 0}
              total={TotalImageCredits}
              subtitle={`${TotalImageCredits - Number(ImageCredits)} requests remaining`}
              progressColor="bg-orange-400"
              showProgress={false}
            />

            <CreditsCard
              title="Credits Balance"
              icon={<CreditIcon />}
              credits={Number(creditsRemaining)}
              lastTopUp={formatRelativeTime(planStart)}
            />

            <PlanCard plan={plan} renewsAt={userDetails?.planExpiresAt || null} isActive={true} />
          </div>

          {/* Usage Trends Chart */}
          <UsageTrendsChart />
        </div>
      </div>
    </div>
  );
}
