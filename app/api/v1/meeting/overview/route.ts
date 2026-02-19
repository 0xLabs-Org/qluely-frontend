import { NextRequest, NextResponse } from 'next/server';
import { STATUS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const body = await request.json();
    const { meetingId } = body;

    if (!meetingId) {
      return NextResponse.json(
        { success: false, error: true, message: 'meetingId is required' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    const response = await fetch(`${backendUrl}/api/v1/meeting/overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({ meetingId }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[MEETING OVERVIEW PROXY] Error:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Internal server error' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
