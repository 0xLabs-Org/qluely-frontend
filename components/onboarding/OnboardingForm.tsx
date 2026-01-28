'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    Rocket,
    LayoutList,
    Code2,
    UserPlus,
    LineChart,
    GraduationCap,
    Video,
    Calendar,
    Phone,
    Clock,
    Briefcase,
    Check,
    ChevronRight,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// import Image from 'next/image';

interface OnboardingFormProps {
    onComplete?: () => void;
    onSkip?: () => void;
}

const ROLES = [
    { id: 'founder', label: 'Founder / CEO', icon: Rocket, description: 'Scaling the vision' },
    { id: 'pm', label: 'Product Manager', icon: LayoutList, description: 'Driving strategy' },
    { id: 'engineer', label: 'Engineer', icon: Code2, description: 'Building the future' },
    { id: 'recruiter', label: 'Recruiter / HR', icon: UserPlus, description: 'Finding talent' },
    { id: 'sales', label: 'Sales / Marketing', icon: LineChart, description: 'Closing deals' },
    { id: 'student', label: 'Student', icon: GraduationCap, description: 'Learning & growing' },
];

const USE_CASES = [
    { id: 'interviews', label: 'Interviews', icon: Video },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'sales', label: 'Sales Calls', icon: Phone },
    { id: 'standups', label: 'Team Standups', icon: Clock },
    { id: 'client', label: 'Client Work', icon: Briefcase },
];

