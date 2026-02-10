'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AccountType } from '@/lib/types';
import { Button } from '../ui/button';
import { pay } from '@/lib/payment/pay';
import { useAuth } from '@/contexts/AuthContext';
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

interface PlanCardProps {
  plan: AccountType;
  renewsAt: Date | null;
  isActive?: boolean;
}

const planNames: Record<AccountType, string> = {
  [AccountType.FREE]: 'Free Plan',
  [AccountType.BASIC]: 'Basic Plan',
  [AccountType.PRO]: 'Pro Plan',
  [AccountType.UNLIMITED]: 'Unlimited Plan',
};

export function PlanCard({ plan, renewsAt, isActive = true }: PlanCardProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AccountType | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [extras, setExtras] = useState<Record<string, any> | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const showUpgrade = plan !== AccountType.UNLIMITED;

  const availablePlansForCurrent = (p: AccountType) => {
    if (p === AccountType.FREE) return [AccountType.BASIC, AccountType.PRO, AccountType.UNLIMITED];
    if (p === AccountType.BASIC) return [AccountType.PRO, AccountType.UNLIMITED];
    if (p === AccountType.PRO) return [AccountType.UNLIMITED];
    return [] as AccountType[];
  };

  return (
    <div className="bg-green-50 rounded-xl border border-blue-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-green-800">Current Plan</span>
        {isActive && <span className="text-sm font-medium text-green-800">Active</span>}
      </div>

      <div className="mb-1">
        <span className="text-xl font-bold text-gray-900">{planNames[plan]}</span>
      </div>

      {renewsAt && <p className="text-sm text-gray-600 mb-4">Renews on {formatDate(renewsAt)}</p>}

      {showUpgrade && (
        <>
          <AlertDialog open={open} onOpenChange={(v) => setOpen(v)}>
            <AlertDialogTrigger asChild>
              <Button
                className="block w-full bg-blue-600 text-white text-center py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                onClick={async () => {
                  try {
                    // fetch server-side user details to decide upgrade charges
                    const resp = await fetch('/api/v1/user/details', {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                      },
                    });
                    const details = resp.ok ? await resp.json() : null;

                    const currentPlan = (details && details.data && details.data.plan) || 'FREE';
                    const creditsUsed =
                      details && details.data && typeof details.data.creditsUsed === 'number'
                        ? details.data.creditsUsed
                        : 0;

                    setExtras({ upgradeFrom: currentPlan, creditsUsed });
                    const avail = availablePlansForCurrent(currentPlan as AccountType);
                    setSelectedPlan(avail.length > 0 ? avail[0] : AccountType.UNLIMITED);
                    setCurrency('USD');
                  } catch (error: any) {
                    console.error('Payment error:', error);
                  }
                }}
              >
                Upgrade to Unlimited
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Choose plan and currency</AlertDialogTitle>
                <AlertDialogDescription>
                  Select a target plan and currency to continue with checkout.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="mt-4">
                <div className="mb-3 font-medium">Plan</div>
                <div className="grid grid-cols-1 gap-2">
                  {availablePlansForCurrent(plan).map((p) => (
                    <label
                      key={p}
                      className={`p-3 border rounded-lg cursor-pointer ${selectedPlan === p ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <input
                        type="radio"
                        name="selectedPlan"
                        value={p}
                        checked={selectedPlan === p}
                        onChange={() => setSelectedPlan(p)}
                        className="mr-2"
                      />
                      {planNames[p]}
                    </label>
                  ))}
                </div>

                <div className="mt-4 mb-2 font-medium">Currency</div>
                <div className="flex gap-2">
                  {['USD', 'INR'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c as 'USD' | 'INR')}
                      className={`px-3 py-1 rounded-lg border ${currency === c ? 'bg-blue-600 text-white' : 'bg-white'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      if (!selectedPlan) return;
                      // ensure extras are available; refetch if not
                      let usedExtras = extras;
                      if (!usedExtras) {
                        const resp = await fetch('/api/v1/user/details', {
                          method: 'GET',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                          },
                        });
                        const details = resp.ok ? await resp.json() : null;
                        const currentPlan =
                          (details && details.data && details.data.plan) || 'FREE';
                        const creditsUsed =
                          details && details.data && typeof details.data.creditsUsed === 'number'
                            ? details.data.creditsUsed
                            : 0;
                        usedExtras = { upgradeFrom: currentPlan, creditsUsed };
                      }

                      await pay(
                        currency,
                        selectedPlan as 'BASIC' | 'PRO' | 'UNLIMITED',
                        'MONTH',
                        usedExtras as any,
                      );
                      setOpen(false);
                    } catch (err: any) {
                      console.error('Checkout failed', err);
                    }
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
