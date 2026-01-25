'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { STORAGE_KEYS } from '@/lib/storage';

type Role =
  | 'FOUNDER'
  | 'PRODUCT_MANAGER'
  | 'ENGINEER'
  | 'RECRUITER'
  | 'SALES_MARKETING'
  | 'STUDENT'
  | 'OTHER';
type UseCase =
  | 'MEETINGS_SUMMARIES'
  | 'INTERVIEWS'
  | 'SALES_CALLS'
  | 'TEAM_STANDUPS'
  | 'CLIENT_CALLS'
  | 'OTHER';

const roles: { value: Role; label: string }[] = [
  { value: 'FOUNDER', label: 'Founder / CEO' },
  { value: 'PRODUCT_MANAGER', label: 'Product Manager' },
  { value: 'ENGINEER', label: 'Engineer' },
  { value: 'RECRUITER', label: 'Recruiter / HR' },
  { value: 'SALES_MARKETING', label: 'Sales / Marketing' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'OTHER', label: 'Other' },
];

const useCases: { value: UseCase; label: string }[] = [
  { value: 'MEETINGS_SUMMARIES', label: 'Meetings & summaries' },
  { value: 'INTERVIEWS', label: 'Interviews' },
  { value: 'SALES_CALLS', label: 'Sales calls' },
  { value: 'TEAM_STANDUPS', label: 'Team standups' },
  { value: 'CLIENT_CALLS', label: 'Client calls' },
  { value: 'OTHER', label: 'Other' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        return router.push('/dashboard');
      }

      const payload = {
        role: selectedRole,
        primaryUseCase: selectedUseCase,
      };

      const response = await fetch('/api/v1/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save onboarding data');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      // For now, just redirect anyway
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const payload = {
        role: null,
        primaryUseCase: null,
        skipped: true,
      };

      const response = await fetch('/api/v1/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save onboarding data');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding skip error:', error);
      // For now, just redirect anyway
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help us personalize Qluely for you</h1>
          <p className="text-gray-600 mt-2">You can skip this anytime</p>
        </div>

        <div className="space-y-8">
          {/* Role Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What best describes your role?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    selectedRole === role.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Use Case Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Primary use case for Qluely?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {useCases.map((useCase) => (
                <button
                  key={useCase.value}
                  onClick={() => setSelectedUseCase(useCase.value)}
                  className={`p-4 text-left border rounded-lg transition-colors ${
                    selectedUseCase === useCase.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {useCase.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
            Skip for now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading || (!selectedRole && !selectedUseCase)}
          >
            {isLoading ? 'Saving...' : 'Continue →'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
