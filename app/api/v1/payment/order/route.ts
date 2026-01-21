import { NextRequest, NextResponse } from 'next/server';

type OrderRequest = {
  currency: 'USD' | 'INR';
  plan: 'BASIC' | 'PRO' | 'UNLIMITED';
  period: 'MONTH' | 'YEAR';
};

export async function POST(request: NextRequest) {
  try {
    console.log('Order proxy: Received request');
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      console.error('Order proxy: BACKEND_API_URL not configured');
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Backend API URL not configured',
          data: null,
        },
        { status: 500 },
      );
    }

    console.log('Order proxy: Backend URL:', backendUrl);

    // Get the request body
    const body = await request.json();
    console.log('Order proxy: Request body:', body);

    // Validate request body
    if (!body.currency || !['USD', 'INR'].includes(body.currency)) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Invalid or missing currency. Must be USD or INR',
          data: null,
        },
        { status: 400 },
      );
    }

    if (!body.plan || !['BASIC', 'PRO', 'UNLIMITED'].includes(body.plan)) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Invalid or missing plan. Must be BASIC, PRO, or UNLIMITED',
          data: null,
        },
        { status: 400 },
      );
    }

    if (!body.period || !['MONTH', 'YEAR'].includes(body.period)) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Invalid or missing period. Must be MONTH or YEAR',
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

    console.log('Order proxy: Making request to backend:', `${backendUrl}/api/v1/payment/order`);
    console.log('Order proxy: Request headers:', headers);

    // Make the proxy request to the backend
    const response = await fetch(`${backendUrl}/api/v1/payment/order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Order proxy: Backend response status:', response.status);

    // Get response data
    const responseData = await response.json();
    console.log('Order proxy: Backend response data:', responseData);

    // Return the backend response with consistent format
    if (response.ok) {
      return NextResponse.json(
        {
          success: true,
          error: false,
          message: responseData.message || 'Order created successfully',
          data: responseData.data || responseData,
        },
        { status: response.status },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: responseData.message || 'Failed to create order',
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
