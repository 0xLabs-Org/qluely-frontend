import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import cache from '@/lib/cache';

type VerifyRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      return NextResponse.json({ error: 'Backend API URL not configured' }, { status: 500 });
    }

    // Get the request body
    const body = await request.json();

    // Validate request body
    if (!body.razorpay_order_id || typeof body.razorpay_order_id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Missing or invalid razorpay_order_id',
          data: null,
        },
        { status: 400 },
      );
    }

    if (!body.razorpay_payment_id || typeof body.razorpay_payment_id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Missing or invalid razorpay_payment_id',
          data: null,
        },
        { status: 400 },
      );
    }

    if (!body.razorpay_signature || typeof body.razorpay_signature !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Missing or invalid razorpay_signature',
          data: null,
        },
        { status: 400 },
      );
    }

    // Get headers from the original request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Forward relevant headers, skip host and other problematic headers
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
        headers[key] = value;
      }
    });

    // Extract and forward JWT token
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headers['authorization'] = authHeader;
    }

    // Set content-type if not present
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    // Make the proxy request to the backend
    const response = await fetch(`${backendUrl}/api/v1/payment/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Get response data
    const responseData = await response.json();

    // Return the backend response with consistent format
    if (response.ok) {
      try {
        // If we have an auth token, attempt to decode user id and invalidate cached profile
        const auth = request.headers.get('authorization');
        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.replace('Bearer ', '');
          try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
            const userId = decoded?.id;
            if (userId) {
              await cache.invalidate(`user:${userId}`);
              console.log('[CACHE] Invalidated user cache for', userId);
            }
          } catch (e) {
            console.warn('[CACHE] Could not decode token to invalidate cache', e);
          }
        }
      } catch (e) {
        console.warn('[CACHE] Error while invalidating cache after payment verify', e);
      }
      return NextResponse.json(
        {
          success: true,
          error: false,
          message: responseData.message || 'Payment verified successfully',
          data: responseData.data || responseData,
        },
        { status: response.status },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: responseData.message || 'Payment verification failed',
          data: responseData.data || null,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: true,
        message: 'Failed to proxy request to backend',
        data: null,
      },
      { status: 500 },
    );
  }
}
