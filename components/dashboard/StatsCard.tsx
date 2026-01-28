'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  icon: ReactNode;
  value: number;
  total?: number;
  subtitle: string;
  progressColor?: string;
  showProgress?: boolean;
}

export function StatsCard({
  title,
  icon,
  value,
  total,
  subtitle,
  progressColor = 'bg-blue-500',
  showProgress = true,
}: StatsCardProps) {
  const progress = total ? (value / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-gray-400">{icon}</span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</span>
        {total && <span className="text-gray-500 text-lg"> / {total.toLocaleString()}</span>}
      </div>

      {showProgress && total && (
        <div className="mb-2">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${progressColor}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
