import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/types';

const REFERRAL_REWARD_CREDITS = 15;

export async function POST(request: NextRequest) {
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

        let body: { referralCode?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: true, message: 'Invalid request body' },
                { status: STATUS.BAD_REQUEST },
            );
        }

        const { referralCode } = body;
        if (!referralCode || typeof referralCode !== 'string' || referralCode.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: true, message: 'referralCode is required' },
                { status: STATUS.BAD_REQUEST },
            );
        }

        const code = referralCode.trim().toUpperCase();

        // Find the referrer
        const referrerAccount = await prisma.account.findUnique({
            where: { referralCode: code },
        });

        if (!referrerAccount) {
            return NextResponse.json(
                { success: false, error: true, message: 'Invalid referral code' },
                { status: STATUS.BAD_REQUEST },
            );
        }

        // Find claimer
        const claimerAccount = await prisma.account.findUnique({ where: { userId } });

        if (!claimerAccount) {
            return NextResponse.json(
                { success: false, error: true, message: 'Account not found' },
                { status: STATUS.NOT_FOUND },
            );
        }

        // Self-referral guard
        if (claimerAccount.id === referrerAccount.id) {
            return NextResponse.json(
                { success: false, error: true, message: 'You cannot use your own referral code' },
                { status: STATUS.BAD_REQUEST },
            );
        }

        // Already claimed guard
        if (claimerAccount.referralRewarded || claimerAccount.referredById) {
            return NextResponse.json(
                { success: false, error: true, message: 'You have already used a referral code' },
                { status: STATUS.BAD_REQUEST },
            );
        }

        // Atomic reward transaction
        await prisma.$transaction([
            prisma.account.update({
                where: { id: claimerAccount.id },
                data: {
                    creditsRemaining: { increment: REFERRAL_REWARD_CREDITS },
                    referralRewarded: true,
                    referredById: referrerAccount.id,
                },
            }),
            prisma.account.update({
                where: { id: referrerAccount.id },
                data: {
                    creditsRemaining: { increment: REFERRAL_REWARD_CREDITS },
                },
            }),
        ]);

        return NextResponse.json(
            {
                success: true,
                error: false,
                message: `Referral code applied! ${REFERRAL_REWARD_CREDITS} credits added to your account.`,
            },
            { status: STATUS.OK },
        );
    } catch (error) {
        console.error('[REFERRAL CLAIM] Error:', error);
        return NextResponse.json(
            { success: false, error: true, message: 'Error claiming referral code' },
            { status: STATUS.INTERNAL_SERVER_ERROR },
        );
    }
}
