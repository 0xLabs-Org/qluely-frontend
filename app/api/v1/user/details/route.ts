import { UserDetails } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('User details proxy: Received request');
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      console.error('User details proxy: BACKEND_API_URL not configured');
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

    console.log('User details proxy: Backend URL:', backendUrl);

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

    console.log(
      'User details proxy: Making request to backend:',
      `${backendUrl}/api/v1/user/details`,
    );

    // Make the proxy request to the backend
    const response = await fetch(`${backendUrl}/api/v1/user/details`, {
      method: 'GET',
      headers,
    });

    const responseData = await response.json();
    console.log('User details proxy: Backend response status:', response.status);
    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'user details fetched',
        data: responseData.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('User details proxy: Error:', error);

    // Check if it's a connection error
    const cause = error instanceof TypeError ? (error.cause as { code?: string }) : null;
    const isConnectionError =
      error instanceof TypeError &&
      (error.message === 'fetch failed' || cause?.code === 'ECONNREFUSED');

    const message = isConnectionError
      ? 'Backend server is not reachable. Please ensure the backend is running.'
      : 'Failed to proxy request to backend';

    return NextResponse.json(
      {
        success: false,
        error: true,
        message,
        data: null,
      },
      { status: 503 },
    );
  }
}
