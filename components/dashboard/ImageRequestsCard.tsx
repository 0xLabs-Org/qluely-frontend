'use client';

interface ImageRequestsCardProps {
  used: number;
  total: number;
}

export function ImageRequestsCard({ used, total }: ImageRequestsCardProps) {
  const remaining = Math.max(0, total - used);
  const usagePercent = total > 0 ? Math.min(Math.max((used / total) * 100, 0), 100) : 0;

  return (
    <div className="dash-card group">
      {/* Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="dash-card__label">Image Requests</span>
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>

      {/* Primary Value */}
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="dash-card__value">{used.toLocaleString()}</span>
        <span className="text-[14px] text-[var(--dash-text-muted)] font-medium">
          / {total.toLocaleString()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[5px] rounded-full bg-violet-500/10 mb-3">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-700 ease-out"
          style={{ width: `${usagePercent}%` }}
        />
      </div>

      {/* Context */}
      <p className="dash-card__context">{remaining.toLocaleString()} requests used</p>
    </div>
  );
}
