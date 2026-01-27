'use client';

import { STORAGE_KEYS } from '@/lib/storage';

export async function pay(
  currency: 'INR' | 'USD' = 'USD',
  plan: 'BASIC' | 'PRO' | 'UNLIMITED' = 'BASIC',
  period: 'MONTH' | 'YEAR' = 'MONTH',
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
    const res = await fetch('/api/v1/payment/order', {
      method: 'POST',
      headers,
      body: JSON.stringify({ currency, plan, period }),
    });

    console.log('Pay.ts: Order response received with status:', res.status);

    if (!res.ok) {
      const errorResponse = await res.json();
      console.error('Pay.ts: Order creation failed with status:', res.status);
      console.error('Pay.ts: Error response:', errorResponse);

      // Handle token expiration/invalid token
      // if (res.status === 401) {
      //   console.log('Pay.ts: Got 401 Unauthorized - token may be expired or invalid');
      //   console.log('Pay.ts: Clearing token from localStorage and dispatching logout event');
      //   localStorage.removeItem(STORAGE_KEYS.TOKEN);
      //   localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      //   // Dispatch logout event to notify AuthContext
      //   window.dispatchEvent(new Event('auth-logout'));

      //   const message = errorResponse.message || 'Authentication failed';
      //   if (message.includes('token') || message.includes('expired')) {
      //     throw new Error('Your session has expired. Please login again.');
      //   }

      //   throw new Error('Authentication failed. Please login again.');
      // }

      throw new Error(errorResponse.message || `Failed to create order: ${res.status}`);
    }

    const orderResponse = await res.json();
    console.log('Order response:', orderResponse);

    if (!orderResponse.success) {
      throw new Error(orderResponse.message || 'Failed to create order');
    }

    const order = orderResponse.data;
    console.log('Order created successfully:', order);

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
        const verifyRes = await fetch('/api/v1/payment/verify', {
          method: 'POST',
          headers,
          body: JSON.stringify(response),
        });

        const verifyResponse = await verifyRes.json();
        console.log('Verify response:', verifyResponse);

        if (!verifyRes.ok || !verifyResponse.success) {
          console.error('Payment verification failed:', verifyRes.status, verifyResponse);

          // if (verifyRes.status === 401 || verifyResponse.message?.includes('token')) {
          //   localStorage.removeItem(STORAGE_KEYS.TOKEN);
          //   localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          //   // Dispatch logout event to notify AuthContext
          //   window.dispatchEvent(new Event('auth-logout'));
          //   throw new Error('Your session has expired. Please login again.');
          // }

          throw new Error(verifyResponse.message || 'Payment verification failed');
        }

        console.log('Payment verified successfully');

        // Call refresh route to get updated token
        try {
          console.log('Calling refresh route...');
          const refreshRes = await fetch('/api/v1/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const refreshResponse = await refreshRes.json();
          console.log('Refresh response:', refreshResponse);

          if (refreshRes.ok && refreshResponse.success && refreshResponse.data?.refreshToken) {
            console.log('Updating token with refreshToken');

            // Update localStorage with new token
            localStorage.setItem(STORAGE_KEYS.TOKEN, refreshResponse.data.refreshToken);

            // Update userData if available
            if (refreshResponse.data.user) {
              localStorage.setItem(
                STORAGE_KEYS.USER_DATA,
                JSON.stringify(refreshResponse.data.user),
              );
            }

            // Fetch fresh user profile data after payment
            try {
              console.log('Fetching fresh user profile data...');
              const profileRes = await fetch('/api/v1/user/profile', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${refreshResponse.data.refreshToken}`,
                },
              });

              const profileResponse = await profileRes.json();
              console.log('Profile response:', profileResponse);

              if (profileRes.ok && profileResponse.success && profileResponse.data) {
                console.log('Updating user data with fresh profile data');
                localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profileResponse.data));
              }
            } catch (profileError) {
              console.error('Failed to fetch fresh profile data:', profileError);
              // Don't throw error here, payment was successful
            }

            console.log('Token and user data updated successfully');
          } else {
            console.log('No refresh token received or refresh failed:', refreshResponse.message);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Don't throw error here, payment was successful
        }

        window.location.href = `/payment?verification=true`;
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal was closed by user');
          window.location.href = `/payment?verification=false`;
        },
      },
      theme: { color: '#000000' },
    };

    const Razorpay = (window as any).Razorpay;
    if (!Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    window.location.href = `/payment?verification=false`;
  }
}
