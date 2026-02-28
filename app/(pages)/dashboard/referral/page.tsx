'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    Copy,
    Check,
    Users,
    Zap,
    Link2,
    ArrowRight,
    Sparkles,
    RefreshCw,
    Share2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { STORAGE_KEYS } from '@/lib/storage';

interface ReferralData {
    referralCode: string | null;
    referralCount: number;
    referralRewarded: boolean;
    hasUsedReferral: boolean;
}

const CREDITS_PER_REFERRAL = 15;
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://qluely.in';

function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-slate-100 ${className ?? ''}`}
            aria-hidden="true"
        />
    );
}

export default function ReferralPage() {
    const { user } = useAuth();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const fetchReferralData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (!token) throw new Error('Not authenticated');

            const res = await fetch('/api/v1/user/referral', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });

            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load referral info');

            setData(json.data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReferralData();
    }, [fetchReferralData]);

    const referralLink = data?.referralCode
        ? `${APP_BASE_URL}/register?referralcode=${data.referralCode}`
        : '';

    const copyToClipboard = async (text: string, type: 'code' | 'link') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'code') {
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
            } else {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            }
        } catch {
            // Fallback for older browsers
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
    };

    const creditsEarned = (data?.referralCount ?? 0) * CREDITS_PER_REFERRAL;

    const steps = [
        {
            icon: Share2,
            title: 'Share your code',
            desc: 'Copy your unique referral link and share it with friends, teammates, or on social media.',
            color: 'from-violet-500 to-indigo-500',
        },
        {
            icon: Users,
            title: 'They sign up',
            desc: 'Your friend registers using your referral code. It takes less than a minute.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Zap,
            title: 'Both earn credits',
            desc: `You both instantly receive ${CREDITS_PER_REFERRAL} bonus credits to use across Qluely.`,
            color: 'from-amber-500 to-orange-500',
        },
    ];

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-4"
                >
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-200">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Referral Program</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Invite friends and earn {CREDITS_PER_REFERRAL} free credits each
                        </p>
                    </div>
                </motion.div>

                {/* Error state */}
                {error && !loading && (
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                        <span>{error}</span>
                        <button
                            id="referral-retry-btn"
                            onClick={fetchReferralData}
                            className="flex items-center gap-1.5 font-semibold hover:underline"
                        >
                            <RefreshCw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                )}

                {/* Hero Card — Your Referral Code */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 shadow-2xl"
                >
                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-500/10 blur-2xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            Your Referral Code
                        </div>

                        {loading ? (
                            <Skeleton className="h-16 w-64 bg-white/10 mb-4" />
                        ) : (
                            <div className="flex items-center gap-4 mb-4">
                                <span
                                    id="referral-code-display"
                                    className="text-5xl font-black tracking-[0.2em] text-white font-mono"
                                >
                                    {data?.referralCode ?? '—'}
                                </span>
                                {data?.referralCode && (
                                    <motion.button
                                        id="copy-referral-code-btn"
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => copyToClipboard(data.referralCode!, 'code')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-semibold transition-all duration-200"
                                        aria-label="Copy referral code"
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            {codeCopied ? (
                                                <motion.span
                                                    key="check"
                                                    initial={{ opacity: 0, scale: 0.7 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-1.5 text-green-400"
                                                >
                                                    <Check className="w-4 h-4" /> Copied!
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="copy"
                                                    initial={{ opacity: 0, scale: 0.7 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    <Copy className="w-4 h-4" /> Copy Code
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                )}
                            </div>
                        )}

                        {/* Share Link */}
                        <div className="mt-2">
                            <p className="text-slate-400 text-xs mb-2 font-medium">Or share your invite link</p>
                            <div className="flex items-center gap-2">
                                <div
                                    id="referral-link-display"
                                    className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-mono min-w-0"
                                >
                                    <Link2 className="w-4 h-4 shrink-0 text-slate-500" />
                                    <span className="truncate">
                                        {loading ? 'Loading…' : referralLink || '—'}
                                    </span>
                                </div>
                                {!loading && referralLink && (
                                    <motion.button
                                        id="copy-referral-link-btn"
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => copyToClipboard(referralLink, 'link')}
                                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200"
                                        aria-label="Copy referral link"
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            {linkCopied ? (
                                                <motion.span
                                                    key="check"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    <Check className="w-4 h-4" /> Copied
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="copy"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    <Copy className="w-4 h-4" /> Copy Link
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {/* Referrals Made */}
                    <div
                        id="referral-count-card"
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Referrals Made
                            </span>
                            <div className="p-2 rounded-xl bg-blue-50">
                                <Users className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        {loading ? (
                            <Skeleton className="h-10 w-16" />
                        ) : (
                            <span className="text-4xl font-black text-slate-900">
                                {data?.referralCount ?? 0}
                            </span>
                        )}
                        <span className="text-xs text-slate-400">people joined using your link</span>
                    </div>

                    {/* Credits Earned */}
                    <div
                        id="credits-earned-card"
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Credits Earned
                            </span>
                            <div className="p-2 rounded-xl bg-amber-50">
                                <Zap className="w-4 h-4 text-amber-500" />
                            </div>
                        </div>
                        {loading ? (
                            <Skeleton className="h-10 w-24" />
                        ) : (
                            <span className="text-4xl font-black text-slate-900">{creditsEarned}</span>
                        )}
                        <span className="text-xs text-slate-400">
                            {CREDITS_PER_REFERRAL} credits × {data?.referralCount ?? 0} referrals
                        </span>
                    </div>

                    {/* Bonus Status */}
                    <div
                        id="referral-status-card"
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Signup Bonus
                            </span>
                            <div className="p-2 rounded-xl bg-violet-50">
                                <Gift className="w-4 h-4 text-violet-600" />
                            </div>
                        </div>
                        {loading ? (
                            <Skeleton className="h-10 w-32" />
                        ) : (
                            <div className="flex items-center gap-2">
                                {data?.hasUsedReferral ? (
                                    <>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
                                            <Check className="w-3.5 h-3.5" /> +{CREDITS_PER_REFERRAL} claimed
                                        </span>
                                    </>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-sm font-semibold">
                                        Not claimed
                                    </span>
                                )}
                            </div>
                        )}
                        <span className="text-xs text-slate-400">
                            {data?.hasUsedReferral
                                ? 'You used a friend\'s code at signup'
                                : 'Enter a referral code at signup to claim'}
                        </span>
                    </div>
                </motion.div>

                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8"
                >
                    <h2 className="text-lg font-bold text-slate-900 mb-6">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((step, i) => (
                            <div key={step.title} className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} shadow-md`}
                                    >
                                        <step.icon className="w-5 h-5 text-white" />
                                    </div>
                                    {i < steps.length - 1 && (
                                        <ArrowRight className="hidden md:block w-4 h-4 text-slate-300 ml-auto" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
                        <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span>
                            Credits are added instantly on signup. Each referral code can only be claimed once per
                            account. You cannot use your own referral code.
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