export default function OnboardingForm({ onComplete, onSkip }: OnboardingFormProps) {
    const router = useRouter();
    const { user, isLoading, setOnboardingComplete } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already onboarded
    useEffect(() => {
        if (!isLoading && user?.isOnboarded) {
            router.replace('/dashboard');
        }
    }, [user, isLoading, router]);

    const isValid = selectedRole && selectedUseCases.length > 0;

    const handleUseCaseToggle = (useCaseId: string) => {
        setSelectedUseCases((prev) =>
            prev.includes(useCaseId) ? prev.filter((id) => id !== useCaseId) : [...prev, useCaseId],
        );
    };

    const handleSkip = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch('/api/v1/onboarding/skip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to skip onboarding');

            setOnboardingComplete();
            if (onSkip) onSkip();
            else router.push('/dashboard');
        } catch (err: any) {
            console.error('Skip onboarding error:', err);
            setError(err.message || 'Failed to skip onboarding');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch('/api/v1/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role: selectedRole,
                    useCases: selectedUseCases,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to complete onboarding');

            setOnboardingComplete();
            if (onComplete) onComplete();
            else router.push('/dashboard');
        } catch (err: any) {
            console.error('Onboarding submission error:', err);
            setError(err.message || 'Failed to complete onboarding');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (user?.isOnboarded) return null;

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-white overflow-hidden">
            {/* Left Panel - Dynamic Visuals */}
            <div className="hidden lg:flex relative flex-col p-12 bg-[#F8FAFC] overflow-hidden justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-white/20 pointer-events-none" />

                {/* Text Content - Fixed at Top */}
                <div className="relative z-10 flex-none mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-gray-200/50 mb-8 shadow-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">Personalize Experience</span>
                    </motion.div>

                    <h1 className="text-[3.5rem] font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                        {selectedRole ? (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key="title-2"
                                className="block"
                            >
                                Optimize your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Workflow.
                                </span>
                            </motion.span>
                        ) : (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key="title-1"
                                className="block"
                            >
                                Craft your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Identity.
                                </span>
                            </motion.span>
                        )}
                    </h1>

                    <p className="text-lg text-gray-500 max-w-md font-light leading-relaxed">
                        {selectedRole
                            ? "Tell us how you'll use Qluely so we can streamline your daily tasks and meetings."
                            : "Select your role to help us customize the AI assistant specifically for your needs."}
                    </p>
                </div>

                {/* Dynamic Abstract Interactive - Fills Bottom Space */}
                <div className="relative flex-1 w-full min-h-0 mt-8 flex items-center justify-center">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={selectedRole ? 'usecase-visual' : 'role-visual'}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full h-full max-w-[500px] flex items-center justify-center perspective-1000"
                        >
                            {/* Abstract "AI Core" Glow */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full mix-blend-multiply"
                                />
                                <motion.div
                                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full mix-blend-multiply"
                                />
                            </div>

                            {/* Floating Glass Elements Composition */}
                            <div className="relative w-full h-[400px]">
                                {/* Central Card */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl flex flex-col p-6 z-20"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-2 w-20 bg-gray-200/80 rounded-full" />
                                            <div className="h-2 w-12 bg-gray-200/50 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="h-2 w-full bg-gray-100/50 rounded-full" />
                                        <div className="h-2 w-3/4 bg-gray-100/50 rounded-full" />
                                        <div className="h-2 w-5/6 bg-gray-100/50 rounded-full" />
                                    </div>
                                    {/* Simulated "Active" State */}
                                    <div className="mt-auto p-3 bg-white/50 rounded-xl border border-white/40">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="h-2 w-16 bg-blue-200 rounded-full" />
                                            <div className="h-2 w-2 bg-green-400 rounded-full" />
                                        </div>
                                        <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-blue-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "70%" }}
                                                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Decor Elements */}
                                {/* Top Right - Mini Chart */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-10 right-0 w-40 h-32 bg-white/30 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl p-4 z-10"
                                >
                                    <div className="flex items-end justify-between h-full gap-2">
                                        {[40, 70, 50, 90, 60].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                                className="w-full bg-blue-500/80 rounded-t-sm"
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Bottom Left - Code/Task Block */}
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-20 left-0 w-48 h-24 bg-white/30 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl p-4 z-30"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-3/4 bg-gray-700/20 rounded-full" />
                                        <div className="h-1.5 w-1/2 bg-gray-700/20 rounded-full" />
                                    </div>
                                </motion.div>

                                {/* Small Orbiting Elements */}
                                <motion.div
                                    className="absolute top-[20%] left-[20%] w-12 h-12 bg-white/60 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center border border-white/60"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-12 left-12 z-10 flex gap-2">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ease-in-out ${selectedRole ? 'w-4 bg-gray-300' : 'w-12 bg-blue-600'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-700 ease-in-out ${selectedRole ? 'w-12 bg-blue-600' : 'w-4 bg-gray-300'}`} />
                </div>
            </div>

            {/* Right Panel - Form (Interactivity) */}
            <div className="h-full overflow-y-auto bg-white px-6 py-12 lg:px-20 lg:py-16 flex flex-col justify-center">
                <div className="max-w-xl mx-auto w-full space-y-10">

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Role Selection Group */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                                1. What's your role?
                                {selectedRole && <Check className="w-6 h-6 text-green-500" />}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {ROLES.map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={cn(
                                            "cursor-pointer group relative flex items-center p-4 rounded-xl border-2 transition-all duration-200",
                                            selectedRole === role.id
                                                ? "border-blue-600 bg-blue-50 shadow-sm"
                                                : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-lg mr-4 transition-colors",
                                            selectedRole === role.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-100"
                                        )}>
                                            <role.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className={cn(
                                                "font-semibold text-gray-900 block",
                                                selectedRole === role.id && "text-blue-900"
                                            )}>
                                                {role.label}
                                            </span>
                                            <span className="text-xs text-gray-500">{role.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Use Cases - Progressive Reveal */}
                        <AnimatePresence>
                            {selectedRole && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="w-full h-px bg-gray-100" />
                                    <h2 className="text-2xl font-semibold text-gray-900">2. How will you use it?</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {USE_CASES.map((useCase) => (
                                            <button
                                                key={useCase.id}
                                                type="button"
                                                onClick={() => handleUseCaseToggle(useCase.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-3 h-28 aspect-square",
                                                    selectedUseCases.includes(useCase.id)
                                                        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                                                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50 text-gray-600"
                                                )}
                                            >
                                                <useCase.icon className={cn(
                                                    "w-6 h-6 mb-1",
                                                    selectedUseCases.includes(useCase.id) ? "text-white" : "text-gray-400"
                                                )} />
                                                <span className="font-medium text-sm text-center leading-tight">
                                                    {useCase.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="pt-8 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Skip for now
                            </button>

                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className={cn(
                                    "px-8 py-6 rounded-full font-semibold text-base shadow-xl shadow-blue-500/20 transition-all duration-300",
                                    isValid
                                        ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Get Started <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
