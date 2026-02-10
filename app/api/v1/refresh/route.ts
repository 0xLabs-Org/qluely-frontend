import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Refresh proxy: Received request');
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      console.error('Refresh proxy: BACKEND_API_URL not configured');
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

    console.log('Refresh proxy: Backend URL:', backendUrl);

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

    console.log('Refresh proxy: Making request to backend:', `${backendUrl}/api/v1/refresh`);

    // Make the proxy request to the backend (no body needed)
    const response = await fetch(`${backendUrl}/api/v1/refresh`, {
      method: 'POST',
      headers,
    });

    console.log('Refresh proxy: Backend response status:', response.status);

    // Get response data
    const responseData = await response.json();

    // Return the backend response with consistent format
    if (response.ok && responseData.success) {
      return NextResponse.json(
        {
          success: true,
          error: false,
          message: responseData.message || 'Token refreshed successfully',
          data: responseData.data,
        },
        { status: response.status },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: responseData.message || 'Token refresh failed',
          data: responseData.data || null,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('Refresh proxy error:', error);
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
