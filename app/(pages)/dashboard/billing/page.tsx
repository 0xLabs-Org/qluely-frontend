'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Zap,
  Box,
  Layers,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Clock,
  BarChart3,
  ChevronRight,
  TrendingUp,
  Cpu,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pay } from '@/lib/payment/pay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { NumberTicker } from '@/components/ui/number-ticker';

type PlanType = 'FREE' | 'BASIC' | 'PRO' | 'UNLIMITED' | 'SCALE' | 'ENTERPRISE';
type CurrencyType = 'INR' | 'USD';

interface Plan {
  id: string;
  name: PlanType;
  currency: CurrencyType;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyDiscount: number | null;
  yearlyDiscount: number | null;
  popular: boolean;
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currency, setCurrency] = useState<CurrencyType>('INR');
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/v1/payment/plan');
        const data = await res.json();
        if (data.success) {
          setPlans(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  const getUserPlan = () => {
    return (user as any)?.plan || user?.accountType;
  };

  const isCurrent = (planName: string) => planName === getUserPlan();

  const handleUpgrade = async (plan: PlanType) => {
    if (isCurrent(plan)) return; // Prevent upgrade if plan is disabled

    try {
      // Find the specific plan object for the current currency
      const targetPlan = plans.find((p) => p.name === plan && p.currency === currency);
      if (!targetPlan) {
        addToast('Plan details not found.', 'error');
        return;
      }

      await pay(
        currency,
        plan as 'BASIC' | 'PRO' | 'UNLIMITED', // Adjust types if necessary
        billingCycle === 'yearly' ? 'YEAR' : 'MONTH',
        {},
        () => {
          addToast('Upgrade successful!', 'success');
          window.location.reload();
        },
        (err) => {
          addToast(err.message || 'Payment failed', 'error');
        },
      );
    } catch (error: any) {
      addToast(error.message || 'An unexpected error occurred', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {/* Currency Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-100 p-0.5">
              <button
                onClick={() => setCurrency('USD')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold transition-all',
                  currency === 'USD'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold transition-all',
                  currency === 'INR'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                INR
              </button>
            </div>

            <div className="flex rounded-xl overflow-hidden border border-slate-100 p-0.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold transition-all',
                  billingCycle === 'monthly'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold transition-all',
                  billingCycle === 'yearly'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-400 hover:text-slate-600',
                )}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Main Pricing Cards: Starter, Pro, Unlimited */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(() => {
                  const starterPlan = plans.find(
                    (p) => p.name === 'BASIC' && p.currency === currency,
                  );
                  const proPlan = plans.find((p) => p.name === 'PRO' && p.currency === currency);
                  const unlimitedPlan = plans.find(
                    (p) => p.name === 'UNLIMITED' && p.currency === currency,
                  );

                  const getPlanInfo = (p: any) => {
                    if (!p) return { price: 0, original: 0, discount: 0 };
                    const original = billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
                    const discount =
                      (billingCycle === 'yearly' ? p.yearlyDiscount : p.monthlyDiscount) || 0;
                    const price =
                      discount > 0 ? Math.round(original * (1 - discount / 100)) : original;
                    return { price, original, discount };
                  };

                  const sInfo = getPlanInfo(starterPlan);
                  const pInfo = getPlanInfo(proPlan);
                  const uInfo = getPlanInfo(unlimitedPlan);

                  return (
                    <>
                      <PlanCard
                        name="Starter"
                        description="Best for individuals getting started."
                        price={sInfo.price}
                        originalPrice={sInfo.original}
                        discount={sInfo.discount}
                        currency={currency}
                        period={billingCycle}
                        valueText={
                          currency === 'USD'
                            ? billingCycle == 'monthly'
                              ? 'Worth of $19/m'
                              : 'Worth of $229/m'
                            : billingCycle == 'monthly'
                              ? 'Worth of ₹1499/m'
                              : 'Worth of ₹17999/m'
                        }
                        features={[
                          { label: 'Advanced hide screen mode', icon: ShieldCheck },
                          { label: '600+ chat responses', icon: MessageSquare },
                          { label: '200 image analysis', icon: Box },
                          { label: '200 minutes of audio transcription', icon: Cpu },
                          { label: 'Standard processing speed', icon: TrendingUp },
                          { label: 'Full access to premium AI models', icon: Zap },
                        ]}
                        cta="Get Started"
                        gradient="from-slate-600 via-slate-500 to-slate-400"
                        onUpgrade={() => handleUpgrade('BASIC')}
                        isCurrent={isCurrent('BASIC')}
                      />

                      <PlanCard
                        name="Pro"
                        description="For professionals and regular users."
                        price={pInfo.price}
                        originalPrice={pInfo.original}
                        discount={pInfo.discount}
                        currency={currency}
                        period={billingCycle}
                        valueText={
                          currency === 'USD'
                            ? billingCycle == 'monthly'
                              ? 'Worth of $29/m'
                              : 'Worth of $359/m'
                            : billingCycle == 'monthly'
                              ? 'Worth of ₹2499/m'
                              : 'Worth of ₹29999/m'
                        }
                        popular
                        features={[
                          { label: 'Advanced hide screen mode', icon: ShieldCheck },
                          { label: 'Unlimited chat responses', icon: MessageSquare },
                          { label: '500 image analyses per month', icon: Box },
                          { label: '500 minutes of audio transcription', icon: Cpu },
                          { label: 'Priority processing speed', icon: TrendingUp },
                          { label: 'Full access to premium AI models', icon: Zap },
                        ]}
                        cta="Upgrade to Pro"
                        gradient="from-blue-600 via-indigo-500 to-cyan-400"
                        onUpgrade={() => handleUpgrade('PRO')}
                        isCurrent={isCurrent('PRO')}
                      />

                      <PlanCard
                        name="Unlimited"
                        description="For daily and high-intensity users."
                        price={uInfo.price}
                        originalPrice={uInfo.original}
                        discount={uInfo.discount}
                        currency={currency}
                        period={billingCycle}
                        valueText={
                          currency === 'USD'
                            ? billingCycle == 'monthly'
                              ? 'Worth of $59/m'
                              : 'Worth of $699/m'
                            : billingCycle == 'monthly'
                              ? 'Worth of ₹4199/m'
                              : 'Worth of ₹49999/m'
                        }
                        features={[
                          { label: 'Unlimited chat', icon: MessageSquare },
                          { label: 'Unlimited images (fair use)', icon: Box },
                          { label: 'Unlimited audio (fair use)', icon: Zap },
                          { label: 'Dynamic priority enforcement', icon: TrendingUp },
                          { label: 'Premium support', icon: ShieldCheck },
                          { label: 'Session throttling after heavy use', icon: Clock },
                        ]}
                        cta="Go Unlimited"
                        gradient="from-purple-600 via-violet-500 to-fuchsia-400"
                        onUpgrade={() => handleUpgrade('UNLIMITED')}
                        isCurrent={isCurrent('UNLIMITED')}
                      />
                    </>
                  );
                })()}
              </div>

              {/* Free Plan at the bottom */}
              <div className="w-full">
                <div className="relative group overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />

                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl">
                          <Rocket size={20} className="text-slate-900" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Free</h3>
                      </div>
                      <p className="text-slate-500 max-w-md">
                        Experience the power of Qluely with our basic features. Perfect for students
                        and curious builders.
                      </p>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Check size={16} className="text-green-500" />
                          15 chat requests
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Check size={16} className="text-green-500" />5 image requests
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Check size={16} className="text-green-500" />5 minutes live audio
                          transcription
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          {currency === 'INR' ? '₹' : '$'}0
                        </span>
                        <span className="text-slate-400 text-sm font-medium">/month</span>
                      </div>
                      <button
                        disabled={true}
                        className={cn(
                          'mt-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 border-2',

                          'bg-white text-slate-900 border-slate-900 hover:bg-slate-900 hover:text-white',
                        )}
                      >
                        Current Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'usage' && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                <BarChart3 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detailed Usage</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Detailed token and request usage analytics will be available here soon.
                </p>
              </div>
              <button className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                View simple stats in dashboard <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 bg-slate-50 text-slate-600 rounded-full">
                <History size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">No Invoices Yet</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  When you make a purchase, your invoices and receipts will appear here.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('plans')}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all"
              >
                Explore Plans
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div >
  );
}

interface PlanCardProps {
  name: string;
  description: string;
  price: number | string;
  originalPrice?: number;
  discount?: number;
  currency: CurrencyType;
  period: 'monthly' | 'yearly';
  valueText?: string;
  features: { label: string; icon: any }[];
  cta: string;
  gradient: string;
  popular?: boolean;
  onUpgrade: () => void;
  isCurrent?: boolean;
}

function PlanCard({
  name,
  description,
  price,
  originalPrice,
  discount,
  currency,
  period,
  valueText,
  features,
  cta,
  gradient,
  popular,
  onUpgrade,
  isCurrent = false,
}: PlanCardProps) {
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div
      className={cn(
        'relative flex flex-col h-full rounded-[2.5rem] bg-white text-slate-900 p-8 overflow-hidden group border border-slate-200 shadow-xl transition-all duration-500 hover:border-slate-300 hover:shadow-2xl',
        popular ? 'ring-2 ring-blue-500/20 ring-offset-4 ring-offset-[#fafafa]' : '',
      )}
    >
      {/* Background Visual */}
      <div
        className={cn(
          'absolute top-0 right-0 w-full h-[60%] opacity-10 blur-3xl transition-opacity duration-700 group-hover:opacity-20',
          `bg-gradient-to-br ${gradient}`,
        )}
      />

      {/* Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/40 to-white/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-6 flex flex-col h-full">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">{name}</h3>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="pt-4">
          {discount && discount > 0 && originalPrice && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm line-through text-slate-400 font-medium">
                {currencySymbol}
                {originalPrice}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                SAVE {discount}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight">
              {typeof price === 'number' ? (
                <>
                  {currencySymbol}
                  <NumberTicker value={price} />
                </>
              ) : (
                price
              )}
            </span>
            {typeof price === 'number' && (
              <span className="text-slate-500 text-base font-medium">
                /{period == 'monthly' ? 'month' : 'year'}
              </span>
            )}
          </div>
          {valueText && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                {valueText}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          )}
        </div>

        <ul className="mt-4 space-y-4 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 group/item">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover/item:bg-slate-100 transition-colors">
                <feature.icon size={14} className="text-slate-600" />
              </div>
              <span className="text-sm text-slate-600 group-hover/item:text-slate-900 transition-colors">
                {feature.label}
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={onUpgrade}
          disabled={isCurrent}
          className={cn(
            'mt-8 w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 active:scale-[0.98]',
            isCurrent
              ? 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
              : popular
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white',
          )}
        >
          {isCurrent ? 'Current Plan' : cta}
        </button>
      </div>
    </div>
  );
}
