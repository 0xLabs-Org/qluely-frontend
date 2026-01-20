import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json({ error: 'Missing or invalid razorpay_order_id' }, { status: 400 });
    }

    if (!body.razorpay_payment_id || typeof body.razorpay_payment_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid razorpay_payment_id' },
        { status: 400 },
      );
    }

    if (!body.razorpay_signature || typeof body.razorpay_signature !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid razorpay_signature' }, { status: 400 });
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

    // Return the backend response with the same status code
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy request to backend' }, { status: 500 });
  }
}
