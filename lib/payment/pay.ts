'use client';

export async function pay(
  currency: 'INR' | 'USD' = 'USD',
  plan: 'BASIC' | 'PRO' | 'UNLIMITED' = 'BASIC',
  period: 'MONTH' | 'YEAR' = 'MONTH',
) {
  try {
    // Debug localStorage contents
    console.log('=== Payment Debug Info ===');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('token value:', localStorage.getItem('token'));
    console.log('userData value:', localStorage.getItem('userData'));
    console.log('========================');

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (!token || !userData) {
      console.log('Missing token or userData:', { hasToken: !!token, hasUserData: !!userData });
      throw new Error('User not authenticated. Please login first.');
    }

    // Basic token format validation
    if (!token.startsWith('eyJ')) {
      // JWT tokens start with eyJ
      console.warn('Token format appears invalid');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      throw new Error('Invalid authentication token. Please login again.');
    }

    // Try to decode the token to check if it's valid
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token structure');
      }
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload:', payload);
      console.log('Token expiration:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date());

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token has expired');
      }
    } catch (tokenError) {
      console.error('Token validation error:', tokenError);
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      throw new Error('Invalid or expired authentication token. Please login again.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    console.log('Creating order with:', { currency, plan, period });
    console.log('Using token:', token.substring(0, 20) + '...');

    const res = await fetch('/api/v1/payment/order', {
      method: 'POST',
      headers,
      body: JSON.stringify({ currency, plan, period }),
    });

    console.log('Order response status:', res.status);

    if (!res.ok) {
      const errorResponse = await res.json();
      console.error('Order creation failed:', res.status, errorResponse);

      // Handle token expiration/invalid token
      if (res.status === 401) {
        console.log('Token expired or invalid, clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        const message = errorResponse.message || 'Authentication failed';
        if (message.includes('token') || message.includes('expired')) {
          throw new Error('Your session has expired. Please login again.');
        }

        throw new Error('Authentication failed. Please login again.');
      }

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
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        headers['Authorization'] = `Bearer ${token}`;

        console.log('verify params', response);
        console.log('before verify', headers);

        const verifyRes = await fetch('/api/v1/payment/verify', {
          method: 'POST',
          headers,
          body: JSON.stringify(response),
        });

        const verifyResponse = await verifyRes.json();
        console.log('Verify response:', verifyResponse);

        if (!verifyRes.ok || !verifyResponse.success) {
          console.error('Payment verification failed:', verifyRes.status, verifyResponse);

          if (verifyRes.status === 401 || verifyResponse.message?.includes('token')) {
            throw new Error('Your session has expired. Please login again.');
          }

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
            localStorage.setItem('token', refreshResponse.data.refreshToken);

            // Update userData if provided
            if (refreshResponse.data.user) {
              localStorage.setItem('userData', JSON.stringify(refreshResponse.data.user));
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
                localStorage.setItem('userData', JSON.stringify(profileResponse.data));
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
