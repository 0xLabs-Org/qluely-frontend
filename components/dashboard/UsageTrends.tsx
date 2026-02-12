'use client';

import { useState, useMemo } from 'react';

type Period = 'Daily' | 'Weekly' | 'Monthly';

interface UsageTrendsProps {
  data?: number[];
}

export function UsageTrends({ data }: UsageTrendsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Weekly');

  const chartData = useMemo(
    () => data ?? [35, 50, 45, 60, 55, 75, 55, 85, 90, 100, 55, 60, 65, 80, 65, 95, 70],
    [data],
  );
  const maxValue = Math.max(...chartData);

  // Calculate insight based on selectedPeriod and stable chartData
  const insight = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;

    const period = selectedPeriod;
    let periodLen = 7;
    let periodLabel = 'this week';
    if (period === 'Daily') {
      periodLen = 1;
      periodLabel = 'today';
    } else if (period === 'Monthly') {
      periodLen = 30;
      periodLabel = 'this month';
    }

    const len = chartData.length;
    if (len < periodLen + 1) return null; // not enough data to compare

    const sliceSum = (arr: number[], from: number, to: number) =>
      arr.slice(from, to).reduce((a, b) => a + b, 0);

    const currentPeriod = sliceSum(chartData, Math.max(0, len - periodLen), len);
    const prevPeriod = sliceSum(
      chartData,
      Math.max(0, len - periodLen * 2),
      Math.max(0, len - periodLen),
    );

    if (prevPeriod === 0) return null;
    const change = Math.round(((currentPeriod - prevPeriod) / prevPeriod) * 100);
    if (change > 0) return `Your meeting usage increased ${change}% ${periodLabel}.`;
    if (change < 0) return `Your meeting usage decreased ${Math.abs(change)}% ${periodLabel}.`;
    return `Your meeting usage is consistent ${periodLabel}.`;
  }, [chartData, selectedPeriod]);

  // Highlight the current period bar (last bar)
  const highlightIndex = chartData.length - 1;

  // Labels
  const getLabels = () => {
    const today = new Date();
    if (selectedPeriod === 'Daily') {
      return chartData.map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (chartData.length - 1 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      });
    }
    if (selectedPeriod === 'Weekly') {
      return chartData.map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (chartData.length - 1 - i) * 7);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      });
    }
    return chartData.map((_, i) => {
      const date = new Date(today);
      date.setMonth(date.getMonth() - (chartData.length - 1 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    });
  };

  const labels = getLabels();
  const showLabelEvery = Math.max(1, Math.ceil(chartData.length / 5));

  return (
    <div className="dash-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <span className="dash-card__label mb-1.5 block">Usage Trends</span>
          <h3 className="text-[17px] font-semibold text-[var(--dash-text-primary)] tracking-[-0.01em]">
            Meeting minutes over time
          </h3>
        </div>

        {/* Segmented control */}
        <div className="flex gap-0.5 p-[3px] rounded-lg bg-[var(--dash-elevated)] border border-[var(--dash-border)]">
          {(['Daily', 'Weekly', 'Monthly'] as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3.5 py-[6px] text-[12px] font-medium rounded-md transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-sm'
                  : 'text-[var(--dash-text-muted)] hover:text-[var(--dash-text-secondary)]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Insight */}
      {insight && (
        <div className="flex items-center gap-2 mb-6 mt-2">
          <div className="w-1 h-4 rounded-full bg-[var(--dash-accent)]" />
          <p className="text-[13px] text-[var(--dash-text-secondary)] font-medium">{insight}</p>
        </div>
      )}

      {/* Chart area */}
      <div className="relative h-56 mt-4">
        {/* Y-axis guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="flex items-center gap-2 w-full">
              <span className="text-[10px] text-[var(--dash-text-muted)] w-6 text-right font-mono tabular-nums">
                {Math.round((val / 100) * maxValue)}
              </span>
              <div className="flex-1 h-px bg-[var(--dash-border)] opacity-50" />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute left-8 right-0 top-0 bottom-0 flex items-end gap-[3px] pb-7">
          {chartData.map((value, index) => {
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const isHighlighted = index === highlightIndex;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end h-full group/bar relative"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--dash-text-primary)] text-white text-[10px] font-medium rounded-md whitespace-nowrap transition-opacity duration-150 pointer-events-none z-10">
                  {value} min
                </div>
                <div
                  className={`w-full max-w-[32px] rounded-t-[4px] transition-all duration-500 ease-out cursor-pointer ${
                    isHighlighted
                      ? 'bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-deep)]'
                      : 'bg-[var(--dash-accent)]/15 hover:bg-[var(--dash-accent)]/30'
                  }`}
                  style={{
                    height: `${Math.max(height, 2)}%`,
                    transitionDelay: `${index * 25}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-8 right-0 bottom-0 flex">
          {labels.map((label, index) => (
            <span
              key={index}
              className={`flex-1 text-center text-[10px] text-[var(--dash-text-muted)] font-mono tabular-nums ${
                index % showLabelEvery !== 0 && index !== labels.length - 1 ? 'invisible' : ''
              }`}
            >
              {index === labels.length - 1 ? 'Now' : label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
