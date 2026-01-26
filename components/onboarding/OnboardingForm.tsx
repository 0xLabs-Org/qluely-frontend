'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface OnboardingFormProps {
    onComplete?: () => void;
    onSkip?: () => void;
}

const ROLES = [
    { id: 'founder', label: 'Founder / CEO' },
    { id: 'pm', label: 'Product Manager' },
    { id: 'engineer', label: 'Engineer' },
    { id: 'recruiter', label: 'Recruiter / HR' },
    { id: 'sales', label: 'Sales / Marketing' },
    { id: 'student', label: 'Student' },
];

const USE_CASES = [
    { id: 'interviews', label: 'Interviews' },
    { id: 'meetings', label: 'Meetings & summaries' },
    { id: 'sales', label: 'Sales calls' },
    { id: 'standups', label: 'Team standups' },
    { id: 'client', label: 'Client calls' },
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
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('/api/v1/onboarding/skip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to skip onboarding');
            }

            // Update local state
            setOnboardingComplete();

            if (onSkip) {
                onSkip();
            } else {
                router.push('/dashboard');
            }
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
            if (!token) {
                throw new Error('No authentication token found');
            }

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

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete onboarding');
            }

            // Update local state
            setOnboardingComplete();

            if (onComplete) {
                onComplete();
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Onboarding submission error:', err);
            setError(err.message || 'Failed to complete onboarding');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Check if we should show the form (sanity check, though effect handles redirect)
    if (user?.isOnboarded) {
        return null; // Or a loading spinner while redirecting
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
            <Card className="w-full max-w-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Help us personalize Qluely for you
                    </h1>
                    <p className="text-gray-600">You can skip this anytime</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                            What best describes your role?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ROLES.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`
                    relative p-4 rounded-lg border-2 text-left transition-all duration-200
                    ${selectedRole === role.id
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`font-medium ${selectedRole === role.id ? 'text-blue-900' : 'text-gray-700'}`}
                                        >
                                            {role.label}
                                        </span>
                                        {selectedRole === role.id && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Use Case Selection */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                            How do you plan to use Qluely?{' '}
                            <span className="text-sm font-normal text-gray-500">(Select all that apply)</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {USE_CASES.map((useCase) => (
                                <button
                                    key={useCase.id}
                                    type="button"
                                    onClick={() => handleUseCaseToggle(useCase.id)}
                                    className={`
                    relative p-4 rounded-lg border-2 text-left transition-all duration-200
                    ${selectedUseCases.includes(useCase.id)
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`font-medium ${selectedUseCases.includes(useCase.id) ? 'text-blue-900' : 'text-gray-700'}`}
                                        >
                                            {useCase.label}
                                        </span>
                                        {selectedUseCases.includes(useCase.id) && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none"
                        >
                            Skip for now
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className="flex-1 sm:flex-auto"
                        >
                            {isSubmitting ? 'Saving...' : 'Continue →'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
