import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // 1. Find IDs of meetings that have more than 5 requests
    const meetingIdsResult = await prisma.request.groupBy({
      by: ['meetingId'],
      where: {
        Meeting: {
          userId,
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const meetingIds = meetingIdsResult.map((r) => r.meetingId);

    // 2. Fetch paginated meetings and total count using the identified IDs
    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where: {
          userId,
          id: { in: meetingIds },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { Request: true },
          },
        },
      }),
      prisma.meeting.count({
        where: {
          userId,
          id: { in: meetingIds },
        },
      }),
    ]);


    return NextResponse.json(
      {
        success: true,
        error: false,
        message: 'Meetings fetched successfully',
        data: {
          meetings,
          total,
          page,
          limit,
        },
      },
      { status: STATUS.OK },
    );
  } catch (error) {
    console.error('[MEETINGS] Error fetching meetings:', error);
    return NextResponse.json(
      { success: false, error: true, message: 'error' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
