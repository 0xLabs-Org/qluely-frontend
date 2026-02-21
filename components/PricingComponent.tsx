'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Box } from 'lucide-react';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';
import { NumberTicker } from './ui/number-ticker';
import { pay } from '@/lib/payment/pay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { STORAGE_KEYS } from '@/lib/storage';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export type PlanType = 'BASIC' | 'PRO' | 'FREE' | 'UNLIMITED';
export type CurrencyType = 'INR' | 'USD';
export type BillingCycle = 'MONTH' | 'YEAR';
export type PlanPricing = {
  MONTH: number;
  YEAR: number;
  yearlyDiscountValue?: number | null;
};

interface BackendPlan {
  id: string;
  name: PlanType;
  currency: CurrencyType;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  monthlyDiscount: number | null;
  yearlyDiscount: number | null;
}



const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  INR: '₹',
  USD: '$',
};
const plans = [
  {
    name: 'Starter',
    planKey: 'BASIC' as PlanType,
    description: 'Best for individuals getting started',
    icon: Sparkles,
    gradient: 'from-blue-50 to-indigo-50',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100',
    cta: 'Get Started',
    ctaStyle: 'outline',
    features: [
      '3 credits per month (1 credit = 1 hour)',
      'Unlimited chat',
      '60 image requests per month',
      'Audio usage consumes credits',
      'Standard compute queue',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    planKey: 'PRO' as PlanType,
    description: 'For professionals and regular users',
    popular: true,
    icon: Zap,
    gradient: 'from-amber-50 to-orange-50',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-100',
    cta: 'Upgrade to Pro',
    ctaStyle: 'solid',
    features: [
      '12 credits per month (1 credit = 1 hour)',
      'Unlimited chat',
      '100 image requests per month',
      'Audio usage consumes credits',
      'Priority compute queue',
      'Priority support',
    ],
  },
  {
    name: 'Unlimited',
    planKey: 'UNLIMITED' as PlanType,
    description: 'For daily and high-intensity users',
    icon: Box,
    gradient: 'from-purple-50 to-fuchsia-50',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    cta: 'Go Unlimited',
    ctaStyle: 'outline',
    features: [
      'Unlimited chat',
      'Unlimited images (fair use)',
      'Unlimited audio (fair use)',
      'Session throttling after heavy usage',
      'Dynamic priority enforcement',
      'Premium support',
    ],
  },
];

const calculateDiscount = (original: number, discounted: number) =>
  Math.round(((original - discounted) / original) * 100);

type PricingProps = { id?: string };

const PricingComponent = ({ id }: PricingProps) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<CurrencyType>('INR');
  const [userAccountType, setUserAccountType] = useState<string | null>(null);
  const [backendPlans, setBackendPlans] = useState<BackendPlan[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const res = await fetch('/api/v1/payment/plan');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setBackendPlans(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };
    fetchPaymentDetails();
  }, []);

  // Compute dynamic state from backend plans
  const dynamicPlanData = useMemo(() => {
    // Initial structure to prevent crashes before data loads
    const data: Record<string, Record<string, PlanPricing>> = {
      INR: {},
      USD: {},
    };

    backendPlans.forEach((bp) => {
      if (!data[bp.currency]) data[bp.currency] = {};
      data[bp.currency][bp.name] = {
        MONTH: bp.monthlyPrice,
        YEAR: bp.yearlyPrice,
        yearlyDiscountValue: bp.yearlyDiscount,
      };
    });

    return data;
  }, [backendPlans]);

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  // Safe localStorage check
  const getAuthToken = () => {
    try {
      // Check if we're on the client side
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
      }
      return null;
    } catch (error) {
      console.error('localStorage access error:', error);
      return null;
    }
  };

  // Get user account type from localStorage
  const getUserAccountType = () => {
    try {
      if (typeof window !== 'undefined') {
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          return userData.accountType || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing userData from localStorage:', error);
      return null;
    }
  };

  // Update account type on mount and when user changes
  useEffect(() => {
    const accountType = getUserAccountType();
    setUserAccountType(accountType);
    console.log('User account type:', accountType);
  }, [user]);

  console.log('PricingComponent - Auth state:', {
    user,
    isLoading,
    hasToken: getAuthToken() ? 'yes' : 'no',
    tokenValue: getAuthToken()?.substring(0, 20) + '...' || 'none',
  });

  return (
    <section
      id={id}
      className="py-20 px-4 sm:px-6 bg-[#F8FAFC] min-h-screen flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 mb-2">
              Flexible plans
            </h2>
            <h2 className="text-4xl sm:text-5xl font-light italic text-slate-600">
              for every need
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <p className="text-slate-500 max-w-sm text-sm text-left lg:text-right">
              Transparent pricing designed for sustainable AI usage.
            </p>

            <div className="flex gap-3">
              {/* Currency Toggle */}
              <div className="relative w-24 h-11 rounded-full border bg-white p-1 flex items-center">
                <div
                  className={cn(
                    'absolute top-1 left-1 h-9 w-1/2 rounded-full bg-blue-100 transition-all',
                    currency === 'USD' && 'translate-x-[90%]',
                  )}
                />
                <button
                  onClick={() => setCurrency('INR')}
                  className="relative z-10 w-1/2 text-sm font-medium"
                >
                  ₹
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className="relative z-10 w-1/2 text-sm font-medium"
                >
                  $
                </button>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="relative w-56 h-11 rounded-full border bg-white p-1 flex items-center">
                <div
                  className={cn(
                    'absolute top-1 left-1 h-9 w-1/2 rounded-full bg-green-100 transition-all',
                    billingCycle === 'yearly' && 'translate-x-[90%]',
                  )}
                />
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className="relative z-10 w-1/2 text-sm font-medium"
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className="relative z-10 w-1/2 text-sm font-medium"
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            const isCurrentPlan = userAccountType === plan.planKey;
            const isDisabled = (() => {
              if (!userAccountType) return false;
              const planOrder: Record<PlanType, number> = {
                FREE: 0,
                BASIC: 1,
                PRO: 2,
                UNLIMITED: 3,
              };
              const currentUserLevel = planOrder[userAccountType as PlanType] ?? 0;
              const targetPlanLevel = planOrder[plan.planKey];
              return targetPlanLevel <= currentUserLevel;
            })();

            const pricing = dynamicPlanData[currency]?.[plan.planKey];

            // Use backend values as base prices
            const baseMonthlyPrice = pricing?.MONTH ?? 0;
            const baseYearlyPrice = pricing?.YEAR ?? 0;

            const backendMatch = backendPlans.find(
              (bp) => bp.name === plan.planKey && bp.currency === currency,
            );

            const monthlyDiscount = backendMatch?.monthlyDiscount ?? 0;
            const yearlyDiscount = backendMatch?.yearlyDiscount ?? 0;

            const finalMonthlyPrice =
              monthlyDiscount > 0
                ? Math.round(baseMonthlyPrice * (1 - monthlyDiscount / 100))
                : baseMonthlyPrice;

            const finalYearlyPrice =
              yearlyDiscount > 0
                ? Math.round(baseYearlyPrice * (1 - yearlyDiscount / 100))
                : baseYearlyPrice;

            const monthlyEquivalent =
              billingCycle === 'yearly' ? Math.ceil(finalYearlyPrice / 12) : finalMonthlyPrice;

            const isPopular = backendMatch ? backendMatch.popular : plan.popular;
            const description = backendMatch ? backendMatch.description : plan.description;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={clsx(
                  'relative p-8 rounded-3xl border shadow-sm flex flex-col bg-linear-to-b hover:shadow-xl hover:-translate-y-1 transition-all',
                  plan.gradient,
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  isPopular && 'lg:-my-5 lg:py-20 lg:shadow-lg',
                )}
              >
                {isPopular && (
                  <div className="absolute top-6 right-6 bg-yellow-300 text-xs font-bold px-3 py-1.5 rounded-full">
                    Most popular
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-6`}
                >
                  <Icon size={28} className={plan.iconColor} />
                </div>

                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{description}</p>

                {/* Pricing */}
                {billingCycle === 'monthly' && (
                  <div className="mb-8">
                    {monthlyDiscount > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg line-through text-slate-400 font-normal">
                          {currencySymbol}
                          {baseMonthlyPrice}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          -{monthlyDiscount}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-semibold">
                        <NumberTicker
                          value={finalMonthlyPrice}
                          startValue={baseMonthlyPrice}
                          direction="up"
                        />{' '}
                        <span className="text-2xl font-semibold text-slate-900">
                          {currencySymbol}
                        </span>
                      </span>
                      <span className="text-slate-400">/ month</span>
                    </div>
                  </div>
                )}

                {billingCycle === 'yearly' && (
                  <div className="mb-8">
                    {yearlyDiscount > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg line-through text-slate-400 font-normal">
                          {currencySymbol}
                          {baseYearlyPrice}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          -{yearlyDiscount}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-5xl font-semibold">
                        <NumberTicker
                          value={finalYearlyPrice}
                          startValue={baseYearlyPrice}
                          direction="up"
                        />{' '}
                        <span className="text-2xl font-semibold text-slate-900">
                          {currencySymbol}
                        </span>
                      </span>
                      <span className="text-slate-400">/ year</span>
                    </div>
                    {finalYearlyPrice > 0 && (
                      <p className="text-sm text-slate-500 mb-2">
                        {currencySymbol}
                        {monthlyEquivalent} / month billed annually
                      </p>
                    )}
                    {yearlyDiscount > 0 && (
                      <p className="text-sm font-medium text-green-600">Save {yearlyDiscount}%</p>
                    )}
                  </div>
                )}

                {/* CTA */}
                {isDisabled ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-xl font-medium mb-8 bg-slate-200 text-slate-500 cursor-not-allowed"
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Already Subscribed'}
                  </button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className={clsx(
                          'w-full py-3.5 rounded-xl font-medium mb-8 cursor-pointer',
                          plan.ctaStyle === 'solid' ? 'bg-slate-900 text-white' : 'bg-white border',
                        )}
                      >
                        {plan.cta}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            // Check authentication state first
                            if (!user) {
                              console.log('User not authenticated, redirecting to login');
                              addToast(
                                'Please login to your account first to make a purchase.',
                                'error',
                              );
                              setTimeout(() => {
                                window.location.href = '/login';
                              }, 1500);
                              return;
                            }

                            // Double-check token exists in localStorage
                            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                            if (!token) {
                              console.log('No token found in localStorage');
                              addToast(
                                'Authentication token not found. Please login again.',
                                'error',
                              );
                              setTimeout(() => {
                                window.location.href = '/login';
                              }, 1500);
                              return;
                            }

                            try {
                              console.log(
                                'Starting payment process for authenticated user:',
                                user.email,
                              );

                              await pay(
                                currency,
                                plan.planKey as 'BASIC' | 'PRO' | 'UNLIMITED',
                                billingCycle === 'yearly' ? 'YEAR' : 'MONTH',
                              );
                            } catch (error: any) {
                              console.error('Payment error:', error);
                              if (error?.handled) return;
                              addToast(
                                error.message || 'Payment failed. Please try again.',
                                'error',
                              );
                            }
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Features */}
                <ul className="space-y-3 mt-auto">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <div
                        className={`h-5 w-5 rounded-full ${plan.iconBg} flex items-center justify-center`}
                      >
                        <Check size={12} className={plan.iconColor} />
                      </div>
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;
