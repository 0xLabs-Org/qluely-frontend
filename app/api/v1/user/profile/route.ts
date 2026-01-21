import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('User profile proxy: Received request');
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      console.error('User profile proxy: BACKEND_API_URL not configured');
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

    console.log('User profile proxy: Backend URL:', backendUrl);

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

    console.log('User profile proxy: Making request to backend:', `${backendUrl}/api/v1/refresh`);

    // Make the proxy request to the backend
    const response = await fetch(`${backendUrl}/api/v1/refresh`, {
      method: 'GET',
      headers,
    });

    const responseText = await response.text();
    console.log('User profile proxy: Backend response status:', response.status);
    console.log(
      'User profile proxy: Backend response headers:',
      Object.fromEntries(response.headers.entries()),
    );
    console.log(
      'User profile proxy: Backend response body (first 500 chars):',
      responseText.substring(0, 500),
    );

    // Check if response looks like HTML (common error response)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error(
        'User profile proxy: Backend returned HTML instead of JSON - likely endpoint not found or server error',
      );
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: `Backend endpoint not found or returned HTML (status: ${response.status}). The /api/v1/user/profile endpoint may not exist on the backend server.`,
          data: null,
        },
        { status: response.status || 502 },
      );
    }

    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('User profile proxy: Failed to parse backend response as JSON:', parseError);
      console.error(
        'User profile proxy: Response content type:',
        response.headers.get('content-type'),
      );
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: `Invalid JSON response from backend. Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`,
          data: null,
        },
        { status: 500 },
      );
    }

    // Return standardized response format
    if (response.ok) {
      return NextResponse.json(
        {
          success: true,
          error: false,
          message: responseData.message || 'User profile fetched successfully',
          data: responseData.data || responseData,
        },
        { status: response.status },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: responseData.message || 'Failed to fetch user profile',
          data: null,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('User profile proxy: Error:', error);
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
