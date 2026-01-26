import { NextRequest, NextResponse } from 'next/server';

type OnboardingRequest = {
    role: string;
    useCases: string[];
};

export async function POST(request: NextRequest) {
    try {
        console.log('Onboarding complete proxy: Received request');
        const backendUrl = process.env.BACKEND_API_URL;

        if (!backendUrl) {
            console.error('Onboarding complete proxy: BACKEND_API_URL not configured');
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

        console.log('Onboarding complete proxy: Backend URL:', backendUrl);

        // Get the request body
        const body = await request.json();
        console.log('Onboarding complete proxy: Request body:', body);

        // Validate request body
        if (!body.role || typeof body.role !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: true,
                    message: 'Missing or invalid role',
                    data: null,
                },
                { status: 400 },
            );
        }

        if (!body.useCases || !Array.isArray(body.useCases) || body.useCases.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: true,
                    message: 'Missing or invalid use cases',
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
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: true,
                    message: 'Missing or invalid authorization token',
                    data: null,
                },
                { status: 401 },
            );
        }

        headers['authorization'] = authHeader;

        // Set content-type if not present
        if (!headers['content-type']) {
            headers['content-type'] = 'application/json';
        }

        console.log(
            'Onboarding complete proxy: Making request to backend:',
            `${backendUrl}/api/v1/onboarding/complete`,
        );

        // Make the proxy request to the backend
        const response = await fetch(`${backendUrl}/api/v1/onboarding/complete`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        console.log('Onboarding complete proxy: Backend response status:', response.status);
        console.log(
            'Onboarding complete proxy: Response content-type:',
            response.headers.get('content-type'),
        );

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.log('Onboarding complete proxy: Non-JSON response:', textResponse.substring(0, 200));
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
            console.error('Onboarding complete proxy: JSON parse error:', parseError);
            console.log('Onboarding complete proxy: Raw response:', textResponse.substring(0, 200));
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

        console.log('Onboarding complete proxy: Backend response data:', {
            success: responseData.success,
        });

        // Return the backend response with consistent format
        if (response.ok && responseData.success) {
            return NextResponse.json(
                {
                    success: true,
                    error: false,
                    message: responseData.message || 'Onboarding completed successfully',
                    data: responseData.data,
                },
                { status: response.status },
            );
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: true,
                    message: responseData.message || 'Onboarding completion failed',
                    data: responseData.data || null,
                },
                { status: response.status },
            );
        }
    } catch (error) {
        console.error('Onboarding complete proxy error:', error);
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
