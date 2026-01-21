'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, CreditCard, Smartphone, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUser } = useAuth();
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const verification = searchParams.get('verification');
    const isVerificationSuccess = verification === 'true';
    setIsSuccess(isVerificationSuccess);

    // Refresh user profile data after successful payment
    if (isVerificationSuccess) {
      refreshUserProfile();
    }
  }, [searchParams]);

  const refreshUserProfile = async () => {
    try {
      console.log('Refreshing user profile after payment...');
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('No token found, skipping profile refresh');
        return;
      }

      const response = await fetch('/api/v1/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log(`Profile refresh failed with status: ${response.status}`);
        // Try to parse error response
        try {
          const errorResult = await response.json();
          console.log('Profile refresh error details:', errorResult);

          if (errorResult.message && errorResult.message.includes('endpoint not found')) {
            console.log(
              'Backend profile endpoint not implemented yet - this is expected during development',
            );
            return;
          }
        } catch {
          // If we can't parse the error response, just log and continue
          console.log('Could not parse error response');
        }
        return;
      }

      const result = await response.json();
      console.log('Profile refresh response:', result);

      if (result.success && result.data) {
        console.log('Updating user data with fresh profile');
        localStorage.setItem('userData', JSON.stringify(result.data));
        updateUser(result.data);
        console.log('User data updated successfully');
      } else {
        console.log('Profile refresh succeeded but no user data returned:', result.message);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      console.log('Profile refresh failed, but payment was still successful - continuing...');
    }
  };

  if (isSuccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Payment Illustration */}
        <div className="mb-8 relative">
          {isSuccess ? (
            // Success Illustration
            <div className="relative mx-auto w-80 h-80">
              {/* Background circles */}
              <div className="absolute inset-0 bg-green-100 rounded-full opacity-20"></div>
              <div className="absolute top-4 left-4 right-4 bottom-4 bg-green-50 rounded-full opacity-40"></div>

              {/* Main elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Phone */}
                <div className="relative z-10 bg-white rounded-3xl p-4 shadow-xl border-4 border-blue-200 transform rotate-3">
                  <div className="w-32 h-40 bg-gradient-to-b from-green-400 to-green-500 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="mt-3 h-2 bg-green-300 rounded-full w-20 mx-auto"></div>
                </div>
              </div>

              {/* Floating coins */}
              <div className="absolute top-8 right-12 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-xl">$</span>
              </div>
              <div className="absolute top-16 right-4 bg-yellow-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-bounce delay-75">
                <span className="text-sm">$</span>
              </div>
              <div className="absolute bottom-16 right-8 bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-2xl">$</span>
              </div>

              {/* Credit cards */}
              <div className="absolute bottom-12 left-4 transform -rotate-12">
                <div className="w-20 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-lg shadow-lg flex items-end p-2">
                  <div className="text-white text-xs">•••• 2552</div>
                </div>
              </div>
              <div className="absolute bottom-8 left-8 transform rotate-6">
                <div className="w-20 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-lg"></div>
              </div>

              {/* Sparkles */}
              <div className="absolute top-12 left-8 text-yellow-400 text-2xl animate-ping">✨</div>
              <div className="absolute bottom-24 left-12 text-yellow-400 text-lg animate-ping delay-100">
                ✨
              </div>
              <div className="absolute top-20 right-20 text-yellow-400 text-xl animate-ping delay-200">
                ✨
              </div>
            </div>
          ) : (
            // Failure Illustration
            <div className="relative mx-auto w-80 h-80">
              {/* Background circles */}
              <div className="absolute inset-0 bg-red-100 rounded-full opacity-20"></div>
              <div className="absolute top-4 left-4 right-4 bottom-4 bg-red-50 rounded-full opacity-40"></div>

              {/* Main elements */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Phone with error */}
                <div className="relative z-10 bg-white rounded-3xl p-4 shadow-xl border-4 border-red-200 transform -rotate-3">
                  <div className="w-32 h-40 bg-gradient-to-b from-red-400 to-red-500 rounded-2xl flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="mt-3 h-2 bg-red-300 rounded-full w-20 mx-auto"></div>
                </div>
              </div>

              {/* Error symbols */}
              <div className="absolute top-8 right-12 bg-red-400 rounded-full w-12 h-12 flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-xl text-white">!</span>
              </div>
              <div className="absolute bottom-16 left-8 bg-red-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-bounce delay-75">
                <span className="text-sm text-white">✗</span>
              </div>

              {/* Crossed out card */}
              <div className="absolute bottom-12 right-4 transform rotate-12">
                <div className="w-20 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg shadow-lg relative opacity-60">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h1 className={`text-4xl font-bold ${isSuccess ? 'text-gray-800' : 'text-red-600'}`}>
            {isSuccess ? 'Your Payment is Successful!' : 'Payment Failed!'}
          </h1>

          <p className="text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
            {isSuccess
              ? 'Thank you for your payment. An automated payment receipt will be sent to your registered email.'
              : 'We encountered an issue processing your payment. Please try again or contact support if the problem persists.'}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button
              onClick={() => router.push('/')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isSuccess
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              Back to Home
            </Button>

            {!isSuccess && (
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="px-8 py-3 rounded-xl font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                Try Again
              </Button>
            )}
          </div>

          {/* Additional info */}
          {isSuccess && (
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Payment processed securely</span>
              </div>
            </div>
          )}

          {!isSuccess && (
            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Need help? Contact our support team</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
