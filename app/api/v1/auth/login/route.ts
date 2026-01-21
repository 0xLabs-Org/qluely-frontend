import { NextRequest, NextResponse } from 'next/server';

type LoginRequest = {
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  try {
    console.log('Login proxy: Received request');
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      console.error('Login proxy: BACKEND_API_URL not configured');
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

    console.log('Login proxy: Backend URL:', backendUrl);

    // Get the request body
    const body = await request.json();
    console.log('Login proxy: Request body:', { email: body.email, password: '[REDACTED]' });

    // Validate request body
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Missing or invalid email',
          data: null,
        },
        { status: 400 },
      );
    }

    if (!body.password || typeof body.password !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Missing or invalid password',
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

    // Set content-type if not present
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }

    console.log('Login proxy: Making request to backend:', `${backendUrl}/api/v1/login`);

    // Make the proxy request to the backend
    const response = await fetch(`${backendUrl}/api/v1/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('Login proxy: Backend response status:', response.status);
    console.log('Login proxy: Response content-type:', response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.log('Login proxy: Non-JSON response:', textResponse.substring(0, 200));
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Backend returned non-JSON response',
          data: {
            details: `Status: ${response.status}, Content-Type: ${contentType}`,
            preview: textResponse.substring(0, 100) + '...',
          },
        },
        { status: 502 },
      );
    }

    // Get response data
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      const textResponse = await response.text();
      console.error('Login proxy: JSON parse error:', parseError);
      console.log('Login proxy: Raw response:', textResponse.substring(0, 200));
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Failed to parse backend response',
          data: {
            details: textResponse.substring(0, 100) + '...',
          },
        },
        { status: 502 },
      );
    }

    console.log('Login proxy: Backend response data:', {
      success: responseData.success,
      hasToken: !!responseData.data?.token,
    });

    // Return the backend response with consistent format
    if (response.ok && responseData.success) {
      return NextResponse.json(
        {
          success: true,
          error: false,
          message: responseData.message || 'Login successful',
          data: responseData.data,
        },
        { status: response.status },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: responseData.message || 'Login failed',
          data: responseData.data || null,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('Login proxy error:', error);
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
