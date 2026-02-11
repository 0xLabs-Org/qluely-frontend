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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34a07e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            {lastAdded && (
                <p className="dash-card__context mb-4">
                    Credits added {lastAdded}
                </p>
            )}

            {/* Action */}
            <div className="mt-auto pt-2">
                <Link
                    href="/payment"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--dash-accent)] hover:text-[var(--dash-accent-deep)] transition-colors duration-200 group/link"
                >
                    Add credits
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="group-hover/link:translate-x-0.5 transition-transform duration-200"
                    >
                        <path
                            d="M5.25 3.5L8.75 7L5.25 10.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
