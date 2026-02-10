'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface CreditsCardProps {
  title: string;
  icon: ReactNode;
  credits: number;
  lastTopUp?: string;
}

export function CreditsCard({ title, icon, credits, lastTopUp }: CreditsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className="text-gray-400">{icon}</span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-gray-900">{credits.toLocaleString()}</span>
      </div>

      {lastTopUp && <p className="text-sm text-gray-500 mb-3">Last top-up: {lastTopUp}</p>}
    </div>
  );
}
