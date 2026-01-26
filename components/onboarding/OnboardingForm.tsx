'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

    // Calculate progress for the visual bar
    const progress =
        (selectedRole ? 50 : 0) + (selectedUseCases.length > 0 ? 50 : 0);

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 animate-pulse">Loading experience...</p>
                </div>
            </div>
        );
    }

    if (user?.isOnboarded) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8">
            <div className="w-full max-w-4xl relative">
                {/* Decorative elements */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                <Card className="relative backdrop-blur-3xl bg-white/80 border-white/20 shadow-2xl overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="text-center mb-12 space-y-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4 ring-1 ring-blue-100"
                            >
                                <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-blue-700">Let's personalize Qluely</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl font-bold tracking-tight text-gray-900"
                            >
                                Welcome to your new workflow
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg text-gray-600 max-w-xl mx-auto"
                            >
                                Tell us a bit about yourself so we can tailor the experience to your needs.
                            </motion.p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-8 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* Role Selection */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">1</div>
                                    <h2 className="text-xl font-semibold text-gray-900">What best describes your role?</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {ROLES.map((role, index) => (
                                        <motion.button
                                            key={role.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + index * 0.05 }}
                                            onClick={() => setSelectedRole(role.id)}
                                            className={cn(
                                                "group relative flex flex-col items-start p-6 rounded-2xl border-2 text-left transition-all duration-300",
                                                selectedRole === role.id
                                                    ? "border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10"
                                                    : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-md"
                                            )}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-xl mb-4 transition-colors",
                                                selectedRole === role.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                                            )}>
                                                <role.icon className="w-6 h-6" />
                                            </div>
                                            <span className={cn(
                                                "font-semibold text-lg mb-1 block",
                                                selectedRole === role.id ? "text-blue-900" : "text-gray-900"
                                            )}>
                                                {role.label}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {role.description}
                                            </span>

                                            {selectedRole === role.id && (
                                                <div className="absolute top-4 right-4">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="bg-blue-500 rounded-full p-1"
                                                    >
                                                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Use Case Selection */}
                            <AnimatePresence>
                                {selectedRole && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">2</div>
                                            <h2 className="text-xl font-semibold text-gray-900">How do you plan to use Qluely?</h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                            {USE_CASES.map((useCase, index) => (
                                                <motion.button
                                                    key={useCase.id}
                                                    type="button"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => handleUseCaseToggle(useCase.id)}
                                                    className={cn(
                                                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-3 h-32",
                                                        selectedUseCases.includes(useCase.id)
                                                            ? "border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20"
                                                            : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50"
                                                    )}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <div className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        selectedUseCases.includes(useCase.id) ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                                                    )}>
                                                        <useCase.icon className="w-5 h-5" />
                                                    </div>
                                                    <span className={cn(
                                                        "font-medium text-sm text-center",
                                                        selectedUseCases.includes(useCase.id) ? "text-blue-900" : "text-gray-700"
                                                    )}>
                                                        {useCase.label}
                                                    </span>

                                                    {selectedUseCases.includes(useCase.id) && (
                                                        <motion.div
                                                            layoutId="checkmark"
                                                            className="absolute top-2 right-2"
                                                        >
                                                            <Check className="w-4 h-4 text-blue-500" />
                                                        </motion.div>
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleSkip}
                                    disabled={isSubmitting}
                                    className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-6"
                                >
                                    Skip for now
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={!isValid || isSubmitting}
                                    className={cn(
                                        "min-w-[160px] h-12 text-base font-medium transition-all duration-300 rounded-xl",
                                        isValid
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 text-white"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Setting up...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Continue</span>
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                <p className="text-center mt-6 text-sm text-gray-400">
                    Takes less than 1 minute • Your responses help us improve
                </p>
            </div>
        </div>
    );
}
