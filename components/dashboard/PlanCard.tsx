'use client';

import Link from 'next/link';
import { AccountType } from '@/lib/types';

interface PlanCardProps {
  plan: AccountType;
  renewsAt: Date | null;
  isActive?: boolean;
}

const planNames: Record<AccountType, string> = {
  [AccountType.FREE]: 'Free Plan',
  [AccountType.BASIC]: 'Basic Plan',
  [AccountType.PRO]: 'Pro Plan',
  [AccountType.UNLIMITED]: 'Unlimited Plan',
};

export function PlanCard({ plan, renewsAt, isActive = true }: PlanCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const showUpgrade = plan !== AccountType.UNLIMITED;

  return (
    <div className="bg-green-50 rounded-xl border border-blue-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-green-800">Current Plan</span>
        {isActive && <span className="text-sm font-medium text-green-800">Active</span>}
      </div>

      <div className="mb-1">
        <span className="text-xl font-bold text-gray-900">{planNames[plan]}</span>
      </div>

      {renewsAt && <p className="text-sm text-gray-600 mb-4">Renews on {formatDate(renewsAt)}</p>}

      {showUpgrade && (
        <Link
          href="/payment"
          className="block w-full bg-blue-600 text-white text-center py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Upgrade to Unlimited
        </Link>
      )}
    </div>
  );
}
