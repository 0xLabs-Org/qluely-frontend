// app/(pages)/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  DashboardNav,
  HeroPlanCard,
  MeetingCreditsCard,
  CreditsBalanceCard,
  ImageRequestsCard,
  UsageTrends,
} from '@/components/dashboard';
import { AccountType, UserDetails } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/storage';

// Plan limits configuration
const PLAN_LIMITS: Record<AccountType, { audioMinutes: number; imageRequests: number }> = {
  [AccountType.FREE]: { audioMinutes: 5, imageRequests: 5 },
  [AccountType.BASIC]: { audioMinutes: 200, imageRequests: 200 },
  [AccountType.PRO]: { audioMinutes: 800, imageRequests: 800 },
  [AccountType.UNLIMITED]: { audioMinutes: 1200, imageRequests: 1200 },
};

// Helper function to format relative time
const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  const now = new Date();
  const pastDate = new Date(date);
  const diffInMs = now.getTime() - pastDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return '1 week ago';
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 60) return '1 month ago';
  return `${Math.floor(diffInDays / 30)} months ago`;
};

// Time-aware greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// --- Loading skeleton ---
function DashboardSkeleton() {
  return (
    <div className="dash-page">
      <div className="sticky top-0 z-40 w-full border-b border-[var(--dash-border)] bg-[var(--dash-surface)]/80 backdrop-blur-xl h-[60px]" />
      <div className="dash-container">
        {/* Greeting skeleton */}
        <div className="dash-greeting">
          <div className="dash-skeleton h-7 w-64 mb-2" />
          <div className="dash-skeleton h-4 w-44" />
        </div>

        {/* Hero skeleton */}
        <div className="dash-section--lg">
          <div className="dash-skeleton h-44 w-full rounded-2xl" />
        </div>

        {/* Metrics skeleton */}
        <div className="dash-grid-metrics dash-section--lg">
          <div className="dash-skeleton h-40 rounded-xl" />
          <div className="dash-skeleton h-40 rounded-xl" />
          <div className="dash-skeleton h-40 rounded-xl" />
        </div>

        {/* Chart skeleton */}
        <div className="dash-skeleton h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
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

      if (response.status === 401) {
        logout();
        return;
      }

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
  }, [logout]);

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

  // Show premium skeleton while loading
  if (authLoading || detailsLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="dash-page flex items-center justify-center">
        <p className="text-[14px] text-[var(--dash-text-muted)]">Redirecting to login...</p>
      </div>
    );
  }

  // Derive values
  const plan = userDetails?.plan || AccountType.FREE;

  // Meeting Credits
  const creditsUsed = Number(userDetails?.creditsUsed) || 0;
  const creditsRemaining = Number(userDetails?.creditsRemaining) || 0;

  // Limits help
  const audioMinutesLimit = PLAN_LIMITS[plan].audioMinutes;

  // Image Requests
  const totalImageCredits = PLAN_LIMITS[plan].imageRequests;
  const imageCreditsUsed = Number(userDetails?.imageCredits) || 0;

  const planStart = userDetails?.planStartedAt;
  const displayName = user.email?.split('@')[0] || 'there';

  return (
    <div className="dash-page">
      <DashboardNav />

      <div className="dash-container">
        {/* Greeting */}
        <div className="dash-greeting dash-fade-in">
          <h1 className="dash-greeting__title">
            {getGreeting()}, {displayName}
          </h1>
          <p className="dash-greeting__subtitle">
            Here&apos;s how your AI assistant is performing.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="dash-section dash-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--dash-state-critical)]/20 bg-[var(--dash-state-critical)]/5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--dash-state-critical)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[13px] text-[var(--dash-state-critical)] flex-1">{error}</p>
              <button
                onClick={fetchUserDetails}
                className="text-[13px] font-medium text-[var(--dash-state-critical)] hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* 1. Hero Plan Card (Primary) */}
        <div className="dash-section--lg dash-fade-in dash-fade-in-delay-1">
          <HeroPlanCard
            plan={plan}
            creditsUsed={creditsUsed}
            creditsRemaining={creditsRemaining}
            audioMinutesLimit={audioMinutesLimit}
            renewsAt={userDetails?.planExpiresAt || null}
            isActive={true}
          />
        </div>

        {/* 2. Metric Cards Grid */}
        <div className="dash-grid-metrics dash-section--lg">
          <div className="dash-fade-in dash-fade-in-delay-2">
            <MeetingCreditsCard
              creditsUsed={creditsUsed}
              creditsRemaining={creditsRemaining}
            />
          </div>
          <div className="dash-fade-in dash-fade-in-delay-3">
            <CreditsBalanceCard
              credits={creditsRemaining}
              lastAdded={formatRelativeTime(planStart) || undefined}
            />
          </div>
          <div className="dash-fade-in dash-fade-in-delay-4">
            <ImageRequestsCard
              used={imageCreditsUsed}
              total={totalImageCredits}
            />
          </div>
        </div>

        {/* 3. Usage Trends (Contextual Insight) */}
        <div className="dash-fade-in dash-fade-in-delay-5">
          <UsageTrends />
        </div>
      </div>
    </div>
  );
}
