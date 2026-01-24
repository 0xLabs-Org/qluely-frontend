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
      // Forward all headers except problematic ones, normalized to lowercase
      const keyLower = key.toLowerCase();
      if (keyLower !== 'host' && keyLower !== 'content-length') {
        headers[keyLower] = value;
      }
    });

    // Ensure content-type is set
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    // Log the authorization header status
    const hasAuthHeader = !!headers['authorization'];
    console.log(
      'Order proxy: Authorization header status:',
      hasAuthHeader ? `present (${headers['authorization']?.substring(0, 50)}...)` : 'MISSING!',
    );

    if (!hasAuthHeader) {
      console.log('Order proxy: ERROR - No Authorization header in request!');
      console.log('Order proxy: Request headers received:', Object.keys(headers));
    }

    console.log('Order proxy: Making request to backend:', `${backendUrl}/api/v1/payment/order`);
    console.log('Order proxy: Headers being forwarded:', {
      'content-type': headers['content-type'],
      'authorization-present': !!headers['authorization'],
      'other-headers': Object.keys(headers).filter(
        (k) => k !== 'content-type' && k !== 'authorization',
      ),
    });

    // Make the proxy request to the backend
    const response = await fetch(`${backendUrl}/api/v1/payment/order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Order proxy: Backend response status:', response.status);
    console.log('Order proxy: Backend response headers:', {
      contentType: response.headers.get('content-type'),
    });

    // Get response data
    const responseData = await response.json();
    console.log(
      'Order proxy: Backend response data:',
      JSON.stringify(responseData).substring(0, 200),
    );

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
      // Return the error response, including detailed information
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: responseData.message || 'Failed to create order',
          data: responseData.data || null,
          debugInfo:
            process.env.NODE_ENV === 'development'
              ? {
                  backendStatus: response.status,
                  backendMessage: responseData.message,
                  proxyReceivedAuthHeader: !!headers['authorization'],
                }
              : undefined,
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
