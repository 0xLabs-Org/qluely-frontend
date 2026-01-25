import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Get detail: Received request');

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Authorization token required',
          data: null,
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Decode JWT token to extract userId
    let userId: string;
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      userId = payload.userId || payload.id;
      if (!userId) {
        throw new Error('User ID not found in token');
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: 'Invalid token',
          data: null,
        },
        { status: 401 },
      );
    }

    // Get the Detail record
    const detail = await prisma.detail.findUnique({
      where: { userId },
    });

    console.log('Get detail: Found detail:', detail);

    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'Detail fetched successfully',
        data: detail,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get detail error:', error);
    return NextResponse.json(
      {
        success: false,
        error: true,
        message: 'Failed to fetch detail',
        data: null,
      },
      { status: 500 },
    );
  }
}
