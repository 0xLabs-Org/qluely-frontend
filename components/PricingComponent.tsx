"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Box } from "lucide-react";
import { clsx } from "clsx";
import { cn } from "@/lib/utils";
import { NumberTicker } from "./ui/number-ticker";

const plans = [
  {
    name: "Starter",
    description: "For individuals and early adopters",
    monthlyPrice: 19,
    yearlyPrice: 228, // $15/mo billed yearly
    discountedPrice: 15,
    discountedYearlyPrice: 120,
    icon: Sparkles,
    color: "blue",
    gradient: "from-blue-50 to-indigo-50",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    cta: "Try Free Trial",
    ctaStyle: "outline",
    features: [
      "Up to 5 meetings per month",
      "Full real-time audio and image intelligence",
      "Private undetectable meeting mode",
      "Automatic meeting notes & summaries",
      "Basic analytics and activity reports",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description: "For power users and consultants",
    monthlyPrice: 49,
    yearlyPrice: 588, // $15/mo billed yearly
    discountedPrice: 25,
    discountedYearlyPrice: 280,
    popular: true,
    icon: Zap,
    color: "amber",
    gradient: "from-amber-50 to-orange-50",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-100",
    cta: "Upgrade to Pro",
    ctaStyle: "solid",
    features: [
      "Up to 25 meetings per month",
      "Long meetings up to 3 hours each",
      "Priority real-time responses",
      "Advanced summaries & decision extraction",
      "Calendar sync and follow-up tracking",
      "Priority email & chat support",
    ],
  },
  {
    name: "Unlimited",
    description: "For professionals who run meetings daily",
    monthlyPrice: 65,
    yearlyPrice: 780, // $15/mo billed yearly
    discountedPrice: 55,
    discountedYearlyPrice: 600,
    icon: Box,
    color: "cyan",
    gradient: "from-cyan-50 to-blue-50",
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-100",
    cta: "Go Unlimited",
    ctaStyle: "outline",
    features: [
      "Unlimited meetings (fair-use protected)",
      "Unlimited meeting length",
      "Highest priority compute queue",
      "Local privacy shield & invisible mode",
      "Concierge onboarding",
      "Early access to new features",
      "Premium 24/7 support",
    ],
  },
];
const calculateDiscount = (original: number, discounted: number) => {
  return Math.round(((original - discounted) / original) * 100);
};
const PricingComponent = () => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'yearly'

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#F8FAFC] min-h-screen flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight mb-2">
              Flexible plans
            </h2>
            <h2 className="text-4xl sm:text-5xl font-light italic text-slate-600 tracking-tight">
              for every need
            </h2>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-4 ">
            <p className="text-slate-500 max-w-sm text-left lg:text-right text-sm leading-relaxed">
              Affordable and transparent pricing for individuals, teams, and
              businesses — find the right plan for you today.
            </p>

            {/* Toggle Switch */}
            <div className="relative w-56 h-11 rounded-full border border-slate-200 bg-white p-1 flex items-center select-none">
              {/* Sliding active background */}
              <div
                className={cn(
                  "absolute top-1 left-1 h-9 w-1/2 rounded-full bg-green-100 transition-all duration-300",
                  billingCycle === "yearly" && "translate-x-[90%]"
                )}
              />

              <button
                onClick={() => setBillingCycle("monthly")}
                className="relative z-10 w-1/2 h-full text-sm font-medium"
              >
                Monthly
              </button>

              <button
                onClick={() => setBillingCycle("yearly")}
                className="relative z-10 w-1/2 h-full text-sm font-medium"
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price =
              billingCycle === "monthly"
                ? plan.discountedPrice
                : Math.ceil(plan.discountedYearlyPrice / 12);

            // Usage
            const yearlyDiscount =
              billingCycle === "monthly"
                ? calculateDiscount(
                    plan.monthlyPrice * 12,
                    plan.discountedPrice * 12
                  )
                : calculateDiscount(
                    plan.yearlyPrice,
                    plan.discountedYearlyPrice
                  );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={clsx(
                  "relative p-8 rounded-3xl border border-white/50 shadow-sm flex flex-col h-full bg-gradient-to-b transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  plan.gradient,
                  "bg-opacity-50"
                )}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-6 right-6 bg-[#FCD34D] text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    Most popular
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-6 shadow-inner`}
                >
                  <Icon size={28} className={plan.iconColor} />
                </div>

                {/* Header Info */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-500 text-sm mb-6 h-10">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-semibold text-slate-900">
                    {billingCycle === "yearly" ? (
                      <NumberTicker
                        startValue={plan.monthlyPrice}
                        value={price}
                        direction="up"
                        className="text-8xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white"
                      />
                    ) : (
                      <NumberTicker
                        startValue={plan.discountedPrice}
                        direction="down"
                        value={price}
                        className="text-8xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white"
                      />
                    )}{" "}
                    $
                  </span>
                  <span className="text-slate-400 font-medium">
                    / per month
                  </span>
                </div>

                {/* saving */}
                {billingCycle === "yearly" && (
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-2xl font-medium text-red-400">
                      Save {yearlyDiscount}%
                    </span>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  className={clsx(
                    "w-full py-3.5 px-6 rounded-xl font-medium transition-all duration-200 mb-8",
                    plan.ctaStyle === "solid"
                      ? "bg-[#0F172A] text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                      : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  )}
                >
                  {plan.cta}
                </button>

                {/* Features List */}
                <div className="mt-auto">
                  <p className="text-sm font-medium text-slate-400 mb-4">
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 min-w-[18px] h-[18px] rounded-full ${plan.iconBg} flex items-center justify-center`}
                        >
                          <Check
                            size={12}
                            className={plan.iconColor}
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-slate-600 text-sm leading-tight">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;
