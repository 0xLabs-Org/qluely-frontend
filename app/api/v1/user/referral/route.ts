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
        } catch {
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

        const account = await prisma.account.findUnique({
            where: { userId },
            select: {
                referralCode: true,
                referralRewarded: true,
                referredById: true,
                _count: {
                    select: { other_Account: true },
                },
            },
        });

        if (!account) {
            return NextResponse.json(
                { success: false, error: true, message: 'Account not found' },
                { status: STATUS.NOT_FOUND },
            );
        }

        return NextResponse.json(
            {
                success: true,
                error: false,
                message: 'referral info fetched',
                data: {
                    referralCode: account.referralCode,
                    referralCount: account._count.other_Account,
                    referralRewarded: account.referralRewarded,
                    hasUsedReferral: !!account.referredById,
                },
            },
            { status: STATUS.OK },
        );
    } catch (error) {
        console.error('[REFERRAL] Error fetching referral info:', error);
        return NextResponse.json(
            { success: false, error: true, message: 'Error fetching referral info' },
            { status: STATUS.INTERNAL_SERVER_ERROR },
        );
    }
}
