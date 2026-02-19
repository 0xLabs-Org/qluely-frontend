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

    const [meetings, total] = await Promise.all([
  prisma.meeting.findMany({
    where: {
      userId,
      Request: {
        some: {}, // at least one related Request exists
      },
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
      Request: {
        some: {},
      },
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
      { success: false, error: true, message: 'Internal server error' },
      { status: STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
