'use client';

import { useState } from 'react';

type Period = 'Daily' | 'Weekly' | 'Monthly';

interface UsageTrendsChartProps {
  data?: number[];
}

export function UsageTrendsChart({ data }: UsageTrendsChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Daily');

  // Sample data for demonstration - in a real app this would come from the API
  const chartData = data || [35, 50, 45, 60, 55, 75, 55, 85, 90, 100, 55, 60, 65, 80, 65, 95, 70];
  const maxValue = Math.max(...chartData);

  // Generate labels based on period
  const getLabels = () => {
    const today = new Date();
    if (selectedPeriod === 'Daily') {
      return chartData.map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (chartData.length - 1 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      });
    }
    return chartData.map((_, i) => `Week ${i + 1}`);
  };

  const labels = getLabels();
  const showLabelEvery = Math.ceil(chartData.length / 4);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Usage Trends</h3>
          <p className="text-sm text-gray-500">Meeting minutes processed over time</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['Daily', 'Weekly', 'Monthly'] as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2 pb-8">
          {chartData.map((value, index) => {
            const height = (value / maxValue) * 100;
            const isHighlighted = index === Math.floor(chartData.length * 0.6); // Highlight one bar

            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full max-w-[40px] rounded-t-md transition-all hover:opacity-80 ${
                    isHighlighted ? 'bg-blue-500' : 'bg-blue-200'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${value} minutes`}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between">
          {labels.map((label, index) => (
            <span
              key={index}
              className={`text-xs text-gray-500 flex-1 text-center ${
                index % showLabelEvery !== 0 && index !== labels.length - 1 ? 'invisible' : ''
              }`}
            >
              {index === labels.length - 1 ? 'Today' : label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
