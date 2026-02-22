import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS, UserDetails as UserDetailsType } from '@/lib/types';
import { withCache } from '@/lib/cache';
const pdf = require('pdf-parse');

// Cached fetcher for user details
const getCachedUserDetails = (userId: string) =>
  withCache(
    async () => {
      console.log('[CACHE] Fetching user details from DB for', userId);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          account: true,
        },
      });

      if (!user) return null;

      const account = user.account;
      return {
        plan: (account?.plan as any) ?? 'FREE',
        period: (account?.period as any) ?? null,
        planStartedAt: account?.planStartedAt ?? null,
        planExpiresAt: account?.planExpiresAt ?? null,
        creditsRemaining: account?.creditsRemaining ?? 0,
        creditsUsed: account?.creditsUsed ?? 0,
        imageCredits: account?.imageCredits ?? 0,
        audioCredits: account?.audioCredits ?? 0,
      } as UserDetailsType;
    },
    [`user-details-${userId}`],
    [`user:${userId}`, 'user-details'],
    60 * 60 // Cache for 1 hour
  )();

export async function GET(request: NextRequest) {
  try {
    console.log('[USER] User details request received');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    } catch (err) {
      console.log('[USER] Token verification failed', err);
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const details = await getCachedUserDetails(userId);

    if (!details) {
      return NextResponse.json(
        { success: false, error: true, message: 'details not found' },
        { status: STATUS.BAD_REQUEST },
      );
    }

    return NextResponse.json(
      { success: true, error: false, message: 'details fetched', data: details },
      { status: STATUS.OK },
    );
  } catch (error) {
    console.error('[USER] Error fetching user details:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'error while fetching user details' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[USER] POST received for proxying extracted text');
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }
    const token = authHeader.replace('Bearer ', '');

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || '');
    } catch (err) {
      console.log('[USER] Token verification failed', err);
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const userId = decoded?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: true, message: 'Unauthorized' },
        { status: STATUS.UNAUTHORIZED },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: true, message: 'No file provided or invalid file' },
        { status: STATUS.BAD_REQUEST }
      );
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf' && file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: true, message: 'Only PDF files are supported' },
        { status: STATUS.BAD_REQUEST }
      );
    }

    // Parse the PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let extractedText = '';
    try {
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } catch (pdfErr) {
      console.error('[USER] Error parsing PDF', pdfErr);
      return NextResponse.json(
        { success: false, error: true, message: 'Failed to extract text from PDF' },
        { status: STATUS.BAD_REQUEST }
      );
    }

    // Proxy the extracted text to backend
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
    try {
      const response = await fetch(`${backendUrl}/api/v1/user/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: extractedText }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return NextResponse.json(
          data,
          { status: response.status }
        );
      }

      return NextResponse.json(
        { success: true, error: false, message: 'Successfully parsed and proxied text to backend', data },
        { status: STATUS.OK }
      );
    } catch (fetchErr) {
      console.error('[USER] Failed to proxy text to backend:', fetchErr);
      return NextResponse.json(
        { success: false, error: true, message: 'Proxy forwarding failed' },
        { status: STATUS.INTERNAL_SERVER_ERROR }
      );
    }

  } catch (error) {
    console.error('[USER] POST handler error:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'Server error processing file' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
