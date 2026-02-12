'use client';

import { useState, useMemo } from 'react';
import { AccountType } from '@/lib/types';
import { pay } from '@/lib/payment/pay';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface HeroPlanCardProps {
  plan: AccountType;
  creditsUsed: number;
  creditsRemaining: number;
  audioMinutesLimit: number;
  renewsAt: Date | null;
  isActive?: boolean;
}

const planDisplayNames: Record<AccountType, string> = {
  [AccountType.FREE]: 'Free',
  [AccountType.BASIC]: 'Basic',
  [AccountType.PRO]: 'Pro',
  [AccountType.UNLIMITED]: 'Unlimited',
};

const planBadgeStyles: Record<AccountType, string> = {
  [AccountType.FREE]: 'bg-slate-100 text-slate-600 border-slate-200',
  [AccountType.BASIC]: 'bg-blue-50 text-blue-700 border-blue-200',
  [AccountType.PRO]: 'bg-violet-50 text-violet-700 border-violet-200',
  [AccountType.UNLIMITED]: 'bg-amber-50 text-amber-700 border-amber-200',
};

const availablePlansForCurrent = (p: AccountType) => {
  if (p === AccountType.FREE) return [AccountType.BASIC, AccountType.PRO, AccountType.UNLIMITED];
  if (p === AccountType.BASIC) return [AccountType.PRO, AccountType.UNLIMITED];
  if (p === AccountType.PRO) return [AccountType.UNLIMITED];
  return [] as AccountType[];
};

export function HeroPlanCard({
  plan,
  creditsUsed,
  creditsRemaining,
  audioMinutesLimit,
  renewsAt,
  isActive = true,
}: HeroPlanCardProps) {
  const totalCredits = creditsUsed + creditsRemaining;
  const usagePercent = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;
  const showUpgrade = plan !== AccountType.UNLIMITED;

  // Upgrade state
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AccountType | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Compute health state
  const healthState = useMemo(() => {
    if (usagePercent >= 90)
      return { color: 'var(--dash-state-critical)', label: 'Critical', ringColor: '#dc6b6b' };
    if (usagePercent >= 70)
      return { color: 'var(--dash-state-warning)', label: 'Near limit', ringColor: '#d4a054' };
    return { color: 'var(--dash-accent)', label: 'Healthy', ringColor: '#3b7dd8' };
  }, [usagePercent]);

  // Estimate remaining meetings
  const estimatedMeetingsLeft = useMemo(() => {
    if (creditsRemaining <= 0) return 0;
    // Assume average meeting = 30 credits
    return Math.max(1, Math.floor(creditsRemaining / 30));
  }, [creditsRemaining]);

  // Predictive insight message
  const insightMessage = useMemo(() => {
    if (plan === AccountType.UNLIMITED) return 'Unlimited meetings — no limits in sight.';
    if (creditsRemaining <= 0) return "You've used all your meeting credits this period.";
    if (estimatedMeetingsLeft <= 2)
      return `~${estimatedMeetingsLeft} meeting${estimatedMeetingsLeft === 1 ? '' : 's'} remaining. Upgrade to stay uninterrupted.`;
    if (usagePercent >= 70)
      return `~${estimatedMeetingsLeft} meetings remaining. Consider upgrading soon.`;
    return `~${estimatedMeetingsLeft} meetings remaining this period.`;
  }, [plan, creditsRemaining, estimatedMeetingsLeft, usagePercent]);

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleUpgradeClick = () => {
    const avail = availablePlansForCurrent(plan);
    if (avail.length > 0) {
      setSelectedPlan(avail[0]);
    }
    setOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    try {
      await pay(
        currency,
        selectedPlan as 'BASIC' | 'PRO' | 'UNLIMITED',
        'MONTH',
        { upgradeFrom: plan, creditsUsed },
        () => window.location.reload(),
      );
      setOpen(false);
    } catch (error) {
      console.error('Payment failed', error);
    }
  };

  // SVG progress ring
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (usagePercent / 100) * ringCircumference;

  return (
    <div className="dash-card dash-card--hero relative overflow-hidden">
      {/* Subtle gradient accent — single gradient rule */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, var(--dash-accent) 0%, var(--dash-accent-deep) 50%, transparent 100%)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
        {/* Left: Ring + Plan info */}
        <div className="flex items-start gap-6">
          {/* Progress ring */}
          <div className="relative flex-shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={ringRadius}
                fill="none"
                stroke="var(--dash-border)"
                strokeWidth="7"
              />
              <circle
                cx="64"
                cy="64"
                r={ringRadius}
                fill="none"
                stroke={healthState.ringColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[var(--dash-text-primary)] tracking-tight">
                {Math.round(usagePercent)}%
              </span>
              <span className="text-[11px] text-[var(--dash-text-muted)] font-medium">used</span>
            </div>
          </div>

          {/* Plan details */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2.5">
              <span
                className={`text-[11px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-md border ${planBadgeStyles[plan]}`}
              >
                {planDisplayNames[plan]}
              </span>
              {isActive && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              )}
            </div>

            <h2 className="text-[22px] font-bold text-[var(--dash-text-primary)] tracking-[-0.02em] leading-tight">
              {planDisplayNames[plan]} Plan
            </h2>

            <p className="text-[13px] text-[var(--dash-text-secondary)] leading-relaxed max-w-sm">
              {insightMessage}
            </p>

            {renewsAt && (
              <p className="text-[12px] text-[var(--dash-text-muted)]">
                Renews {formatDate(renewsAt)}
              </p>
            )}
            {typeof audioMinutesLimit === 'number' && (
              <p className="text-[12px] text-[var(--dash-text-muted)]">
                Audio minutes limit:{' '}
                <span className="font-medium text-[var(--dash-text-primary)]">
                  {audioMinutesLimit} min
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Right: CTA */}
        {showUpgrade && (
          <div className="lg:ml-auto flex-shrink-0">
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <button
                  onClick={handleUpgradeClick}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--dash-text-primary)] text-white text-[13px] font-medium rounded-lg hover:opacity-90 transition-all duration-200"
                >
                  Upgrade plan
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  >
                    <path
                      d="M5.25 3.5L8.75 7L5.25 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Choose plan and currency</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select a target plan and currency to continue with checkout.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="mt-4">
                  <div className="mb-3 font-medium text-sm text-[var(--dash-text-secondary)]">
                    Plan
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availablePlansForCurrent(plan).map((p) => (
                      <label
                        key={p}
                        className={`p-3 border rounded-lg cursor-pointer flex items-center transition-all ${
                          selectedPlan === p
                            ? 'border-[var(--dash-accent)] bg-blue-50/50'
                            : 'border-[var(--dash-border)] hover:border-[var(--dash-text-muted)]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedPlan"
                          value={p}
                          checked={selectedPlan === p}
                          onChange={() => setSelectedPlan(p)}
                          className="mr-3 accent-[var(--dash-accent)]"
                        />
                        <span className="text-sm font-medium text-[var(--dash-text-primary)]">
                          {planDisplayNames[p]} Plan
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-5 mb-2 font-medium text-sm text-[var(--dash-text-secondary)]">
                    Currency
                  </div>
                  <div className="flex gap-2">
                    {['USD', 'INR'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c as 'USD' | 'INR')}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                          currency === c
                            ? 'bg-[var(--dash-text-primary)] text-white border-transparent'
                            : 'bg-white border-[var(--dash-border)] text-[var(--dash-text-secondary)] hover:border-[var(--dash-text-muted)]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePayment}>Continue to Payment</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}
