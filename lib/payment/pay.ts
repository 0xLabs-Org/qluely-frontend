'use client';

import { STORAGE_KEYS } from '@/lib/storage';
import { showToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

export async function pay(
  currency: 'INR' | 'USD' = 'USD',
  plan: 'BASIC' | 'PRO' | 'UNLIMITED' = 'BASIC',
  period: 'MONTH' | 'YEAR' = 'MONTH',
  extras?: Record<string, any>,
  onSuccess?: () => void,
  onError?: (err: Error) => void,
) {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (!token || !userData) {
      console.log('Missing token or userData:', { hasToken: !!token, hasUserData: !!userData });
      throw new Error('User not authenticated. Please login first.');
    }

    // Basic token format validation
    if (!token.startsWith('eyJ')) {
      // JWT tokens start with eyJ
      console.warn('Token format appears invalid');
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      throw new Error('Invalid authentication token. Please login again.');
    }

    // Log token info (don't validate JWT locally - backend will verify it)
    console.log('Pay.ts: Token exists, length:', token.length);
    console.log('Pay.ts: Token starts with:', token.substring(0, 30) + '...');

    const authHeaderValue = `Bearer ${token}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: authHeaderValue,
    };

    console.log('Pay.ts: Creating order with:', { currency, plan, period });
    console.log('Pay.ts: Token extracted from STORAGE_KEYS.TOKEN:', token.substring(0, 20) + '...');
    console.log(
      'Pay.ts: Authorization header being sent:',
      authHeaderValue.substring(0, 40) + '...',
    );
    console.log('Pay.ts: All headers keys:', Object.keys(headers));

    //create order using proxy server
    const bodyPayload = { currency, plan, period, ...(extras || {}) };
    console.log('Pay.ts: Order payload:', bodyPayload);
    const res = await fetch('/api/v1/payment/order', {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });

    console.log('Pay.ts: Order response received with status:', res.status);

    if (!res.ok) {
      let errorResponse: any = {};
      try {
        errorResponse = await res.json();
      } catch (e) {
        console.error('Pay.ts: Failed to parse error response body', e);
      }
      console.error('Pay.ts: Order creation failed with status:', res.status);
      console.error('Pay.ts: Error response:', errorResponse);

      const message = errorResponse?.message || `Failed to create order: ${res.status}`;

      // Friendly handling for common backend minimum-amount error
      if (typeof message === 'string' && message.toLowerCase().includes('minimum')) {
        showToast('Selected plan price is invalid. Please contact support.', 'error');
        const err: any = new Error('Selected plan price is invalid');
        err.handled = true;
        throw err;
      }

      throw new Error(message);
    }

    const orderResponse = await res.json();
    console.log('Order response:', orderResponse);

    if (!orderResponse.success) {
      throw new Error(orderResponse.message || 'Failed to create order');
    }

    const order = orderResponse.data;
    console.log('Order created successfully:', order);

    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'Qluely',
        description: `${plan}`,
        handler: async (response: any) => {
          // Use the token from outer scope instead of retrieving again
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          headers['Authorization'] = `Bearer ${token}`;

          console.log('verify params', response);
          console.log('before verify', headers);
          //verify payment using payment signature
          try {
            const verifyRes = await fetch('/api/v1/payment/verify', {
              method: 'POST',
              headers,
              body: JSON.stringify(response),
            });

            const verifyResponse = await verifyRes.json();
            console.log('Verify response:', verifyResponse);

            if (!verifyRes.ok || !verifyResponse.success) {
              console.error('Payment verification failed:', verifyRes.status, verifyResponse);
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }

            // Try to refresh the client-side user profile so UI updates immediately
            const { user } = useAuth();
            const userDetails = user; // Reuse user details from AuthContext
            if (userDetails) {
              localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userDetails));
              window.dispatchEvent(new Event('auth-refresh'));
            }

            if (onSuccess) {
              onSuccess();
              resolve(orderResponse);
            } else {
              showToast('Payment successful!', 'success');
              window.location.href = `/payment?verification=true`;
              // We don't resolve here as we are navigating away
            }
          } catch (err) {
            showToast('Payment verification failed', 'error');
          }
        },
        modal: {
          ondismiss: function () {
            showToast('Payment cancelled', 'info');
          },
        },
        theme: { color: '#000000' },
      };

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        const error = new Error('Razorpay SDK not loaded');
        if (onError) onError(error);
        reject(error);
        return;
      }
      const rzp = new Razorpay(options);
      rzp.open();
    });
  } catch (error) {
    if (onError) {
      try {
        onError(error instanceof Error ? error : new Error(String(error)));
      } catch (e) {
        console.error('onError callback threw', e);
      }
    } else {
      // No onError provided — surface the error to callers by re-throwing
      throw error;
    }
  }
}
