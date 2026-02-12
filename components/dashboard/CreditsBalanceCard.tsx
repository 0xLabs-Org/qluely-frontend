'use client';

import Link from 'next/link';

interface CreditsBalanceCardProps {
  credits: number;
  lastAdded?: string;
}

export function CreditsBalanceCard({ credits, lastAdded }: CreditsBalanceCardProps) {
  return (
    <div className="dash-card group">
      {/* Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="dash-card__label">Credits Balance</span>
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34a07e"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M8 10c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2" />
          </svg>
        </div>
      </div>
      {/* Primary Value */}
      <div className="mb-1.5">
        <span className="dash-card__value">{credits.toLocaleString()}</span>
      </div>
      {/* Context */}
      {lastAdded && <p className="dash-card__context mb-4">Credits added {lastAdded}</p>}
    </div>
  );
}
