'use client';

import { Mic } from 'lucide-react';

interface AudioUsageCardProps {
    used: number;
    total: number;
}

export function AudioUsageCard({ used, total }: AudioUsageCardProps) {
    const remaining = Math.max(0, total - used);
    const usagePercent = total > 0 ? Math.min(Math.max((used / total) * 100, 0), 100) : 0;

    return (
        <div className="dash-card group">
            {/* Label */}
            <div className="flex items-center justify-between mb-4">
                <span className="dash-card__label">Audio Usage</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Mic className="size-4 text-indigo-500" strokeWidth={1.8} />
                </div>
            </div>

            {/* Primary Value */}
            <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="dash-card__value">{used.toLocaleString()}</span>
                <span className="text-[14px] text-[var(--dash-text-muted)] font-medium">
                    / {total.toLocaleString()} mins
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[5px] rounded-full bg-indigo-500/10 mb-3">
                <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${usagePercent}%` }}
                />
            </div>

            {/* Context */}
            <p className="dash-card__context">{remaining.toLocaleString()} minutes used</p>
        </div>
    );
}
