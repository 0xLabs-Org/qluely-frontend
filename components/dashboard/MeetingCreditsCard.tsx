'use client';

import Link from 'next/link';
import { useMemo } from 'react';

interface MeetingCreditsCardProps {
    creditsUsed: number;
    creditsRemaining: number;
}

export function MeetingCreditsCard({ creditsUsed, creditsRemaining }: MeetingCreditsCardProps) {
    const total = creditsUsed + creditsRemaining;
    const usagePercent = total > 0 ? (creditsUsed / total) * 100 : 0;

    const healthState = useMemo(() => {
        if (usagePercent >= 90) return { barColor: 'var(--dash-state-critical)', bgColor: 'rgba(220,107,107,0.12)' };
        if (usagePercent >= 70) return { barColor: 'var(--dash-state-warning)', bgColor: 'rgba(212,160,84,0.12)' };
        return { barColor: 'var(--dash-accent)', bgColor: 'rgba(59,125,216,0.12)' };
    }, [usagePercent]);

    return (
        <div className="dash-card group">
            {/* Label */}
            <div className="flex items-center justify-between mb-4">
                <span className="dash-card__label">Meeting Credits</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: healthState.bgColor }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={healthState.barColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
            </div>

            {/* Primary Value */}
            <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="dash-card__value">{creditsUsed.toLocaleString()}</span>
                <span className="text-[14px] text-[var(--dash-text-muted)] font-medium">
                    / {total.toLocaleString()}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[5px] rounded-full mb-3" style={{ background: healthState.bgColor }}>
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${Math.min(usagePercent, 100)}%`,
                        backgroundColor: healthState.barColor,
                    }}
                />
            </div>

            {/* Context */}
            <p className="dash-card__context">
                {creditsRemaining.toLocaleString()} credits remaining
            </p>
        </div>
    );
}
